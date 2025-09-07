"use client"

import { IMarriage, IPerson } from "@/lib/models";
import { calculateAge, formatLifeSpan, formatPartialDate } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import ReactFlow, { Background, Edge, Node } from "react-flow-renderer";

type Position = { x: number; y: number }

const COLORS = {
    male: "#95cdf5",
    female: "#f8a8ec",
    other: "#c7d2fe",
    marriage: "#f9f789",
    text: "#222222",
    edge: "#333333"
}

export default function FamilyTree() {
    const [persons, setPersons] = useState<IPerson[]>([])
    const [marriages, setMarriages] = useState<IMarriage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const [personsRes, marriagesRes] = await Promise.all([
                    fetch('/api/persons'),
                    fetch('/api/marriages')
                ])
                if (!personsRes.ok || !marriagesRes.ok) throw new Error('Failed to load family data')

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
        const marriageMap = Object.fromEntries(marriages.map((m) => [m._id, m]))

        const spouseToMarriageIds = new Map<string, string[]>()
        marriages.forEach((m) => {
            m.spouses.forEach((s) => {
                spouseToMarriageIds.set(s, [...(spouseToMarriageIds.get(s) ?? []), m._id])
            })
        })

        // detect roots
        const marriageHasParent = new Map<string, boolean>()
        marriages.forEach((m) => marriageHasParent.set(m._id, false))
        marriages.forEach((m) => {
            m.children?.forEach((childId) => {
                const childMarriageIds = spouseToMarriageIds.get(childId) ?? []
                childMarriageIds.forEach((mid) => marriageHasParent.set(mid, true))
            })
        })
        const rootMarriages = marriages.filter((m) => !marriageHasParent.get(m._id))

        const nodePositions: Record<string, Position> = {}
        const hSpacing = 160
        const vSpacing = 80
        const visitedMarriages = new Set<string>()

        function dobToDate(p?: IPerson) {
            if (!p?.dob?.year) return null
            return new Date(p.dob.year, (p.dob.month ?? 1) - 1, p.dob.day ?? 1)
        }

        // Format spouse label with gender color + birth/death
        const formatSpouseLabel = (p: IPerson) => {
            const lifespan = formatLifeSpan(p.dob, p.deathDate)
            return `${p.name} (${calculateAge(p.dob, p.deathDate)})\n${lifespan}\n`
        }

        function layoutMarriage(marriageId: string, depth: number, xOffset: number): { centerX: number; nextX: number } {
            if (!marriageMap[marriageId]) return { centerX: xOffset, nextX: xOffset + hSpacing }
            if (visitedMarriages.has(marriageId)) return { centerX: xOffset, nextX: xOffset + hSpacing }

            visitedMarriages.add(marriageId)
            const m = marriageMap[marriageId]

            let currentX = xOffset
            const childCenters: number[] = []

            // sort children by DOB
            const sortedChildren = [...(m.children ?? [])].sort((a, b) => {
                const pa = persons.find(p => p._id === a)
                const pb = persons.find(p => p._id === b)
                const da = dobToDate(pa)
                const db = dobToDate(pb)
                if (!da && !db) return 0
                if (!da) return 1
                if (!db) return -1
                return da.getTime() - db.getTime()
            })

            sortedChildren.forEach((cid) => {
                const childMarriageIds = spouseToMarriageIds.get(cid) ?? []
                const childMarriageId = childMarriageIds.find((mid) => !visitedMarriages.has(mid))
                if (childMarriageId) {
                    const { centerX: childCenter, nextX } = layoutMarriage(childMarriageId, depth + 2, currentX)
                    childCenters.push(childCenter)
                    currentX = nextX
                } else {
                    nodePositions[cid] = { x: currentX, y: (depth + 1) * vSpacing }
                    childCenters.push(currentX)
                    currentX += hSpacing
                }
            })

            let centerX = currentX
            if (childCenters.length > 0) {
                const minX = Math.min(...childCenters)
                const maxX = Math.max(...childCenters)
                centerX = (minX + maxX) / 2
            }

            // spouse merged node
            const spouses = m.spouses
                .map(id => persons.find(p => p._id === id))
                .filter((p): p is IPerson => !!p)

            const spouseNodeId = `spouses-${m._id}`
            nodePositions[spouseNodeId] = { x: centerX, y: (depth - 1) * vSpacing }

            // Decide bloodline color (pick first spouse)
            const bloodSpouse = spouses[0]
            const baseColor =
                bloodSpouse?.gender === "male"
                    ? COLORS.male
                    : bloodSpouse?.gender === "female"
                        ? COLORS.female
                        : COLORS.other

            const lines = spouses.map(formatSpouseLabel).join("")

            nodes.push({
                id: spouseNodeId,
                data: { label: lines },
                position: nodePositions[spouseNodeId],
                style: {
                    border: "2px solid #333",
                    whiteSpace: "pre-line",
                    background: baseColor,
                    minWidth: 110,
                    textAlign: "center",
                    borderRadius: 10,
                    padding: 8,
                    fontSize: 9,
                    color: COLORS.text,
                    fontWeight: 600,
                },
            })

            // marriage node itself
            const marriageNodeId = `marriage-${m._id}`
            nodePositions[marriageNodeId] = { x: centerX, y: depth * vSpacing + 5 }
            const dateStr = formatPartialDate(m.date)
            const label = [`💍 ${dateStr || ""} (${calculateAge(m.date, {})})`].filter(Boolean).join("\n")

            nodes.push({
                id: marriageNodeId,
                data: { label },
                position: nodePositions[marriageNodeId],
                style: {
                    borderRadius: 8,
                    border: "2px solid rgba(0,0,0,0.7)",
                    background: COLORS.marriage,
                    color: COLORS.text,
                    textAlign: "center",
                    whiteSpace: "pre-line",
                    padding: 6,
                    fontSize: 9,
                    fontWeight: 600,
                },
            })

            // connect spouse node to marriage node
            edges.push({
                id: `${spouseNodeId}-${marriageNodeId}`,
                source: spouseNodeId,
                target: marriageNodeId,
                animated: false,
                style: { stroke: COLORS.edge, strokeWidth: 1.25 },
            })

            // edges: marriage -> children
            m.children?.forEach((cid) => {
                const childMarriageIds = spouseToMarriageIds.get(cid) ?? []
                const childMarriageId = childMarriageIds.find(mid => marriageMap[mid])
                const targetNodeId = childMarriageId ? `spouses-${childMarriageId}` : cid
                edges.push({
                    id: `${marriageNodeId}-${targetNodeId}`,
                    source: marriageNodeId,
                    target: targetNodeId,
                    animated: true,
                    style: { stroke: COLORS.edge, strokeWidth: 1.25 },
                })
            })

            const nextX = Math.max(currentX, centerX + hSpacing)
            return { centerX, nextX }
        }

        // layout roots
        let globalX = 0
        rootMarriages.forEach((rm) => {
            const { nextX } = layoutMarriage(rm._id, 1, globalX)
            globalX = nextX + hSpacing
        })

        // Build standalone person nodes
        persons.forEach((p) => {
            const isSpouse = marriages.some(m => m.spouses.includes(p._id))
            if (isSpouse) return
            const pos = nodePositions[p._id] ?? { x: 0, y: 0 }
            const lines = [
                `${p.name} (${calculateAge(p.dob, p.deathDate)})`,
                formatLifeSpan(p.dob, p.deathDate),
            ].filter(Boolean).join("\n")

            nodes.push({
                id: p._id,
                data: { label: lines },
                position: pos,
                style: {
                    border: "2px solid #333",
                    borderRadius: 10,
                    padding: 8,
                    whiteSpace: "pre-line",
                    background: p.gender === "female" ? COLORS.female : p.gender === "male" ? COLORS.male : COLORS.other,
                    color: COLORS.text,
                    fontSize: 9,
                    fontWeight: 600,
                    minWidth: 110,
                    textAlign: "center",
                },
            })
        })

        return { nodes, edges }
    }, [persons, marriages])

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

    return (
        <div className="w-full h-full">
            <ReactFlow nodes={nodes} edges={edges} fitView>
                <Background />
            </ReactFlow>
        </div>
    )
}
