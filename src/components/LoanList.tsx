"use client";
import { useEffect, useState, useMemo } from 'react';
import api from '../lib/api';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import TableFilters from './TableFilters';

// Helper to map account IDs to names since backend returns just IDs in transactions
interface LoanAccount {
  id: number;
  name: string;
  type: string;
}

export default function LoanList({ refreshKey }: { refreshKey?: number }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<LoanAccount[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    Promise.all([
      api.get('/loans/transactions'),
      api.get('/loans/accounts')
    ]).then(([txnRes, accRes]) => {
      setTransactions(txnRes.data);
      setAccounts(accRes.data);
    });
  }, [refreshKey]);

  // Account helper
  const getAccountName = (id: number) => {
    const account = accounts.find(a => a.id === id);
    return account ? `${account.name} (${account.type})` : `Account #${id}`;
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Delete this transaction?")) return;
    await api.delete(`/loans/transactions/${id}`);
    const res = await api.get('/loans/transactions');
    setTransactions(res.data);
    // Ideally we'd refresh the parent to update balances
    window.location.reload();
  }

  // Filter accounts for dropdown
  const filterAccounts = accounts.map(a => ({ id: a.id, name: `${a.name} (${a.type})` }));

  // Filter and sort
  const filteredAndSortedTxns = useMemo(() => {
    let filtered = transactions.filter(t => {
      const matchSearch = searchTerm === '' || 
        getAccountName(t.loan_account_id).toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const tDate = new Date(t.date);
      const matchDate = (!dateFrom || tDate >= new Date(dateFrom)) && (!dateTo || tDate <= new Date(dateTo));
      
      const matchType = !selectedType || t.type === selectedType;
      
      const matchAccount = !selectedAccount || t.loan_account_id === parseInt(selectedAccount);

      return matchSearch && matchDate && matchType && matchAccount;
    });

    filtered.sort((a, b) => {
      let valA:any = a[sortBy];
      let valB:any = b[sortBy];

      if (sortBy === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else if (sortBy === 'account') {
        valA = getAccountName(a.loan_account_id);
        valB = getAccountName(b.loan_account_id);
      }

      if(valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if(valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, accounts, searchTerm, dateFrom, dateTo, selectedType, selectedAccount, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedTxns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTxns = filteredAndSortedTxns.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => setCurrentPage(page);

  return (
    <>
      <TableFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        selectedAccount={selectedAccount}
        onAccountChange={setSelectedAccount}
        accounts={filterAccounts}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        types={['PRINCIPAL', 'REPAYMENT']}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(f, o) => { setSortBy(f); setSortOrder(o); }}
        onClearFilters={() => { setSearchTerm(''); setDateFrom(''); setDateTo(''); setSelectedType(''); setSelectedAccount(''); }}
        typeLabel="Transaction Type"
      />

      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4 sm:mb-6">Transaction History</h3>

        {/* Mobile: stacked transaction cards */}
        <div className="sm:hidden divide-y divide-white/10">
          {currentTxns.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No transactions found.</p>
          ) : (
            currentTxns.map(t => (
              <div key={t.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-indigo-300 truncate">{getAccountName(t.loan_account_id)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(t.date).toLocaleDateString()} &bull;{' '}
                    <span className={`font-bold ${t.type === 'PRINCIPAL' ? 'text-purple-400' : 'text-emerald-400'}`}>{t.type}</span>
                  </p>
                  {t.description && <p className="text-xs text-gray-500 truncate mt-0.5">{t.description}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className={`font-bold ${t.type === 'PRINCIPAL' ? 'text-purple-400' : 'text-emerald-400'}`}>
                    ${t.amount.toFixed(2)}
                  </p>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 mt-1 hover:bg-white/10 rounded text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="text-xs uppercase text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Account</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {currentTxns.length === 0 ? (
                 <tr><td colSpan={6} className="py-8 text-center text-gray-500">No transactions found.</td></tr>
              ) : (
                currentTxns.map(t => (
                  <tr key={t.id} className="hover:bg-white/5">
                    <td className="py-3 px-4 text-gray-400">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-medium text-indigo-300">
                        {getAccountName(t.loan_account_id)}
                    </td>
                    <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'PRINCIPAL' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                            {t.type}
                        </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 truncate max-w-[200px]">{t.description}</td>
                    <td className={`py-3 px-4 text-right font-bold ${t.type === 'PRINCIPAL' ? 'text-purple-400' : 'text-emerald-400'}`}>
                        ${t.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                        <button onClick={() => handleDelete(t.id)} className="p-1 hover:bg-white/10 rounded text-red-500">
                            <Trash2 size={14} />
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
             <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <div className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="p-2 bg-white/5 rounded disabled:opacity-50"><ChevronLeft size={16}/></button>
                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 bg-white/5 rounded disabled:opacity-50"><ChevronRight size={16}/></button>
                </div>
             </div>
        )}
      </div>
    </>
  );
}
