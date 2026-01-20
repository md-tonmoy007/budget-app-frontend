"use client";
import { useEffect, useState, useMemo } from 'react';
import api from '../lib/api';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import TableFilters from './TableFilters';

// Helper to map account IDs to names since backend returns just IDs in transactions
interface Account {
  id: number;
  company_name: string;
  agent_name: string;
}

export default function InvestmentList({ refreshKey }: { refreshKey?: number }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [assetAccounts, setAssetAccounts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    Promise.all([
      api.get('/investments/transactions'),
      api.get('/investments/accounts'),
      api.get('/accounts')
    ]).then(([txnRes, accRes, assetRes]) => {
      setTransactions(txnRes.data);
      setAccounts(accRes.data);
      setAssetAccounts(assetRes.data);
    });
  }, [refreshKey]);

  // Account helper
  const getAccountName = (id: number) => {
    const account = accounts.find(a => a.id === id);
    return account ? `${account.company_name} (${account.agent_name})` : `Account #${id}`;
  };

  const getAssetAccountName = (id: number) => {
    const account = assetAccounts.find(a => a.id === id);
    return account ? account.name : `Account #${id}`;
  };

  const handleDelete = async (id: number) => {
    if(!confirm("Delete this transaction?")) return;
    await api.delete(`/investments/transactions/${id}`);
    const res = await api.get('/investments/transactions');
    setTransactions(res.data);
  }

  // Reuse TableFilters but adapt 'accounts' prop format
  const filterAccounts = accounts.map(a => ({ id: a.id, name: `${a.company_name} (${a.agent_name})` }));

  // Filter and sort
  const filteredAndSortedTxns = useMemo(() => {
    let filtered = transactions.filter(t => {
      const matchSearch = searchTerm === '' || 
        getAccountName(t.account_id).toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const tDate = new Date(t.date);
      const matchDate = (!dateFrom || tDate >= new Date(dateFrom)) && (!dateTo || tDate <= new Date(dateTo));
      
      const matchType = !selectedType || t.type === selectedType;

      return matchSearch && matchDate && matchType;
    });

    filtered.sort((a, b) => {
      let valA:any = a[sortBy];
      let valB:any = b[sortBy];

      if (sortBy === 'date') {
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
      } else if (sortBy === 'account') {
        valA = getAccountName(a.account_id);
        valB = getAccountName(b.account_id);
      }

      if(valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if(valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [transactions, accounts, searchTerm, dateFrom, dateTo, selectedType, sortBy, sortOrder]);

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
        selectedAccount="" // Allow filter by account logic could be added to TableFilters if we map it
        onAccountChange={() => {}} 
        accounts={filterAccounts}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        types={['INVEST', 'WITHDRAW']}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(f, o) => { setSortBy(f); setSortOrder(o); }}
        onClearFilters={() => { setSearchTerm(''); setDateFrom(''); setDateTo(''); setSelectedType(''); }}
        typeLabel="Transaction Type"
      />

      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mt-6">
        <h3 className="text-lg font-semibold mb-6">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="text-xs uppercase text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Account (Company/Agent)</th>
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
                    <td className="py-3 px-4 font-medium text-emerald-300">
                        <div>{getAccountName(t.account_id)}</div>
                        {t.asset_account_id && (
                          <div className="text-[10px] text-gray-500 uppercase flex items-center gap-1 mt-1">
                            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                            Synced: {getAssetAccountName(t.asset_account_id)}
                          </div>
                        )}
                    </td>
                    <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'INVEST' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {t.type}
                        </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 truncate max-w-[200px]">{t.description}</td>
                    <td className={`py-3 px-4 text-right font-bold ${t.type === 'INVEST' ? 'text-emerald-400' : 'text-blue-400'}`}>
                        <div>${t.amount.toFixed(2)}</div>
                        {t.profit > 0 && (
                          <div className="text-[10px] text-emerald-500">
                            +${t.profit.toFixed(2)} profit
                          </div>
                        )}
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
            {filteredAndSortedTxns.length > 0 && (
                <tfoot className="border-t-2 border-white/10 font-bold bg-white/5">
                    <tr>
                        <td colSpan={4} className="py-4 px-4 text-right uppercase text-xs tracking-wider text-gray-400">
                            Totals
                        </td>
                        <td className="py-4 px-4 text-right space-y-1">
                           {/* Calculate totals dynamically */}
                           {(() => {
                               const investTotal = filteredAndSortedTxns
                                   .filter(t => t.type === 'INVEST')
                                   .reduce((sum, t) => sum + t.amount, 0);
                               const withdrawTotal = filteredAndSortedTxns
                                   .filter(t => t.type === 'WITHDRAW')
                                   .reduce((sum, t) => sum + t.amount, 0);
                               
                               return (
                                   <>
                                     {investTotal > 0 && <div className="text-emerald-400">Inv: ${investTotal.toFixed(2)}</div>}
                                     {withdrawTotal > 0 && <div className="text-blue-400">W/D: ${withdrawTotal.toFixed(2)}</div>}
                                     {investTotal === 0 && withdrawTotal === 0 && <div className="text-gray-500">$0.00</div>}
                                   </>
                               );
                           })()}
                        </td>
                        <td></td>
                    </tr>
                </tfoot>
            )}
          </table>
        </div>
        
        {/* Pagination Controls Reuse */}
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
