"use client";
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Trash2 } from 'lucide-react';

export default function LoanList({ refreshKey }: { refreshKey?: number }) {
  const [loans, setLoans] = useState<any[]>([]);

  const fetchLoans = () => {
    api.get('/loans').then(res => setLoans(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchLoans();
  }, [refreshKey]);

  const handleDelete = async (id: number) => {
    if(!confirm("Delete this record?")) return;
    await api.delete(`/loans/${id}`);
    fetchLoans();
  }

  return (
    <div className="bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md overflow-hidden">
        <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-bold">Recent History</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[600px]">
                <thead className="bg-white/5 text-xs uppercase text-gray-400">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Person</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                        <th className="px-6 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {loans.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No records found.</td></tr>
                    ) : (
                        loans.map(loan => (
                            <tr key={loan.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-gray-400">{new Date(loan.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-medium">{loan.person_name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${loan.type === 'GIVEN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {loan.type}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-bold ${loan.type === 'GIVEN' ? 'text-green-400' : 'text-red-400'}`}>
                                    ${loan.amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleDelete(loan.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
}
