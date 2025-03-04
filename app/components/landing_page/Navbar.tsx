"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { disconnect, connected } = useWallet();
  const pathname = usePathname();

  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow-lg">
      {/* Redirect to Dashboard if logged in, Landing Page if not */}
      <Link
        href={connected ? "/post_login" : "/"}
        className="text-xl font-bold text-gray-800 hover:no-underline"
      >
        Block Vote
      </Link>

      <div className="flex items-center space-x-6">
        {/* Hide FAQ when already on FAQ page */}
        {pathname !== "/faq" && (
          <Link href="/faq" className="text-black hover:no-underline">
            FAQ
          </Link>
        )}

        {/* Show Polls only when logged in */}
        {connected && (
          <Link href="/polls" className="text-black hover:no-underline">
            Polls
          </Link>
        )}

        {/* Logout button  */}
        {connected && (
          <button
            onClick={() => disconnect()}
            className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Logout
          </button>
        )}

      </div>
    </nav>
  );
}
