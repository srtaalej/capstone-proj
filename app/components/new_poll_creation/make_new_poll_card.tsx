import {Fragment, useState} from 'react'
import {Dialog, DialogPanel, DialogTitle, Transition} from '@headlessui/react'
import { XMarkIcon} from '@heroicons/react/20/solid'

interface NewPollModalProps{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}
interface PollFormData{
    title:string;
    description: string;
    endDate: string;
    options: string[];
}
export default function NewPollModal({isOpen, setIsOpen}: NewPollModalProps) {
    const [formData, setFormData] = useState<PollFormData>({
        title: '',
        description: '',
        endDate: '',
        options: ['', ''] 
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData); //just for testing, this line should be saving the data in our database
        setIsOpen(false);
    };
    return (
        <Transition appear as={Fragment} show={isOpen}>
            <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
                <Transition as={Fragment} show={isOpen}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition>
                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition
                            as={Fragment}
                            show={isOpen}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div className="absolute right-0 top-0 pr-4 pt-4">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                                        onClick={() => setIsOpen(false)}
                                    >
                                         <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                                        <DialogTitle as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                                            Create New Poll
                                        </DialogTitle>
                                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                            <div>
                                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                    Poll Title
                                                </label>
                                                <input
                                                    type="text"
                                                    id="title"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                                    Description
                                                </label>
                                                <textarea
                                                    id="description"
                                                    rows={3}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                                                    End Date
                                                </label>
                                                <input
                                                    type="datetime-local"
                                                    id="endDate"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    value={formData.endDate}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Poll Options
                                                </label>
                                                {formData.options.map((option, index) => (
                                                    <input
                                                        key={index}
                                                        type="text"
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                        value={option}
                                                        onChange={(e) => {
                                                            const newOptions = [...formData.options];
                                                            newOptions[index] = e.target.value;
                                                            setFormData(prev => ({ ...prev, options: newOptions }));
                                                        }}
                                                        placeholder={`Option ${index + 1}`}
                                                        required
                                                    />
                                                ))}
                                            </div>

                                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                <button
                                                    type="submit"
                                                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                                                >
                                                    Create Poll
                                                </button>
                                                <button
                                                    type="button"
                                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </DialogPanel>
                        </Transition>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )   

}
    