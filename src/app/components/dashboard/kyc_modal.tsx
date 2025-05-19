import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalStep: "manual" | "ocr" | "review" | "minting" | "success" | "error";
  manualForm: {
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
  };
  ocrValues: {
    first_name: string;
    last_name: string;
    dob: string;
    gender: string;
  };
  handleManualChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleStartOCR: () => void;
  handleMint: () => void;
  selectedFile: File | null;
  transactionId?: string;
  errorMessage?: string;
}

export default function KYCModal({
  isOpen,
  onClose,
  modalStep,
  manualForm,
  ocrValues,
  handleManualChange,
  handleFileChange,
  handleStartOCR,
  handleMint,
  selectedFile,
  transactionId,
  errorMessage,
}: KYCModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-gray-900 text-gray-400 hover:text-gray-200"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    {/* Step 1: Manual Entry */}
                    {modalStep === "manual" && (
                      <form
                        className="space-y-6"
                        onSubmit={e => {
                          e.preventDefault();
                          handleStartOCR();
                        }}
                      >
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Step 1: Enter Your Details
                        </h3>
                        <p className="text-gray-400 mb-6">
                          Please enter your details exactly as they appear on your ID, then upload a photo of your ID. We'll scan it for you in the next step.
                        </p>
                        <div className="grid grid-cols-1 gap-4">
                          <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={manualForm.firstName}
                            onChange={handleManualChange}
                            className="block w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                          />
                          <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={manualForm.lastName}
                            onChange={handleManualChange}
                            className="block w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                          />
                          <input
                            type="date"
                            name="dob"
                            placeholder="Date of Birth"
                            value={manualForm.dob}
                            onChange={handleManualChange}
                            className="block w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                          />
                          <select
                            name="gender"
                            value={manualForm.gender}
                            onChange={handleManualChange}
                            className="block w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="O">Other</option>
                          </select>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-200 hover:file:bg-blue-800"
                            required
                          />
                          {selectedFile && (
                            <div className="flex items-center justify-between bg-gray-800 p-2 rounded">
                              <span className="text-sm text-gray-300">{selectedFile.name}</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition"
                          disabled={!(manualForm.firstName && manualForm.lastName && manualForm.dob && manualForm.gender && selectedFile)}
                        >
                          Next: Scan ID
                        </button>
                      </form>
                    )}

                    {/* Step 2: OCR Processing */}
                    {modalStep === "ocr" && (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <h3 className="text-lg font-semibold leading-6 text-white">
                          Processing ID with OCR...
                        </h3>
                        <p className="text-sm text-gray-400">
                          Please wait while we extract your details.
                        </p>
                      </div>
                    )}

                    {/* Step 3: Review Modal */}
                    {modalStep === "review" && (
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-4">
                          Step 2: Review Your Details
                        </h3>
                        <table className="w-full mb-4 text-left text-white">
                          <thead>
                            <tr>
                              <th className="p-2">Field</th>
                              <th className="p-2">Manual Entry</th>
                              <th className="p-2">OCR Value</th>
                              <th className="p-2">Final Used</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="p-2">First Name</td>
                              <td className="p-2">{manualForm.firstName}</td>
                              <td className="p-2">{ocrValues.first_name}</td>
                              <td className="p-2 font-bold text-blue-400">{ocrValues.first_name || manualForm.firstName}</td>
                            </tr>
                            <tr>
                              <td className="p-2">Last Name</td>
                              <td className="p-2">{manualForm.lastName}</td>
                              <td className="p-2">{ocrValues.last_name}</td>
                              <td className="p-2 font-bold text-blue-400">{ocrValues.last_name || manualForm.lastName}</td>
                            </tr>
                            <tr>
                              <td className="p-2">Date of Birth</td>
                              <td className="p-2">{manualForm.dob}</td>
                              <td className="p-2">{ocrValues.dob}</td>
                              <td className="p-2 font-bold text-blue-400">{ocrValues.dob || manualForm.dob}</td>
                            </tr>
                            <tr>
                              <td className="p-2">Gender</td>
                              <td className="p-2">{manualForm.gender}</td>
                              <td className="p-2">{ocrValues.gender}</td>
                              <td className="p-2 font-bold text-blue-400">{ocrValues.gender || manualForm.gender}</td>
                            </tr>
                          </tbody>
                        </table>
                        <button
                          onClick={handleMint}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:from-green-700 hover:to-emerald-700 transition"
                        >
                          Confirm and Mint
                        </button>
                      </div>
                    )}

                    {/* Minting, Success, Error */}
                    {modalStep === "minting" && (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                        <h3 className="text-lg font-semibold leading-6 text-white">
                          Minting NFT
                        </h3>
                        <p className="text-sm text-gray-400">
                          Creating your digital identity...
                        </p>
                      </div>
                    )}
                    {modalStep === "success" && (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold leading-6 text-white">
                          KYC Verified!
                        </h3>
                        <p className="text-sm text-white">
                          Your digital identity has been created successfully.
                        </p>
                        {transactionId && (
                          <div className="mt-4 w-full">
                            <p className="text-xs text-white mb-1">Transaction ID:</p>
                            <p className="text-xs font-mono text-white break-all bg-gray-800 rounded p-2 select-all">
                              {transactionId}
                            </p>
                          </div>
                        )}
                        <button
                          onClick={onClose}
                          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition"
                        >
                          Close
                        </button>
                      </div>
                    )}
                    {modalStep === "error" && (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center">
                          <svg
                            className="h-6 w-6 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">
                          Error
                        </h3>
                        <p className="text-sm text-gray-500">
                          {errorMessage || "An error occurred during KYC verification."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 