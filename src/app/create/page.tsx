'use client'

import { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { BN } from '@coral-xyz/anchor'
import {
  createPoll,
  getCounter,
  getProvider,
} from '../services/blockchain.service'
import { useWallet } from '@solana/wallet-adapter-react'

const Page: NextPage = () => {
  const { publicKey, sendTransaction, signTransaction } = useWallet()
  const [nextCount, setNextCount] = useState<BN>(new BN(0))
  const [isInitialized, setIsInitialized] = useState(false)

  const program = useMemo(
    () => getProvider(publicKey, signTransaction, sendTransaction),
    [publicKey, signTransaction, sendTransaction]
  )

  const [formData, setFormData] = useState({
    description: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    const fetchCounter = async () => {
      if (!program) return
      const count = await getCounter(program)
      setNextCount(count.add(new BN(1)))
      setIsInitialized(count.gte(new BN(0)))
    }

    fetchCounter()
  }, [program, formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!program || !isInitialized) return

    const { description, startDate, endDate } = formData

    const startTimestamp = new Date(startDate).getTime() / 1000
    const endTimestamp = new Date(endDate).getTime() / 1000

    await toast.promise(
      new Promise<void>(async (resolve, reject) => {
        try {
          const tx = await createPoll(
            program!,
            publicKey!,
            nextCount,
            description,
            startTimestamp,
            endTimestamp
          )

          setFormData({
            description: '',
            startDate: '',
            endDate: '',
          })

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
    <div className="flex flex-col justify-center items-center">
      <div className="h-16"></div>
      <div className="flex flex-col justify-center items-center space-y-6 w-full">
        <h2 className="bg-gray-600 text-white rounded-full px-6 py-2 text-lg font-bold">
          Create Poll
        </h2>

        <form
          className="bg-gray-800 border border-gray-700 rounded-2xl
          shadow-lg p-6 w-4/5 md:w-2/5 space-y-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-300"
            >
              Poll Description
            </label>
            <input
              type="text"
              id="description"
              placeholder="Briefly describe the purpose of this poll..."
              required
              className="mt-2 block w-full py-3 px-4 border border-gray-700
              rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500
              focus:outline-none bg-gray-700 text-white placeholder-gray-400"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-semibold text-gray-300"
            >
              Start Date
            </label>
            <input
              type="datetime-local"
              id="startDate"
              required
              className="mt-2 block w-full py-3 px-4 border border-gray-700
              rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500
              focus:outline-none bg-gray-700 text-white"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-semibold text-gray-300"
            >
              End Date
            </label>
            <input
              type="datetime-local"
              id="endDate"
              required
              className="mt-2 block w-full py-3 px-4 border border-gray-700
              rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500
              focus:outline-none bg-gray-700 text-white"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>

          <div className="flex justify-center w-full">
            <button
              type="submit"
              disabled={!program || !isInitialized}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg
              transition duration-200 w-full disabled:bg-opacity-70"
            >
              Create Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Page
