"use client";
import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Briefcase, TrendingUp, TrendingDown, Clock, Edit2, Trash2 } from 'lucide-react';
import InvestmentAccountModal from './InvestmentAccountModal';

interface AccountStats {
  id: number;
  company_name: string;
  agent_name: string;
  status: string;
  created_at: string;
  total_invested: number;
  total_withdrawn: number;
  net_value: number;
}

export default function InvestmentAccountsList() {
  const [stats, setStats] = useState<AccountStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = () => {
    Promise.all([
      api.get('/investments/accounts'),
      api.get('/investments/transactions')
    ]).then(([accRes, txnRes]) => {
      const accounts = accRes.data;
      const txns = txnRes.data;

      const accountStats = accounts.map((acc: any) => {
        const accTxns = txns.filter((t: any) => t.account_id === acc.id);
        const invested = accTxns
          .filter((t: any) => t.type === 'INVEST')
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        const withdrawn = accTxns
          .filter((t: any) => t.type === 'WITHDRAW')
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        
        return {
          ...acc,
          total_invested: invested,
          total_withdrawn: withdrawn,
          net_value: invested - withdrawn
        };
      });

      setStats(accountStats);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete account "${name}"?\nWARNING: This will delete ALL associated transactions!`)) return;
    try {
        await api.delete(`/investments/accounts/${id}`);
        fetchData();
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

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map(acc => (
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
                onClick={(e) => { e.stopPropagation(); handleDelete(acc.id, acc.company_name); }} 
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded text-red-400"
                title="Delete Account"
            >
                <Trash2 size={16} />
            </button>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Briefcase size={24} />
            </div>
            <div>
                <h3 className="font-bold text-lg leading-tight">{acc.company_name}</h3>
                <p className="text-sm text-gray-400">{acc.agent_name}</p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${acc.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {acc.status}
                </span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Invested</span>
                <span className="font-mono font-medium text-emerald-400">${acc.total_invested.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Withdrawn</span>
                <span className="font-mono font-medium text-blue-400">${acc.total_withdrawn.toFixed(2)}</span>
             </div>
             <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                <span className="text-gray-300 font-medium">Net Value</span>
                <span className={`font-bold font-mono ${acc.net_value >= 0 ? 'text-white' : 'text-red-400'}`}>
                    ${acc.net_value.toFixed(2)}
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
            No investment accounts found. Create one to get started.
        </div>
      )}
    </div>

    <InvestmentAccountModal 
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingAccount(null); }}
        onSuccess={fetchData}
        account={editingAccount}
    />
    </>
  );
}
