"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import AccountTable from '../components/AccountTable';
import ExpenseList from '../components/ExpenseList';
import api from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    current_month_total: 0,
    recent_expenses: [] as any[]
  });

  useEffect(() => {
    api.get('/expenses/dashboard').then(res => setStats(res.data)).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Summary Card */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="p-8 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl text-white">
                <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Current Month Spending</p>
                <h2 className="text-5xl font-extrabold tracking-tight">
                    ${stats.current_month_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Expenses */}
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 h-full">
                <h3 className="text-lg font-semibold mb-6">Recent Transactions</h3>
                <div className="space-y-4">
                    {stats.recent_expenses.length === 0 ? (
                        <p className="text-gray-500 text-sm">No recent transactions.</p>
                    ) : (
                        stats.recent_expenses.map((exp: any) => (
                            <div key={exp.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <div>
                                    <p className="font-medium">{exp.expense_type}</p>
                                    <p className="text-xs text-gray-400">{new Date(exp.datetime).toLocaleDateString()} &bull; {exp.description || 'No desc'}</p>
                                </div>
                                <span className="font-bold text-red-400">-${exp.amount.toFixed(2)}</span>
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
        
        <ExpenseList />
      </div>
    </div>
  );
}
