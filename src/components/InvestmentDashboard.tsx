"use client";
import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function InvestmentDashboard({ refreshKey }: { refreshKey?: number }) {
  const [stats, setStats] = useState({
    total_invested: 0,
    total_withdrawn: 0,
    active_investments_count: 0
  });

  // Calculate stats from transactions and accounts locally for now, 
  // or ideally we update backend to serve dashboard stats.
  // For MVP, I'll fetch accounts and transactions here to aggregate.
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accRes, txnRes] = await Promise.all([
          api.get('/investments/accounts'),
          api.get('/investments/transactions')
        ]);
        
        const accounts = accRes.data;
        const txns = txnRes.data;

        // Calculate total invested (sum of all INVEST type txns)
        // Calculate total withdrawn (sum of all WITHDRAW type txns)
        // Note: Realized profit should ideally be calculated too.
        
        const totalInvested = txns
          .filter((t: any) => t.type === 'INVEST')
          .reduce((sum: number, t: any) => sum + t.amount, 0);
          
        const totalWithdrawn = txns
            .filter((t: any) => t.type === 'WITHDRAW')
            .reduce((sum: number, t: any) => sum + t.amount, 0);

        const activeCount = accounts.filter((a: any) => a.status === 'ACTIVE').length;

        setStats({
          total_invested: totalInvested,
          total_withdrawn: totalWithdrawn, // This could imply "Value Realized" 
          active_investments_count: activeCount
        });
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchData();
  }, [refreshKey]);

  const currentValuation = stats.total_invested - stats.total_withdrawn; // Very rough proxy
  // A better metric for 'Withdrawn' might be 'Realized Return'.
  
  return (
    <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-8 text-white shadow-2xl mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:divide-x divide-white/10">
        <div className="pb-4 md:pb-0 border-b md:border-b-0 border-white/10">
            <p className="text-sm uppercase tracking-wider opacity-70 mb-1">Total Invested</p>
            <p className="text-3xl font-bold text-emerald-400">${stats.total_invested.toFixed(2)}</p>
        </div>
        <div className="py-4 md:py-0 border-b md:border-b-0 border-white/10">
            <p className="text-sm uppercase tracking-wider opacity-70 mb-1">Total Withdrawn</p>
            <p className="text-3xl font-bold text-blue-400">${stats.total_withdrawn.toFixed(2)}</p>
        </div>
        <div className="pt-4 md:pt-0">
            <p className="text-sm uppercase tracking-wider opacity-70 mb-1">Active Accounts</p>
            <p className="text-3xl font-bold text-white">
                {stats.active_investments_count}
            </p>
        </div>
      </div>
    </div>
  );
}
