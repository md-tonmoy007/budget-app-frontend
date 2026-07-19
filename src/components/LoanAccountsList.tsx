"use client";
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { User, Wallet, ArrowUpRight, ArrowDownLeft, Clock, Edit2, Trash2 } from 'lucide-react';
import LoanAccountModal from './LoanAccountModal';

interface AccountStats {
  id: number;
  name: string;
  type: string;
  balance: number;
  status: string;
  created_at: string;
}

export default function LoanAccountsList({ refreshKey }: { refreshKey?: number }) {
  const [stats, setStats] = useState<AccountStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = () => {
    api.get('/loans/accounts')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete account "${name}"?\nWARNING: This will delete ALL associated transactions!`)) return;
    try {
        await api.delete(`/loans/accounts/${id}`);
        fetchData();
        // Since we might be deleting from a parent refresh trigger, we might want to reload or just re-fetch locally
        window.location.reload(); 
    } catch (e) {
        alert("Failed to delete account");
        console.error(e);
    }
  };

  const handleEdit = (account: any) => {
      setEditingAccount(account);
      setShowModal(true);
  };

  if (loading) return <div className="text-gray-400">Loading accounts...</div>;

  const activeAccounts = stats.filter(acc => acc.status === 'ACTIVE');

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {activeAccounts.map(acc => (
        <div key={acc.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all group relative overflow-hidden">
          <div className="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button 
                onClick={(e) => { e.stopPropagation(); handleEdit(acc); }} 
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-blue-400"
                title="Edit Account"
            >
                <Edit2 size={16} />
            </button>
            <button 
                onClick={(e) => { e.stopPropagation(); handleDelete(acc.id, acc.name); }} 
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-red-400"
                title="Delete Account"
            >
                <Trash2 size={16} />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-lg ${acc.type === 'GIVEN' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {acc.type === 'GIVEN' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
            </div>
            <div>
                <h3 className="font-bold text-lg leading-tight">{acc.name}</h3>
                <p className="text-sm text-gray-400">{acc.type === 'GIVEN' ? 'Money I Lent' : 'Money I Borrowed'}</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${acc.status === 'ACTIVE' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {acc.status}
                </span>
             </div>
             <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                <span className="text-gray-300 font-medium">Balance</span>
                <span className={`font-bold font-mono text-xl ${acc.balance > 0 ? 'text-white' : 'text-gray-400'}`}>
                    ${acc.balance.toFixed(2)}
                </span>
             </div>
          </div>
          
          <div className="text-xs text-gray-500 flex items-center gap-1">
             <Clock size={12} />
             <span>Created: {new Date(acc.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
      
      {stats.length === 0 && (
        <div className="col-span-full py-12 text-center text-gray-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
            No loan accounts found. Create one to get started.
        </div>
      )}
    </div>

    <LoanAccountModal 
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingAccount(null); }}
        onSuccess={() => { fetchData(); if(refreshKey) window.location.reload(); }}
        account={editingAccount}
    />
    </>
  );
}
