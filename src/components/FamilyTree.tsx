"use client"

import { IMarriage, IPerson } from "@/lib/models";
import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Edge, Node } from "react-flow-renderer";

/** ---------- Helpers & types ---------- **/
type Position = { x: number; y: number }

function formatPartialDate(d?: {
    year?: number
    month?: number
    day?: number
    approximate?: boolean
    range?: { from?: string; to?: string }
    notes?: string
}) {
    if (!d) return ""
    if (d.range?.from || d.range?.to) {
        const from = d.range?.from ?? "?"
        const to = d.range?.to ?? "?"
        return `~${from}–${to}${d.approximate ? " (approx)" : ""}`
    }
    const { year, month, day } = d
    if (year && month && day) return `${day}/${month}/${year}${d.approximate ? " (approx)" : ""}`
    if (month && year) return `${month}/${year}${d.approximate ? " (approx)" : ""}`
    if (year) return `${year}${d.approximate ? " (approx)" : ""}`
    return d.notes ?? ""
}

/** ---------- Layout & rendering component (refactored) ---------- **/
export default function FamilyTree() {
    const [persons, setPersons] = useState<IPerson[]>([])
    const [marriages, setMarriages] = useState<IMarriage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load data from API
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const [personsRes, marriagesRes] = await Promise.all([
                    fetch('/api/persons'),
                    fetch('/api/marriages')
                ])

                if (!personsRes.ok || !marriagesRes.ok) {
                    throw new Error('Failed to load family data')
                }

                const [personsData, marriagesData] = await Promise.all([
                    personsRes.json(),
                    marriagesRes.json()
                ])

                setPersons(personsData)
                setMarriages(marriagesData)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [])

    const { nodes, edges } = useMemo(() => {
        const nodes: Node[] = []
        const edges: Edge[] = []

        // quick maps
        const marriageMap = Object.fromEntries(marriages.map((m) => [m._id, m]))
        const spouseToMarriageIds = new Map<string, string[]>()
        marriages.forEach((m) => {
            m.spouses.forEach((s) => {
                spouseToMarriageIds.set(s, [...(spouseToMarriageIds.get(s) ?? []), m._id])
            })
        })

        // detect root marriages (marriages whose spouses are NOT children of any other marriage)
        const marriageHasParent = new Map<string, boolean>()
        marriages.forEach((m) => marriageHasParent.set(m._id, false))
        marriages.forEach((m) => {
            m.children?.forEach((childId) => {
                // any marriage where childId is a spouse is considered a child marriage; mark those marriages as having a parent
                const childMarriageIds = spouseToMarriageIds.get(childId) ?? []
                childMarriageIds.forEach((mid) => marriageHasParent.set(mid, true))
            })
        })
        const rootMarriages = marriages.filter((m) => !marriageHasParent.get(m._id))

        // positions container
        const nodePositions: Record<string, Position> = {}

        // spacing tuning (tweak these to taste)
        const hSpacing = 150 // horizontal unit between leaf nodes
        const vSpacing = 150 // vertical spacing between levels
        const spouseGap = 60 // horizontal gap between spouses

        // prevent infinite loops on cycles from second marriages
        const visitedMarriages = new Set<string>()

        // Recursive layout:
        // returns { centerX, nextX } where nextX is the next available x after this subtree
        function layoutMarriage(marriageId: string, depth: number, xOffset: number): { centerX: number; nextX: number } {
            if (!marriageMap[marriageId]) return { centerX: xOffset, nextX: xOffset + hSpacing }
            if (visitedMarriages.has(marriageId)) {
                // already placed elsewhere (second marriage) — reserve minimal width to avoid overlap
                return { centerX: xOffset, nextX: xOffset + hSpacing }
            }

            visitedMarriages.add(marriageId)
            const m = marriageMap[marriageId]

            let currentX = xOffset
            const childCenters: number[] = []

            // layout each child: if child has its own marriage, recursively layout that marriage as a subtree
            m.children?.forEach((cid: string) => {
                const childMarriageIds = spouseToMarriageIds.get(cid) ?? []
                // prefer an unvisited child marriage (if multiple), otherwise treat as leaf
                const childMarriageId = childMarriageIds.find((mid) => !visitedMarriages.has(mid))

                if (childMarriageId) {
                    const { centerX: childCenter, nextX } = layoutMarriage(childMarriageId, depth + 2, currentX)
                    childCenters.push(childCenter)
                    currentX = nextX
                } else {
                    // leaf child (no deeper marriage), place as a simple node
                    nodePositions[cid] = { x: currentX, y: (depth + 1) * vSpacing }
                    childCenters.push(currentX)
                    currentX += hSpacing
                }
            })

            // if no children, we will place the marriage at currentX (so spouses and marriage occupy the next chunk)
            let centerX = currentX
            if (childCenters.length > 0) {
                const minX = Math.min(...childCenters)
                const maxX = Math.max(...childCenters)
                centerX = (minX + maxX) / 2
            }

            // marriage node position
            nodePositions[`marriage-${m._id}`] = { x: centerX, y: depth * vSpacing }

            // spouses positioned side-by-side above marriage node
            const [s1, s2] = m.spouses
            nodePositions[s1] = { x: centerX - spouseGap, y: (depth - 1) * vSpacing }
            nodePositions[s2] = { x: centerX + spouseGap, y: (depth - 1) * vSpacing }

            // compute nextX to ensure next sibling subtree starts to the right and avoids overlap
            const nextX = Math.max(currentX, centerX + spouseGap + hSpacing / 2)
            return { centerX, nextX }
        }

        // Layout all root marriages left-to-right
        let globalX = 0
        rootMarriages.forEach((rm) => {
            const { nextX } = layoutMarriage(rm._id, 1, globalX)
            globalX = nextX + hSpacing // small gutter between root subtrees
        })

        // After recursive pass, some persons might still not have positions (edge cases); place them in a fallback row
        // compute current extents
        const assignedXs = Object.values(nodePositions).map((p) => p.x)
        const maxAssignedX = assignedXs.length ? Math.max(...assignedXs) : 0
        let fallbackX = maxAssignedX + hSpacing

        persons.forEach((p) => {
            if (!nodePositions[p._id]) {
                // place them on top row (y = 0) after existing graph
                nodePositions[p._id] = { x: fallbackX, y: 0 }
                fallbackX += hSpacing
            }
        })

        // Build person nodes
        persons.forEach((p) => {
            const pos = nodePositions[p._id] ?? { x: 0, y: 0 }
            const dobStr = formatPartialDate(p.dob)
            const deathStr = formatPartialDate(p.deathDate)
            const lines = [
                p.name,
                dobStr ? `b. ${dobStr}` : undefined,
                p.birthPlace ? `${p.birthPlace}` : undefined,
                deathStr ? `d. ${deathStr}${p.deathPlace ? ` • ${p.deathPlace}` : ""}` : undefined,
                p.phone ? `☎ ${p.phone}` : undefined,
            ]
                .filter(Boolean)
                .join("\n")

            nodes.push({
                id: p._id,
                data: { label: lines },
                position: pos,
                // styling — contrasty colors: female hot-pink, male sea-green, other grey
                style: {
                    border: "2px solid #333",
                    borderRadius: 10,
                    padding: 8,
                    whiteSpace: "pre-line",
                    background: p.gender === "female" ? "#ff4da6" : p.gender === "male" ? "#2dd4bf" : "#c7d2fe",
                    color: "#02111a",
                    fontWeight: 600,
                    minWidth: 110,
                    textAlign: "center",
                },
            })
        })

        // Build marriages + edges
        marriages.forEach((m) => {
            const marriageNodeId = `marriage-${m._id}`
            const pos = nodePositions[marriageNodeId] ?? { x: 0, y: 0 }
            const dateStr = formatPartialDate(m.date)
            const label = [`⚭ ${dateStr || ""}`, m.place || "", m.status ? `(${m.status})` : ""].filter(Boolean).join("\n")

            nodes.push({
                id: marriageNodeId,
                data: { label },
                position: pos,
                style: {
                    minWidth: 60,
                    minHeight: 36,
                    borderRadius: 8,
                    border: "2px solid rgba(0,0,0,0.7)",
                    background: "#ffd166", // lemon/orange
                    color: "#2b2b2b",
                    textAlign: "center",
                    whiteSpace: "pre-line",
                    padding: 6,
                    fontSize: 12,
                    fontWeight: 700,
                },
            })

            // edges: spouse -> marriage
            m.spouses.forEach((sid) => {
                edges.push({
                    id: `${sid}-${marriageNodeId}`,
                    source: sid,
                    target: marriageNodeId,
                    animated: false,
                    style: { stroke: "#333", strokeWidth: 1.25 },
                })
            })

            // edges: marriage -> children
            m.children?.forEach((cid) => {
                edges.push({
                    id: `${marriageNodeId}-${cid}`,
                    source: marriageNodeId,
                    target: cid,
                    animated: true,
                    style: { stroke: "#333", strokeWidth: 1.25 },
                })
            })
        })

        return { nodes, edges }
    }, [persons, marriages])


    // Show loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading family tree...</p>
                </div>
            </div>
        )
    }


    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-full w-full bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="text-red-600 text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Family Tree</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        )
    }

    // render just the canvas (no minimap, no controls). fitView will scale to show the whole graph.
    return (
        <div className="w-full h-full">
            <ReactFlow nodes={nodes} edges={edges} fitView>
                <Background />
            </ReactFlow>
        </div>
    )
}
