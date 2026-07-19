"use client";
import { useEffect, useState } from 'react';
import api from '../lib/api';
import AccountForm from './AccountForm';
import BalanceAdjustment from './BalanceAdjustment';
import EditAccountModal from './EditAccountModal';

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
}

export default function AccountTable() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data);
    } catch (error) {
      console.error("Failed to fetch accounts", error);
    }
  };

  const deleteAccount = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    await api.delete(`/accounts/${id}`);
    fetchAccounts();
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
      <div className="p-4 sm:p-6 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Accounts</h3>
        {/* We could add an 'Add Account' button here later */}
      </div>

      {/* Mobile: stacked account cards */}
      <div className="sm:hidden divide-y divide-white/10">
        {accounts.length === 0 ? (
            <p className="px-4 py-4 text-center text-sm text-gray-500">No accounts found.</p>
        ) : (
            accounts.map((acc) => (
            <div key={acc.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="font-medium truncate">{acc.name}</p>
                        <p className="text-xs text-gray-400">{acc.type}</p>
                    </div>
                    <span className="font-mono font-bold text-green-400 shrink-0">${acc.balance.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                    <BalanceAdjustment accountId={acc.id} currentBalance={acc.balance} onUpdate={fetchAccounts} />
                    <button onClick={() => setEditingAccount(acc)} className="text-xs text-indigo-400 hover:text-indigo-300 py-1">Edit</button>
                    <button onClick={() => deleteAccount(acc.id)} className="text-xs text-red-400 hover:text-red-300 py-1">Delete</button>
                </div>
            </div>
            ))
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase text-gray-400">
            <tr>
              <th className="px-6 py-3">Account Name</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Balance</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {accounts.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No accounts found.</td>
                </tr>
            ) : (
                accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{acc.name}</td>
                    <td className="px-6 py-4 opacity-70">{acc.type}</td>
                    <td className="px-6 py-4 font-mono font-bold text-green-400">${acc.balance.toFixed(2)}</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <BalanceAdjustment accountId={acc.id} currentBalance={acc.balance} onUpdate={fetchAccounts} />
                            <button onClick={() => setEditingAccount(acc)} className="text-xs text-indigo-400 hover:text-indigo-300">Edit</button>
                            <button onClick={() => deleteAccount(acc.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                        </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 sm:p-6 border-t border-white/10 bg-white/5">
        <h4 className="text-sm font-medium mb-2 opacity-80">Add New Account</h4>
        <AccountForm onSuccess={fetchAccounts} />
      </div>
      
      {editingAccount && (
        <EditAccountModal 
            account={editingAccount} 
            onClose={() => setEditingAccount(null)} 
            onUpdate={fetchAccounts} 
        />
      )}
    </div>
  );
}
