import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalStep: "upload" | "ocr" | "review" | "minting" | "success" | "error";
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
  const valuesMatch = () =>
    ocrValues.first_name.toLowerCase() === manualForm.firstName.toLowerCase() &&
    ocrValues.last_name.toLowerCase() === manualForm.lastName.toLowerCase() &&
    ocrValues.dob === manualForm.dob &&
    ocrValues.gender.toLowerCase() === manualForm.gender.toLowerCase();

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

                    {modalStep === "upload" && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleStartOCR();
                        }}
                        className="space-y-4"
                      >
                        <h3 className="text-2xl font-bold text-white mb-2">Step 1: Upload Your ID</h3>
                        <p className="text-gray-400">Please upload an image of your official ID document.</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-400 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-900 file:text-blue-200 hover:file:bg-blue-800"
                          required
                        />
                        {selectedFile && (
                          <p className="text-sm text-white">Selected file: {selectedFile.name}</p>
                        )}
                        <button
                          type="submit"
                          disabled={!selectedFile}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded"
                        >
                          Start OCR Scan
                        </button>
                      </form>
                    )}

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

                    {modalStep === "review" && (
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-4">
                          Step 2: Review and Edit Your Details
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={manualForm.firstName}
                            onChange={handleManualChange}
                            className="block w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2"
                            required
                          />
                          <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={manualForm.lastName}
                            onChange={handleManualChange}
                            className="block w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2"
                            required
                          />
                          <input
                            type="date"
                            name="dob"
                            value={manualForm.dob}
                            onChange={handleManualChange}
                            className="block w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2"
                            required
                          />
                          <select
                            name="gender"
                            value={manualForm.gender}
                            onChange={handleManualChange}
                            className="block w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-3 py-2"
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="O">Other</option>
                          </select>
                        </div>
                        <button
                          onClick={handleMint}
                          className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 rounded-lg"
                        >
                          Submit for Review
                        </button>
                      </div>
                    )}
                    
                    {modalStep === "minting" && (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                        <h3 className="text-lg font-semibold text-white">Minting NFT</h3>
                        <p className="text-sm text-gray-400">Creating your digital identity...</p>
                      </div>
                    )}

                    {modalStep === "success" && (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
                          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-white">KYC Complete!</h3>
                        <p className="text-sm text-white">
                          {transactionId ? "Your ID NFT has been minted." : "Your request has been submitted to an admin."}
                        </p>
                        {transactionId && (
                          <div className="mt-2 w-full">
                            <p className="text-xs text-white mb-1">Transaction ID:</p>
                            <p className="text-xs font-mono text-white break-all bg-gray-800 rounded p-2 select-all">
                              {transactionId}
                            </p>
                          </div>
                        )}
                        <button
                          onClick={onClose}
                          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold"
                        >
                          Close
                        </button>
                      </div>
                    )}

                    {modalStep === "error" && (
                      <div className="text-center space-y-2 text-red-500">
                        <h3 className="text-lg font-semibold">Error</h3>
                        <p>{errorMessage || "An error occurred during KYC verification."}</p>
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