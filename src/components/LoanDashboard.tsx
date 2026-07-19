"use client";
import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function LoanDashboard({ refreshKey }: { refreshKey?: number }) {
  const [stats, setStats] = useState({
    total_given: 0,
    total_taken: 0,
    net_position: 0
  });

  useEffect(() => {
    api.get('/loans/dashboard').then(res => setStats(res.data)).catch(console.error);
  }, [refreshKey]);

  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 text-center md:divide-x divide-white/10">
        <div className="pb-4 md:pb-0 border-b md:border-b-0 border-white/10">
            <p className="text-sm uppercase tracking-wider opacity-70 mb-1">Total Given</p>
            <p className="text-3xl font-bold text-green-400">+${stats.total_given.toFixed(2)}</p>
        </div>
        <div className="py-4 md:py-0 border-b md:border-b-0 border-white/10">
            <p className="text-sm uppercase tracking-wider opacity-70 mb-1">Total Taken</p>
            <p className="text-3xl font-bold text-red-400">-${stats.total_taken.toFixed(2)}</p>
        </div>
        <div className="pt-4 md:pt-0">
            <p className="text-sm uppercase tracking-wider opacity-70 mb-1">Net Position</p>
            <p className={`text-3xl font-bold ${stats.net_position >= 0 ? 'text-white' : 'text-yellow-400'}`}>
                {stats.net_position >= 0 ? '+' : ''}${stats.net_position.toFixed(2)}
            </p>
        </div>
      </div>
    </div>
  );
}
