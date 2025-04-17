import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface KYCModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalStep: "ocr" | "confirm" | "minting" | "success" | "error";
  transactionId?: string;
  errorMessage?: string;
  ocrData?: { name: string; dob: string; gender: string };
  setOcrData?: (data: { name: string; dob: string; gender: string }) => void;
  onConfirm?: () => void;
}

export default function KYCModal({
  isOpen,
  onClose,
  modalStep,
  transactionId,
  errorMessage,
  ocrData,
  setOcrData,
  onConfirm,
}: KYCModalProps) {
  if (!isOpen) return null;

  return (
    <div className="mt-8 rounded-lg bg-gray-900 text-white p-6 shadow-lg">
      {modalStep === "ocr" && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <h3 className="text-lg font-semibold">Processing KYC</h3>
          <p className="text-sm">Please wait while we process your ID...</p>
        </div>
      )}

      {modalStep === "confirm" && ocrData && setOcrData && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Confirm your details</h3>
          <input
            className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-white"
            value={ocrData.name}
            onChange={(e) => setOcrData({ ...ocrData, name: e.target.value })}
            placeholder="Full Name"
          />
          <input
            className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-white"
            value={ocrData.dob}
            onChange={(e) => setOcrData({ ...ocrData, dob: e.target.value })}
            placeholder="Date of Birth"
          />
          <input
            className="w-full bg-gray-800 border border-gray-700 px-3 py-2 rounded text-white"
            value={ocrData.gender}
            onChange={(e) => setOcrData({ ...ocrData, gender: e.target.value })}
            placeholder="Gender"
          />
          <div className="flex justify-end">
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {modalStep === "minting" && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
          <h3 className="text-lg font-semibold">Minting NFT</h3>
          <p className="text-sm">Creating your digital identity...</p>
        </div>
      )}

      {modalStep === "success" && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full h-12 w-12 bg-green-600 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">KYC Verified!</h3>
          <p className="text-sm">Your digital identity has been created successfully.</p>
          {transactionId && (
            <div className="mt-2 text-sm">
              <p className="text-gray-400">Transaction ID:</p>
              <p className="font-mono break-all">{transactionId}</p>
            </div>
          )}
        </div>
      )}

      {modalStep === "error" && (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full h-12 w-12 bg-red-600 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Error</h3>
          <p className="text-sm">{errorMessage || "An error occurred during KYC verification."}</p>
        </div>
      )}
    </div>
  );
}
