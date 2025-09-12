import { IMarriage, IPerson } from '@/lib/models'
import { Dialog, Transition } from '@headlessui/react'
import { Dispatch, Fragment, SetStateAction } from 'react'
import PartialDateInput from '../partial-date-input'

interface Props {
    editingMarriage: Partial<IMarriage> | null
    persons: IPerson[]
    setEditingMarriage: Dispatch<SetStateAction<Partial<IMarriage> | null>>
    saveMarriage: (person: Partial<IMarriage>) => Promise<void>
}

export function MarriageModal({ editingMarriage, persons, setEditingMarriage, saveMarriage }: Props) {
    return (
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
    )
}