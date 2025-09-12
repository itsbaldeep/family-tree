"use client"

import PartialDateInput from '@/components/PartialDateInput'
import { IMarriage, IPerson } from '@/lib/models'
import { formatPartialDate } from '@/lib/utils'
import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'


// Helper function to get person name by ID
function getPersonName(persons: IPerson[], id: string): string {
    const person = persons.find(p => p.id === id)
    return person?.name || id
}

interface DeleteConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, title, message }: DeleteConfirmModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                    {title}
                                </Dialog.Title>
                                <p className="text-gray-600 mb-6">{message}</p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            onConfirm()
                                            onClose()
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export function ManageView() {
    const [persons, setPersons] = useState<IPerson[]>([])
    const [marriages, setMarriages] = useState<IMarriage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Modal states
    const [editingPerson, setEditingPerson] = useState<Partial<IPerson> | null>(null)
    const [editingMarriage, setEditingMarriage] = useState<Partial<IMarriage> | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{
        type: 'person' | 'marriage'
        id: string
        name: string
    } | null>(null)

    // Search and pagination
    const [personSearch, setPersonSearch] = useState('')
    const [marriageSearch, setMarriageSearch] = useState('')
    const [personsPage, setPersonsPage] = useState(1)
    const [marriagesPage, setMarriagesPage] = useState(1)
    const itemsPerPage = 10

    // Load data on mount
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [personsRes, marriagesRes] = await Promise.all([
                fetch('/api/persons'),
                fetch('/api/marriages')
            ])

            if (!personsRes.ok || !marriagesRes.ok) {
                if (personsRes.status == 401) {
                    window.location.href = '/login'
                    return
                }
                throw new Error('Failed to load data')
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

    // Person CRUD operations
    const handleAddPerson = () => {
        setEditingPerson({})
    }

    const handleEditPerson = (person: IPerson) => {
        setEditingPerson(person)
    }

    const savePerson = async (person: Partial<IPerson>) => {
        try {
            const isNew = !person.id
            const response = await fetch('/api/persons', {
                method: isNew ? 'POST' : 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(person),
            })

            if (!response.ok) {
                throw new Error('Failed to save person')
            }

            const savedPerson = await response.json()

            if (isNew) {
                setPersons(prev => [...prev, savedPerson])
            } else {
                setPersons(prev => prev.map(p => p.id === savedPerson.id ? savedPerson : p))
            }

            setEditingPerson(null)
            loadData()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save person')
        }
    }

    const deletePerson = async (id: string) => {
        try {
            const response = await fetch(`/api/persons?id=${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete person')
            }

            setPersons(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete person')
        }
    }

    // Marriage CRUD operations
    const handleAddMarriage = () => {
        setEditingMarriage({
            spouses: ['', '']
        })
    }

    const handleEditMarriage = (marriage: IMarriage) => {
        setEditingMarriage(marriage)
    }

    const saveMarriage = async (marriage: Partial<IMarriage>) => {
        try {
            // Validate spouses
            if (!marriage.spouses?.[0] || !marriage.spouses?.[1]) {
                alert('Both spouses are required')
                return
            }

            const isNew = !marriage.id
            const response = await fetch('/api/marriages', {
                method: isNew ? 'POST' : 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(marriage),
            })

            if (!response.ok) {
                throw new Error('Failed to save marriage')
            }

            const savedMarriage = await response.json()

            if (isNew) {
                setMarriages(prev => [...prev, savedMarriage])
            } else {
                setMarriages(prev => prev.map(m => m.id === savedMarriage.id ? savedMarriage : m))
            }

            setEditingMarriage(null)
            loadData()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save marriage')
        }
    }

    const deleteMarriage = async (id: string) => {
        try {
            const response = await fetch(`/api/marriages?id=${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                throw new Error('Failed to delete marriage')
            }

            setMarriages(prev => prev.filter(m => m.id !== id))
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete marriage')
        }
    }

    // Filter and pagination
    const filteredPersons = persons.filter(person =>
        person.name.toLowerCase().includes(personSearch.toLowerCase()) ||
        person.birthPlace?.toLowerCase().includes(personSearch.toLowerCase()) ||
        person.phone?.includes(personSearch)
    )

    const filteredMarriages = marriages.filter(marriage => {
        const spouse1Name = getPersonName(persons, marriage.spouses[0])
        const spouse2Name = getPersonName(persons, marriage.spouses[1])
        const searchLower = marriageSearch.toLowerCase()
        return (
            spouse1Name.toLowerCase().includes(searchLower) ||
            spouse2Name.toLowerCase().includes(searchLower) ||
            marriage.place?.toLowerCase().includes(searchLower)
        )
    })

    const paginatedPersons = filteredPersons.slice(
        (personsPage - 1) * itemsPerPage,
        personsPage * itemsPerPage
    )

    const paginatedMarriages = filteredMarriages.slice(
        (marriagesPage - 1) * itemsPerPage,
        marriagesPage * itemsPerPage
    )

    const totalPersonPages = Math.ceil(filteredPersons.length / itemsPerPage)
    const totalMarriagePages = Math.ceil(filteredMarriages.length / itemsPerPage)

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading family data...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-4xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-gray-900">Family Tree Management</h1>
                        </div>
                        <nav className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="text-primary-600 hover:text-primary-800 font-medium"
                            >
                                ← View Family Tree
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-8">
                    {/* Persons Section */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Persons ({filteredPersons.length})</h2>
                                    <p className="text-sm text-gray-600">Manage family members and their details</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder="Search persons..."
                                        value={personSearch}
                                        onChange={(e) => {
                                            setPersonSearch(e.target.value)
                                            setPersonsPage(1)
                                        }}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <button
                                        onClick={handleAddPerson}
                                        className="px-4 py-2 bg-primary-600 rounded-md hover:bg-primary-700 transition-colors font-medium"
                                    >
                                        + Add Person
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Birth</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Death</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedPersons.map((person) => (
                                        <tr key={person.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{person.name}</div>
                                                    <div className="text-sm text-gray-500">{person.birthPlace}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${person.gender === 'male' ? 'bg-blue-100 text-blue-800' :
                                                    person.gender === 'female' ? 'bg-pink-100 text-pink-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {person.gender || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatPartialDate(person.dob)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {person.deathDate ? formatPartialDate(person.deathDate) : '—'}
                                                {person.deathPlace && <div className="text-xs text-gray-500">{person.deathPlace}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {person.phone || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEditPerson(person)}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm({
                                                        type: 'person',
                                                        id: person.id,
                                                        name: person.name
                                                    })}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Persons Pagination */}
                        {totalPersonPages > 1 && (
                            <div className="px-6 py-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {(personsPage - 1) * itemsPerPage + 1} to {Math.min(personsPage * itemsPerPage, filteredPersons.length)} of {filteredPersons.length} results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPersonsPage(prev => Math.max(1, prev - 1))}
                                            disabled={personsPage === 1}
                                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-gray-700">
                                            Page {personsPage} of {totalPersonPages}
                                        </span>
                                        <button
                                            onClick={() => setPersonsPage(prev => Math.min(totalPersonPages, prev + 1))}
                                            disabled={personsPage === totalPersonPages}
                                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Marriages Section */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Marriages ({filteredMarriages.length})</h2>
                                    <p className="text-sm text-gray-600">Manage marriages and family relationships</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder="Search marriages..."
                                        value={marriageSearch}
                                        onChange={(e) => {
                                            setMarriageSearch(e.target.value)
                                            setMarriagesPage(1)
                                        }}
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                    <button
                                        onClick={handleAddMarriage}
                                        className="px-4 py-2 bg-primary-600 rounded-md hover:bg-primary-700 transition-colors font-medium"
                                    >
                                        + Add Marriage
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spouses</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Place</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Children</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedMarriages.map((marriage) => (
                                        <tr key={marriage.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {getPersonName(persons, marriage.spouses[0])} & {getPersonName(persons, marriage.spouses[1])}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatPartialDate(marriage.date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {marriage.place || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${marriage.status === 'married' ? 'bg-green-100 text-green-800' :
                                                    marriage.status === 'divorced' ? 'bg-red-100 text-red-800' :
                                                        marriage.status === 'widowed' ? 'bg-gray-100 text-gray-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {marriage.status || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {marriage.children && marriage.children.length > 0 ? (
                                                    <div className="space-y-1">
                                                        {marriage.children.map(childId => (
                                                            <div key={childId} className="text-xs">
                                                                {getPersonName(persons, childId)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <button
                                                    onClick={() => handleEditMarriage(marriage)}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm({
                                                        type: 'marriage',
                                                        id: marriage.id,
                                                        name: `${getPersonName(persons, marriage.spouses[0])} & ${getPersonName(persons, marriage.spouses[1])}`
                                                    })}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Marriages Pagination */}
                        {totalMarriagePages > 1 && (
                            <div className="px-6 py-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing {(marriagesPage - 1) * itemsPerPage + 1} to {Math.min(marriagesPage * itemsPerPage, filteredMarriages.length)} of {filteredMarriages.length} results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setMarriagesPage(prev => Math.max(1, prev - 1))}
                                            disabled={marriagesPage === 1}
                                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-sm text-gray-700">
                                            Page {marriagesPage} of {totalMarriagePages}
                                        </span>
                                        <button
                                            onClick={() => setMarriagesPage(prev => Math.min(totalMarriagePages, prev + 1))}
                                            disabled={marriagesPage === totalMarriagePages}
                                            className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Person Edit Modal */}
            <Transition appear show={!!editingPerson} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setEditingPerson(null)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-6">
                                        {editingPerson?.id ? 'Edit Person' : 'Add Person'}
                                    </Dialog.Title>

                                    {editingPerson && (
                                        <div className="space-y-6 overflow-y-auto">
                                            {/* Basic Information */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Full Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={editingPerson.name}
                                                        onChange={(e) => setEditingPerson({ ...editingPerson, name: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                        placeholder="Enter full name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Gender
                                                    </label>
                                                    <select
                                                        value={editingPerson.gender ?? ""}
                                                        onChange={(e) => setEditingPerson({
                                                            ...editingPerson,
                                                            gender: e.target.value as IPerson['gender']
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    >
                                                        <option value="">Select gender</option>
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Birth Information */}
                                            <PartialDateInput
                                                label="Date of Birth"
                                                value={editingPerson.dob}
                                                onChange={(val) => setEditingPerson({ ...editingPerson, dob: val })}
                                            />

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Birth Place
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingPerson.birthPlace ?? ""}
                                                    onChange={(e) => setEditingPerson({ ...editingPerson, birthPlace: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    placeholder="City, State/Province, Country"
                                                />
                                            </div>

                                            {/* Death Information */}
                                            <PartialDateInput
                                                label="Date of Death"
                                                value={editingPerson.deathDate}
                                                onChange={(val) => setEditingPerson({ ...editingPerson, deathDate: val })}
                                            />

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Death Place
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editingPerson.deathPlace ?? ""}
                                                    onChange={(e) => setEditingPerson({ ...editingPerson, deathPlace: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    placeholder="City, State/Province, Country"
                                                />
                                            </div>

                                            {/* Contact Information */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={editingPerson.phone ?? ""}
                                                    onChange={(e) => setEditingPerson({ ...editingPerson, phone: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                        <button
                                            onClick={() => setEditingPerson(null)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => editingPerson && savePerson(editingPerson)}
                                            className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                                        >
                                            {editingPerson?.id ? 'Update' : 'Add'} Person
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Marriage Edit Modal */}
            <Transition appear show={!!editingMarriage} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setEditingMarriage(null)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-6">
                                        {editingMarriage?.id ? 'Edit Marriage' : 'Add Marriage'}
                                    </Dialog.Title>

                                    {editingMarriage && editingMarriage.spouses && (
                                        <div className="space-y-6 overflow-y-auto">
                                            {/* Spouses */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Spouse 1 *
                                                    </label>
                                                    <select
                                                        value={editingMarriage.spouses[0]}
                                                        onChange={(e) => setEditingMarriage({
                                                            ...editingMarriage,
                                                            spouses: [e.target.value, editingMarriage.spouses?.[1] || '']
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    >
                                                        <option value="">Select person</option>
                                                        {persons.map(person => (
                                                            <option key={person.id} value={person.id}>
                                                                {person.name} ({person.id})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Spouse 2 *
                                                    </label>
                                                    <select
                                                        value={editingMarriage.spouses[1]}
                                                        onChange={(e) => setEditingMarriage({
                                                            ...editingMarriage,
                                                            spouses: [editingMarriage.spouses?.[0] || '', e.target.value]
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    >
                                                        <option value="">Select person</option>
                                                        {persons.map(person => (
                                                            <option key={person.id} value={person.id}>
                                                                {person.name} ({person.id})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Marriage Date */}
                                            <PartialDateInput
                                                label="Marriage Date"
                                                value={editingMarriage.date}
                                                onChange={(val) => setEditingMarriage({ ...editingMarriage, date: val })}
                                            />

                                            {/* Place and Status */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Marriage Place
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editingMarriage.place ?? ""}
                                                        onChange={(e) => setEditingMarriage({ ...editingMarriage, place: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                        placeholder="City, State/Province, Country"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Status
                                                    </label>
                                                    <select
                                                        value={editingMarriage.status ?? ""}
                                                        onChange={(e) => setEditingMarriage({
                                                            ...editingMarriage,
                                                            status: e.target.value as IMarriage['status']
                                                        })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                    >
                                                        <option value="">Select status</option>
                                                        <option value="married">Married</option>
                                                        <option value="divorced">Divorced</option>
                                                        <option value="widowed">Widowed</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Children */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Children
                                                </label>
                                                <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                                                    <div className="mb-3">
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            Select children from existing persons:
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                                            {persons.filter(p => !editingMarriage.spouses?.some(sp => sp === p.id)).map(person => {
                                                                const isSelected = editingMarriage.children?.includes(person.id) || false
                                                                return (
                                                                    <label key={person.id} className="flex items-center gap-2 text-sm">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isSelected}
                                                                            onChange={(e) => {
                                                                                const currentChildren = editingMarriage.children || []
                                                                                if (e.target.checked) {
                                                                                    setEditingMarriage({
                                                                                        ...editingMarriage,
                                                                                        children: [...currentChildren, person.id]
                                                                                    })
                                                                                } else {
                                                                                    setEditingMarriage({
                                                                                        ...editingMarriage,
                                                                                        children: currentChildren.filter(id => id !== person.id)
                                                                                    })
                                                                                }
                                                                            }}
                                                                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                                                        />
                                                                        <span>{person.name} ({person.id})</span>
                                                                    </label>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="border-t pt-3">
                                                        <div className="text-sm text-gray-600 mb-2">
                                                            Or enter child IDs manually (comma-separated):
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={editingMarriage.children?.join(', ') ?? ""}
                                                            onChange={(e) => {
                                                                const childIds = e.target.value.split(',').map(id => id.trim()).filter(id => id)
                                                                setEditingMarriage({
                                                                    ...editingMarriage,
                                                                    children: childIds.length > 0 ? childIds : undefined
                                                                })
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                                            placeholder="e.g. p1, p2, p3"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                        <button
                                            onClick={() => setEditingMarriage(null)}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => editingMarriage && saveMarriage(editingMarriage)}
                                            className="px-4 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 rounded-md transition-colors"
                                        >
                                            {editingMarriage?.id ? 'Update' : 'Add'} Marriage
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <DeleteConfirmModal
                    isOpen={!!deleteConfirm}
                    onClose={() => setDeleteConfirm(null)}
                    onConfirm={() => {
                        if (deleteConfirm.type === 'person') {
                            deletePerson(deleteConfirm.id)
                        } else {
                            deleteMarriage(deleteConfirm.id)
                        }
                    }}
                    title={`Delete ${deleteConfirm.type}`}
                    message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
                />
            )}
        </div>
    )
}
