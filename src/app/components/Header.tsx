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
    <header className="p-4 border-b border-gray-700 bg-gray-900 mb-4">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <div className="flex justify-start items-center space-x-8">
          <Link href="/">
            <h4 className="text-white text-2xl font-extrabold">BlockVote</h4>
          </Link>

          <div className="flex justify-start items-center space-x-2">
            <Link 
              href={'/create'}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center space-x-2"
            >
              <span>+</span>
              <span>New Poll</span>
            </Link>
          </div>
        </div>

        {isMounted && (
          <WalletMultiButton
            style={{ backgroundColor: '#9333EA', color: 'white' }}
          />
        )}
      </nav>
    </header>
  )
}

export default Header