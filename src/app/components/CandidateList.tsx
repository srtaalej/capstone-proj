'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Candidate } from '../utils/interfaces'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  fetchAllCandidates,
  getProvider,
  hasUserVoted,
  vote,
} from '../services/blockchain.service'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { RootState } from '../utils/interfaces'

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
        <p className="mb-6 text-gray-700">You must complete KYC to participate in voting. Please verify your identity to continue.</p>
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

interface Props {
  candidates: Candidate[]
  pollAddress: string
  pollId: number
}

const CandidateList = ({ candidates, pollAddress, pollId }: Props) => {
  const [voted, setVoted] = useState<boolean>(false)
  const [showKycModal, setShowKycModal] = useState(false)
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const kycStatus = useSelector((state: RootState) => state.globalStates.kycStatus)
  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )
  const fetchVotingStatus = async () => {
    const status = await hasUserVoted(program!, publicKey!, pollId)
    setVoted(status)
  }

  useEffect(() => {
    if (!program || !publicKey) return

    fetchVotingStatus()
  }, [program, publicKey, candidates])

  const handleVote = async (option: Candidate) => {
    if (!program || !publicKey || voted) return
    if (kycStatus !== 'verified') {
      setShowKycModal(true)
      return
    }
    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await vote(
            program!,
            publicKey!,
            option.pollId,
            option.cid
          )

          await fetchAllCandidates(program, pollAddress)
          await fetchVotingStatus()

          console.log(tx)
          resolve(tx as any)
        } catch (error) {
          console.error('Transaction failed:', error)
          reject(error)
        }
      }),
      {
        pending: 'Approve transaction...',
        success: 'Transaction successful 👌',
        error: 'Encountered error 🤯',
      }
    )
  }

  return (
    <>
      <KYCRequiredModal open={showKycModal} onClose={() => setShowKycModal(false)} />
      <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-6 w-4/5 md:w-3/5 space-y-4 text-center">
        <div className="space-y-2">
          {candidates.map((option) => (
            <div
              key={option.publicKey}
              className="flex justify-between items-center border-b border-gray-300 last:border-none pb-4 last:pb-0"
            >
              <span className="text-gray-800 font-medium">{option.name}</span>
              <span className="text-gray-600 text-sm flex items-center space-x-2">
                <button
                  onClick={() => handleVote(option)}
                  className={`px-2 py-1 bg-${voted ? 'red' : 'green'}-100 text-${
                    voted ? 'red' : 'green'
                  }-700 ${!voted && 'hover:bg-green-200'} rounded`}
                  disabled={voted || !publicKey}
                >
                  {voted ? 'Voted' : 'Vote'}{' '}
                  <span className="font-semibold">{option.votes}</span>
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default CandidateList
