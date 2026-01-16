"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import AccountTable from '../components/AccountTable';
import ExpenseFormModal from '../components/ExpenseFormModal';
import IncomeFormModal from '../components/IncomeFormModal';
import api from '../lib/api';
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';

interface Transaction {
  id: string;
  datetime: string;
  type: string;
  description: string;
  amount: number;
  isIncome: boolean;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    current_month_total: 0,
    recent_expenses: [] as any[]
  });
  const [recentIncome, setRecentIncome] = useState<any[]>([]);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  const fetchDashboardData = () => {
    api.get('/expenses/dashboard').then(res => setStats(res.data)).catch(console.error);
    api.get('/income').then(res => {
      // Get only the 5 most recent income entries
      const sortedIncome = res.data.sort((a: any, b: any) => 
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      ).slice(0, 5);
      setRecentIncome(sortedIncome);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Combine and sort transactions
  const combinedTransactions: Transaction[] = [
    ...stats.recent_expenses.map(exp => ({
      id: `exp-${exp.id}`,
      datetime: exp.datetime,
      type: exp.expense_type,
      description: exp.description || 'No description',
      amount: exp.amount,
      isIncome: false
    })),
    ...recentIncome.map(inc => ({
      id: `inc-${inc.id}`,
      datetime: inc.datetime,
      type: inc.income_type,
      description: inc.description || 'No description',
      amount: inc.amount,
      isIncome: true
    }))
  ].sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
   .slice(0, 8); // Show 8 most recent transactions

  const handleModalSuccess = () => {
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header with Action Buttons */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowExpenseModal(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-indigo-500/20"
                    >
                        <Plus size={18} />
                        Log Expense
                    </button>
                    <button 
                        onClick={() => setShowIncomeModal(true)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg hover:shadow-green-500/20"
                    >
                        <Plus size={18} />
                        Log Income
                    </button>
                </div>
            </div>
            
            {/* Summary Card */}
            <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl text-white">
                <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Current Month Spending</p>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                    ${stats.current_month_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Transactions */}
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 h-full">
                <h3 className="text-lg font-semibold mb-6">Recent Transactions</h3>
                <div className="space-y-4">
                    {combinedTransactions.length === 0 ? (
                        <p className="text-gray-500 text-sm">No recent transactions.</p>
                    ) : (
                        combinedTransactions.map((txn) => (
                            <div key={txn.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${txn.isIncome ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                        {txn.isIncome ? (
                                            <TrendingUp size={18} className="text-green-400" />
                                        ) : (
                                            <TrendingDown size={18} className="text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{txn.type}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(txn.datetime).toLocaleDateString()} &bull; {txn.description}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-bold ${txn.isIncome ? 'text-green-400' : 'text-red-400'}`}>
                                    {txn.isIncome ? '+' : '-'}${txn.amount.toFixed(2)}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Accounts */}
            <div>
                <AccountTable />
            </div>
        </div>
      </div>

      {/* Modals */}
      <ExpenseFormModal 
        isOpen={showExpenseModal} 
        onClose={() => setShowExpenseModal(false)} 
        onSuccess={handleModalSuccess}
      />
      <IncomeFormModal 
        isOpen={showIncomeModal} 
        onClose={() => setShowIncomeModal(false)} 
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
