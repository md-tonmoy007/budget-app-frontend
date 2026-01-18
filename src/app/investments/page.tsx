"use client";
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import InvestmentDashboard from '../../components/InvestmentDashboard';
import InvestmentList from '../../components/InvestmentList';
import InvestmentAccountModal from '../../components/InvestmentAccountModal';
import InvestmentFormModal from '../../components/InvestmentFormModal';
import { Plus, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function InvestmentsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const handleRefresh = () => setRefreshKey(k => k + 1);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">Investments</h1>
          <div className="flex gap-3">
            <Link 
                href="/investments/accounts"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-lg transition-all"
            >
                View Accounts
            </Link>
            <button 
                onClick={() => setShowAccountModal(true)}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-all"
            >
                <Wallet size={18} />
                New Account
            </button>
            <button 
                onClick={() => setShowTransactionModal(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-emerald-500/20"
            >
                <Plus size={18} />
                Log Investment
            </button>
          </div>
        </div>
        
        <InvestmentDashboard refreshKey={refreshKey} />
        <InvestmentList refreshKey={refreshKey} />
      </div>

      <InvestmentAccountModal 
        isOpen={showAccountModal} 
        onClose={() => setShowAccountModal(false)}
        onSuccess={handleRefresh}
      />
      
      <InvestmentFormModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
