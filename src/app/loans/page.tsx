"use client";
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import LoanList from '../../components/LoanList';
import LoanDashboard from '../../components/LoanDashboard';
import LoanFormModal from '../../components/LoanFormModal';
import { Plus } from 'lucide-react';

export default function LoansPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showLoanModal, setShowLoanModal] = useState(false);

  const handleModalSuccess = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Loan Management</h1>
          <button 
            onClick={() => setShowLoanModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-blue-500/20"
          >
            <Plus size={18} />
            Log Loan
          </button>
        </div>
        
        <div className="mb-8">
            <LoanDashboard refreshKey={refreshKey} />
        </div>
        
        <LoanList refreshKey={refreshKey} />
      </div>

      <LoanFormModal 
        isOpen={showLoanModal} 
        onClose={() => setShowLoanModal(false)} 
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
