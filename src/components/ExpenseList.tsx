"use client";
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Trash2, Edit2 } from 'lucide-react';
import EditExpenseModal from './EditExpenseModal';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);

  const fetchExpenses = () => {
    api.get('/expenses').then(res => setExpenses(res.data));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id: number) => {
    if(!confirm("Delete this expense?")) return;
    await api.delete(`/expenses/${id}`);
    fetchExpenses();
  }

  return (
    <div className="mt-8 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 max-h-[500px] overflow-y-auto">
      <h3 className="text-lg font-semibold mb-6 sticky top-0 bg-[#121212] py-2 z-10">All Expenses</h3>
      <table className="w-full text-left text-sm">
        <thead className="text-xs uppercase text-gray-400 border-b border-white/10">
            <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Type</th>
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Amount</th>
                <th className="py-2 text-center">Action</th>
            </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
            {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-white/5">
                    <td className="py-3 text-gray-400">{new Date(exp.datetime).toLocaleDateString()}</td>
                    <td className="py-3">{exp.expense_type}</td>
                    <td className="py-3 text-gray-500 truncate max-w-[200px]">{exp.description}</td>
                    <td className="py-3 text-right font-bold text-red-400">-${exp.amount.toFixed(2)}</td>
                    <td className="py-3 text-center flex items-center justify-center gap-2">
                        <button onClick={() => setEditingExpense(exp)} className="p-1 hover:bg-white/10 rounded text-indigo-400">
                            <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(exp.id)} className="p-1 hover:bg-white/10 rounded text-red-500">
                            <Trash2 size={14} />
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
      
      {editingExpense && (
        <EditExpenseModal 
            expense={editingExpense} 
            onClose={() => setEditingExpense(null)} 
            onUpdate={fetchExpenses} 
        />
      )}
    </div>
  );
}
