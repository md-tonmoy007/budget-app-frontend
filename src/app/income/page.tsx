"use client";
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import IncomeList from '../../components/IncomeList';
import IncomeFormModal from '../../components/IncomeFormModal';
import { Plus } from 'lucide-react';

export default function IncomePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const handleModalSuccess = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Income Log</h1>
          <button 
            onClick={() => setShowIncomeModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-green-500/20"
          >
            <Plus size={18} />
            Log Income
          </button>
        </div>
        
        <IncomeList refreshKey={refreshKey} />
      </div>

      <IncomeFormModal 
        isOpen={showIncomeModal} 
        onClose={() => setShowIncomeModal(false)} 
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
