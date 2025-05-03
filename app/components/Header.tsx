'use client'

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const Header = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <header className="p-4 border-b border-gray-700 bg-gray-900 text-gray-200 mb-4">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex justify-start items-center space-x-8">
          <Link href="/">
            <h4 className="text-white text-2xl font-extrabold hover:text-orange-400 transition">
              BlockVote
            </h4>
          </Link>

          <div className="flex justify-start items-center space-x-4">
            <Link
              href={'/create'}
              className="text-gray-300 hover:text-orange-400 transition font-medium"
            >
              + New Poll
            </Link>
          </div>
        </div>

        {isMounted && (
          <WalletMultiButton
            style={{
              backgroundColor: '#134E4A',
              color: 'white',
              border: '1px solid black',
              borderRadius: '8px',
              padding: '8px 16px',
            }}
          />
        )}
      </nav>
    </header>
  )
}

export default Header