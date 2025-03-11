import {Fragment, useState} from 'react'
import {Dialog, DialogPanel, DialogTitle, Transition} from '@headlessui/react'
import { XMarkIcon} from '@heroicons/react/20/solid'
import { PollFormData } from '@/app/types/poll'

interface NewPollModalProps{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export default function NewPollModal({isOpen, setIsOpen}: NewPollModalProps) {
    const [formData, setFormData] = useState<PollFormData>({
        title: '',
        description: '',
        endDate: '',
        options: ['', ''] 
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/polls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.title,
                    description: formData.description,
                    endDate: formData.endDate,
                    options: formData.options
                }),
            });

            if (response.ok) {
                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    endDate: '',
                    options: ['', '']
                });
                setIsOpen(false);
            } else {
                console.error('Failed to create poll');
            }
        } catch (error) {
            console.error('Error creating poll:', error);
        }
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, '']
        }));
    };

    const removeOption = (index: number) => {
        if (formData.options.length <= 2) return; // Maintain minimum 2 options
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <DialogPanel className="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                                <div className="absolute right-0 top-0 pr-4 pt-4">
                                    <button
                                        type="button"
                                        className="rounded-md text-gray-400 hover:text-gray-300"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
                                        <DialogTitle as="h3" className="text-base/7 font-semibold text-white">
                                            Create New Poll
                                        </DialogTitle>
                                        <p className="mt-1 text-sm/6 text-gray-400">
                                            Fill in the details below to create a new poll. All fields are required.
                                        </p>

                                        <form onSubmit={handleSubmit} className="mt-6 space-y-8">
                                            <div className="space-y-8">
                                                <div>
                                                    <label htmlFor="title" className="block text-sm/6 font-medium text-white">
                                                        Poll Title
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            type="text"
                                                            id="title"
                                                            required
                                                            className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                                            value={formData.title}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="description" className="block text-sm/6 font-medium text-white">
                                                        Description
                                                    </label>
                                                    <div className="mt-2">
                                                        <textarea
                                                            id="description"
                                                            rows={3}
                                                            required
                                                            className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                                            value={formData.description}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                        />
                                                    </div>
                                                    <p className="mt-2 text-sm/6 text-gray-400">
                                                        Write a clear description of what this poll is about.
                                                    </p>
                                                </div>

                                                <div>
                                                    <label htmlFor="endDate" className="block text-sm/6 font-medium text-white">
                                                        End Date
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            type="datetime-local"
                                                            id="endDate"
                                                            required
                                                            className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                                            value={formData.endDate}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm/6 font-medium text-white">
                                                        Poll Options
                                                    </label>
                                                    <div className="mt-2 space-y-3">
                                                        {formData.options.map((option, index) => (
                                                            <div key={index} className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                                                                    value={option}
                                                                    placeholder={`Option ${index + 1}`}
                                                                    onChange={(e) => {
                                                                        const newOptions = [...formData.options];
                                                                        newOptions[index] = e.target.value;
                                                                        setFormData(prev => ({ ...prev, options: newOptions }));
                                                                    }}
                                                                />
                                                                {formData.options.length > 2 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeOption(index)}
                                                                        className="rounded-md bg-red-500/10 px-2 text-red-400 hover:bg-red-500/20"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={addOption}
                                                        className="mt-3 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                                                    >
                                                        + Add Option
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex items-center justify-end gap-x-6">
                                                <button
                                                    type="button"
                                                    className="text-sm/6 font-semibold text-white hover:text-gray-300"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                                >
                                                    Create Poll
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </DialogPanel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )   

}
    