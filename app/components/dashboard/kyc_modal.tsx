import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalStep: "ocr" | "minting" | "success" | "error";
  transactionId?: string;
  errorMessage?: string;
}

export default function KYCModal({
  isOpen,
  onClose,
  modalStep,
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    {modalStep === "ocr" && (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">
                          Processing KYC
                        </h3>
                        <p className="text-sm text-gray-500">
                          Please wait while we process your ID...
                        </p>
                      </div>
                    )}

                    {modalStep === "minting" && (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">
                          Minting NFT
                        </h3>
                        <p className="text-sm text-gray-500">
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
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">
                          KYC Verified!
                        </h3>
                        <p className="text-sm text-gray-500">
                          Your digital identity has been created successfully.
                        </p>
                        {transactionId && (
                          <div className="mt-4">
                            <p className="text-xs text-gray-500">Transaction ID:</p>
                            <p className="text-xs font-mono text-gray-900 break-all">
                              {transactionId}
                            </p>
                          </div>
                        )}
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