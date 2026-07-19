"use client";
import { useEffect, useState, useMemo } from 'react';
import api from '../lib/api';
import { Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import EditIncomeModal from './EditIncomeModal';
import TableFilters from './TableFilters';

interface Account {
  id: number;
  name: string;
}

export default function IncomeList({ refreshKey }: { refreshKey?: number }) {
  const [income, setIncome] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingIncome, setEditingIncome] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchIncome = () => {
    api.get('/income').then(res => setIncome(res.data));
  };

  const fetchAccounts = () => {
    api.get('/accounts').then(res => setAccounts(res.data));
  };

  useEffect(() => {
    fetchIncome();
    fetchAccounts();
  }, [refreshKey]);

  const handleDelete = async (id: number) => {
    if(!confirm("Delete this income?")) return;
    await api.delete(`/income/${id}`);
    fetchIncome();
  }

  // Extract unique income types
  const incomeTypes = useMemo(() => {
    const types = new Set(income.map(inc => inc.income_type));
    return Array.from(types).sort();
  }, [income]);

  // Filter and sort income
  const filteredAndSortedIncome = useMemo(() => {
    let filtered = income.filter(inc => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        inc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.income_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inc.account_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date range filter
      const incDate = new Date(inc.datetime);
      const matchesDateFrom = !dateFrom || incDate >= new Date(dateFrom + 'T00:00:00');
      const matchesDateTo = !dateTo || incDate <= new Date(dateTo + 'T23:59:59');
      
      // Account filter
      const matchesAccount = !selectedAccount || inc.account_id === parseInt(selectedAccount);
      
      // Type filter
      const matchesType = !selectedType || inc.income_type === selectedType;
      
      return matchesSearch && matchesDateFrom && matchesDateTo && matchesAccount && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch(sortBy) {
        case 'date':
          compareValue = new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
          break;
        case 'amount':
          compareValue = a.amount - b.amount;
          break;
        case 'account':
          compareValue = (a.account_name || '').localeCompare(b.account_name || '');
          break;
        case 'type':
          compareValue = (a.income_type || '').localeCompare(b.income_type || '');
          break;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [income, searchTerm, dateFrom, dateTo, selectedAccount, selectedType, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedIncome.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIncome = filteredAndSortedIncome.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo, selectedAccount, selectedType, sortBy, sortOrder]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setSelectedAccount('');
    setSelectedType('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
  };

  // Column header click for quick sort
  const handleColumnSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIndicator = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

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
        accounts={accounts}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        types={incomeTypes}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        typeLabel="Income Type"
      />

      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4 sm:mb-6">
          <h3 className="text-lg font-semibold">All Income</h3>
          <div className="text-sm text-gray-400">
            {filteredAndSortedIncome.length !== income.length && (
              <span>Showing {filteredAndSortedIncome.length} of {income.length} income entries</span>
            )}
            {filteredAndSortedIncome.length === income.length && (
              <span>{income.length} total income entries</span>
            )}
          </div>
        </div>

        {/* Mobile: stacked income cards */}
        <div className="sm:hidden divide-y divide-white/10">
          {currentIncome.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              {filteredAndSortedIncome.length === 0 && income.length > 0
                ? "No income matches your filters."
                : "No income found."}
            </p>
          ) : (
            currentIncome.map(inc => (
              <div key={inc.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{inc.income_type}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {new Date(inc.datetime).toLocaleDateString()} &bull; <span className="text-green-300">{inc.account_name || '-'}</span>
                  </p>
                  {inc.description && <p className="text-xs text-gray-500 truncate mt-0.5">{inc.description}</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-bold text-green-400">+${inc.amount.toFixed(2)}</p>
                  <div className="flex justify-end gap-1 mt-1">
                    <button onClick={() => setEditingIncome(inc)} className="p-1.5 hover:bg-white/10 rounded text-green-400">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(inc.id)} className="p-1.5 hover:bg-white/10 rounded text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
          {filteredAndSortedIncome.length > 0 && (
            <div className="py-3 flex items-center justify-between font-bold">
              <span className="uppercase text-xs tracking-wider text-gray-400">Total Filtered</span>
              <span className="text-green-400">
                +${filteredAndSortedIncome.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[500px]">
            <thead className="text-xs uppercase text-gray-400 border-b border-white/10">
              <tr>
                <th 
                  className="py-2 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleColumnSort('date')}
                >
                  Date{getSortIndicator('date')}
                </th>
                <th 
                  className="py-2 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleColumnSort('account')}
                >
                  Account{getSortIndicator('account')}
                </th>
                <th 
                  className="py-2 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleColumnSort('type')}
                >
                  Type{getSortIndicator('type')}
                </th>
                <th className="py-2">Description</th>
                <th 
                  className="py-2 text-right cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleColumnSort('amount')}
                >
                  Amount{getSortIndicator('amount')}
                </th>
                <th className="py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {currentIncome.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {filteredAndSortedIncome.length === 0 && income.length > 0 
                      ? "No income matches your filters." 
                      : "No income found."}
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
            {filteredAndSortedIncome.length > 0 && (
                <tfoot className="border-t-2 border-white/10 font-bold bg-white/5">
                    <tr>
                        <td colSpan={4} className="py-4 px-4 text-right uppercase text-xs tracking-wider text-gray-400">Total Filtered</td>
                        <td className="py-4 text-right text-green-400">
                            +${filteredAndSortedIncome.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                        </td>
                        <td></td>
                    </tr>
                </tfoot>
            )}
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedIncome.length)} of {filteredAndSortedIncome.length} income entries
            </div>
            <div className="flex items-center flex-wrap gap-2">
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
      </div>
      
      {editingIncome && (
        <EditIncomeModal 
          income={editingIncome} 
          onClose={() => setEditingIncome(null)} 
          onUpdate={fetchIncome} 
        />
      )}
    </>
  );
}
