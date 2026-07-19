"use client";
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import ExpenseList from '../../components/ExpenseList';
import ExpenseFormModal from '../../components/ExpenseFormModal';
import { Plus } from 'lucide-react';

export default function LogPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const handleModalSuccess = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Expense Log</h1>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/20"
          >
            <Plus size={18} />
            Log Expense
          </button>
        </div>
        
        <ExpenseList refreshKey={refreshKey} />
      </div>

      <ExpenseFormModal 
        isOpen={showExpenseModal} 
        onClose={() => setShowExpenseModal(false)} 
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
