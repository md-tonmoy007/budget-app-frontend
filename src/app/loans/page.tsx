"use client";
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import LoanList from '../../components/LoanList';
import LoanDashboard from '../../components/LoanDashboard';
import LoanAccountsList from '../../components/LoanAccountsList';
import LoanFormModal from '../../components/LoanFormModal';
import LoanAccountModal from '../../components/LoanAccountModal';
import { Plus, UserPlus } from 'lucide-react';

export default function LoansPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Loan Management</h1>
          <div className="grid grid-cols-2 sm:flex gap-3">
             <button
                onClick={() => setShowAccountModal(true)}
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-lg transition-all"
             >
                <UserPlus size={18} />
                New Account
             </button>
             <button
                onClick={() => setShowTransactionModal(true)}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/20"
             >
                <Plus size={18} />
                Log Transaction
             </button>
          </div>
        </div>
        
        <div className="mb-8">
            <LoanDashboard refreshKey={refreshKey} />
        </div>

        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Active Accounts</h2>
            <LoanAccountsList refreshKey={refreshKey} />
        </div>
        
        <LoanList refreshKey={refreshKey} />
      </div>

      <LoanFormModal 
        isOpen={showTransactionModal} 
        onClose={() => setShowTransactionModal(false)} 
        onSuccess={handleRefresh}
      />
      
      <LoanAccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
