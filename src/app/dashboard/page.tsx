"use client";

import { useEffect, useState } from 'react';
import DashboardCard from '../components/dashboard/dashboard_card';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  if (!connected) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Dashboard</h1>
          <p className="text-xl text-gray-300">
            Manage your voting activities and KYC status
          </p>
        </div>

        <div className="space-y-6">
          <DashboardCard />
          
          {/* Additional dashboard sections can be added here */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Your Voting Activity</h2>
            <p className="text-gray-300">
              Your voting history and created polls will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 