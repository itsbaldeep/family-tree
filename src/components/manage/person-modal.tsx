import { EditingPerson, IMarriage, IPerson } from '@/lib/models'
import { Dialog, Transition } from '@headlessui/react'
import { Dispatch, Fragment, SetStateAction } from 'react'
import PartialDateInput from '../partial-date-input'

interface Props {
    editingPerson: EditingPerson | null
    setEditingPerson: Dispatch<SetStateAction<EditingPerson | null>>
    savePerson: (person: EditingPerson) => Promise<void>
    persons: IPerson[]
    marriages: IMarriage[]
}

export function PersonModal({ editingPerson, persons, marriages, setEditingPerson, savePerson }: Props) {
    return (
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

                                        {/* Parents Section */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Parents
                                            </label>
                                            <select
                                                value={editingPerson.parentMarriageId ?? ""}
                                                onChange={(e) =>
                                                    setEditingPerson({
                                                        ...editingPerson,
                                                        parentMarriageId: e.target.value || undefined,
                                                    })
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                            >
                                                <option value="">Select parents</option>
                                                {marriages.map((m) => {
                                                    const spouseNames = m.spouses
                                                        .map((sid) => {
                                                            const foundPerson = persons.find((p) => p.id === sid)
                                                            if (!foundPerson) {
                                                                return sid
                                                            }
                                                            return `${foundPerson?.name} (${foundPerson?.id})`
                                                        })
                                                        .join(" & ")
                                                    return (
                                                        <option key={m.id} value={m.id}>
                                                            {spouseNames}
                                                        </option>
                                                    )
                                                })}
                                            </select>
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
    )
}