'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  fetchAllPolls,
  getCounter,
  getProvider,
  getReadonlyProvider,
  initialize,
} from '../app/services/blockchain.service'
import Link from 'next/link'
import { Poll } from './utils/interfaces'
import { BN } from '@coral-xyz/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'react-toastify'
import { PlusIcon } from '@heroicons/react/20/solid'

export default function Page() {
  const [polls, setPolls] = useState<Poll[]>([])
  const { publicKey, signTransaction, sendTransaction } = useWallet()
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const programReadOnly = useMemo(() => getReadonlyProvider(), [])

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  const fetchData = async () => {
    fetchAllPolls(programReadOnly).then((data) => setPolls(data as any))
    const count = await getCounter(programReadOnly)
    setIsInitialized(count.gte(new BN(0)))
  }

  useEffect(() => {
    if (!programReadOnly) return
    fetchData()
  }, [programReadOnly])

  const handleInit = async () => {
    if (isInitialized && !!publicKey) return

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await initialize(program!, publicKey!)
          console.log(tx)

          await fetchData()
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to BlockVote</h1>
          <p className="text-xl text-gray-300">
            Secure, transparent, and decentralized voting on the Solana blockchain
          </p>
        </div>

        {!isInitialized && publicKey && (
          <div className="text-center mb-12">
            <button
              onClick={handleInit}
              className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Initialize App
            </button>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Active Polls</h2>
            {publicKey && (
              <Link
                href="/create"
                className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                New Poll
              </Link>
            )}
          </div>

          {polls.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
              <p className="text-gray-300">
                {!publicKey
                  ? "Loading polls, please wait a moment..."
                  : "No polls available yet. Be the first to create one!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {polls.map((poll) => (
                <div
                  key={poll.publicKey}
                  className="bg-gray-800 rounded-lg shadow-lg p-6 hover:bg-gray-700 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {poll.description.length > 50
                      ? poll.description.slice(0, 47) + '...'
                      : poll.description}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-300 mb-6">
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
                  <Link
                    href={`/polls/${poll.publicKey}`}
                    className="block w-full text-center bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                  >
                    View Poll
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}