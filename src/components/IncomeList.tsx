"use client";
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import EditIncomeModal from './EditIncomeModal';

export default function IncomeList({ refreshKey }: { refreshKey?: number }) {
  const [income, setIncome] = useState<any[]>([]);
  const [editingIncome, setEditingIncome] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchIncome = () => {
    api.get('/income').then(res => setIncome(res.data));
  };

  useEffect(() => {
    fetchIncome();
  }, [refreshKey]);

  const handleDelete = async (id: number) => {
    if(!confirm("Delete this income?")) return;
    await api.delete(`/income/${id}`);
    fetchIncome();
  }

  // Pagination calculations
  const totalPages = Math.ceil(income.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIncome = income.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <h3 className="text-lg font-semibold mb-6">All Income</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[500px]">
        <thead className="text-xs uppercase text-gray-400 border-b border-white/10">
            <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Account</th>
                <th className="py-2">Type</th>
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Amount</th>
                <th className="py-2 text-center">Action</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
            {currentIncome.length === 0 ? (
                <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                        No income found.
                    </td>
                </tr>
            ) : (
                currentIncome.map(inc => (
                    <tr key={inc.id} className="hover:bg-white/5">
                        <td className="py-3 text-gray-400">{new Date(inc.datetime).toLocaleDateString()}</td>
                        <td className="py-3 text-green-300 font-medium">{inc.account_name || '-'}</td>
                        <td className="py-3">{inc.income_type}</td>
                        <td className="py-3 text-gray-500 truncate max-w-[200px]">{inc.description}</td>
                        <td className="py-3 text-right font-bold text-green-400">+${inc.amount.toFixed(2)}</td>
                        <td className="py-3 text-center flex items-center justify-center gap-2">
                            <button onClick={() => setEditingIncome(inc)} className="p-1 hover:bg-white/10 rounded text-green-400">
                                <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(inc.id)} className="p-1 hover:bg-white/10 rounded text-red-500">
                                <Trash2 size={14} />
                            </button>
                        </td>
                    </tr>
                ))
            )}
        </tbody>
      </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
                Showing {startIndex + 1} to {Math.min(endIndex, income.length)} of {income.length} income entries
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                            currentPage === page 
                                ? 'bg-green-600 text-white' 
                                : 'bg-white/5 hover:bg-white/10'
                        }`}
                    >
                        {page}
                    </button>
                ))}
                
                <button 
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
      )}
      
      {editingIncome && (
        <EditIncomeModal 
            income={editingIncome} 
            onClose={() => setEditingIncome(null)} 
            onUpdate={fetchIncome} 
        />
      )}
    </div>
  );
}
