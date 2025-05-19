'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  getReadonlyProvider,
  fetchPollDetails,
  fetchAllCandidates,
} from '../../services/blockchain.service'
import { RootState } from '../../utils/interfaces'
import { useParams } from 'next/navigation'
import RegCandidate from '../../components/RegCandidate'
import { FaRegEdit } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/app/store/globalSlices'
import { useWallet } from '@solana/wallet-adapter-react'
import CandidateList from '@/app/components/CandidateList'

function KYCRequiredModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`} />
      <div
        className={`relative bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center z-10 transform transition-all duration-300 ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        style={{ minWidth: 320 }}
      >
        <h2 className="text-xl font-bold mb-4 text-red-600">KYC Required</h2>
        <p className="mb-6 text-gray-700">You must complete KYC to add an option. Please verify your identity to continue.</p>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function PollDetails() {
  const { pollId } = useParams()
  const { publicKey } = useWallet()
  const [showKycModal, setShowKycModal] = useState(false)
  const kycStatus = useSelector((state: RootState) => state.globalStates.kycStatus)

  const program = useMemo(() => getReadonlyProvider(), [])

  const dispatch = useDispatch()
  const { setRegModal, setCandidates, setPoll } = globalActions
  const { candidates, poll } = useSelector(
    (states: RootState) => states.globalStates
  )

  useEffect(() => {
    if (!program || !pollId) return

    // Fetch poll details
    const fetchDetails = async () => {
      await fetchPollDetails(program, pollId as string)
      await fetchAllCandidates(program, pollId as string)
    }

    fetchDetails()
  }, [program, pollId, setPoll, setCandidates, dispatch])

  if (!poll) {
    return (
      <div className="flex flex-col items-center py-10">
        <h2 className="text-gray-700 text-lg font-semibold">
          Loading poll details...
        </h2>
      </div>
    )
  }

  const handleAddOption = () => {
    if (kycStatus !== 'verified') {
      setShowKycModal(true)
      return
    }
    dispatch(setRegModal('scale-100'))
  }

  return (
    <>
      <KYCRequiredModal open={showKycModal} onClose={() => setShowKycModal(false)} />
      <div className="flex flex-col items-center py-10 space-y-6">
        <h2 className="bg-gray-800 text-white rounded-full px-6 py-2 text-lg font-bold">
          Poll Details
        </h2>

        <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-6 w-4/5 md:w-3/5 space-y-4 text-center">
          <h3 className="text-xl font-bold text-gray-800">
            {poll.description}
          </h3>
          <div className="flex flex-col items-center mb-2">
            <span className="text-xs text-gray-500 font-mono truncate max-w-xs inline-flex items-center gap-2">
              <span>Poll Address:</span>
              <span title={poll.publicKey} style={{maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis'}}>{poll.publicKey.slice(0, 6)}...{poll.publicKey.slice(-6)}</span>
              <button
                className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 font-mono"
                onClick={() => {navigator.clipboard.writeText(poll.publicKey)}}
                title="Copy address"
              >
                Copy
              </button>
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              <span className="font-semibold">Starts:</span>{' '}
              {new Date(poll.start).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Ends:</span>{' '}
              {new Date(poll.end).toLocaleString()}
            </p>
            <p>
              <span className="font-semibold">Options:</span>{' '}
              {poll.candidates}
            </p>
          </div>
        </div>

        {publicKey ? (
          <button
            className="flex justify-center items-center space-x-2 bg-gray-800 text-white rounded-full
          px-6 py-2 text-lg font-bold"
            onClick={handleAddOption}
          >
            <span>Add Option</span>
            <FaRegEdit />
          </button>
        ) : (
          <button
            className="flex justify-center items-center space-x-2 bg-gray-800 text-white rounded-full
            px-6 py-2 text-lg font-bold"
          >
            <span>Add Option</span>
          </button>
        )}

        {candidates.length > 0 && (
          <CandidateList
            candidates={candidates}
            pollAddress={poll.publicKey}
            pollId={poll.id}
          />
        )}
      </div>

      {pollId && <RegCandidate pollId={poll.id} pollAddress={poll.publicKey} />}
    </>
  )
}
