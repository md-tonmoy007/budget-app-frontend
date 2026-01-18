"use client";
import { useEffect, useState, useMemo } from 'react';
import api from '../lib/api';
import { Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import EditExpenseModal from './EditExpenseModal';
import TableFilters from './TableFilters';

interface Account {
  id: number;
  name: string;
}

export default function ExpenseList({ refreshKey }: { refreshKey?: number }) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
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

  const fetchExpenses = () => {
    api.get('/expenses').then(res => setExpenses(res.data));
  };

  const fetchAccounts = () => {
    api.get('/accounts').then(res => setAccounts(res.data));
  };

  useEffect(() => {
    fetchExpenses();
    fetchAccounts();
  }, [refreshKey]);

  const handleDelete = async (id: number) => {
    if(!confirm("Delete this expense?")) return;
    await api.delete(`/expenses/${id}`);
    fetchExpenses();
  }

  // Extract unique expense types
  const expenseTypes = useMemo(() => {
    const types = new Set(expenses.map(exp => exp.expense_type));
    return Array.from(types).sort();
  }, [expenses]);

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter(exp => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.expense_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.account_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date range filter
      const expDate = new Date(exp.datetime);
      const matchesDateFrom = !dateFrom || expDate >= new Date(dateFrom + 'T00:00:00');
      const matchesDateTo = !dateTo || expDate <= new Date(dateTo + 'T23:59:59');
      
      // Account filter
      const matchesAccount = !selectedAccount || exp.account_id === parseInt(selectedAccount);
      
      // Type filter
      const matchesType = !selectedType || exp.expense_type === selectedType;
      
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
          compareValue = (a.expense_type || '').localeCompare(b.expense_type || '');
          break;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [expenses, searchTerm, dateFrom, dateTo, selectedAccount, selectedType, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpenses = filteredAndSortedExpenses.slice(startIndex, endIndex);

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
        types={expenseTypes}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        typeLabel="Expense Type"
      />

      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">All Expenses</h3>
          <div className="text-sm text-gray-400">
            {filteredAndSortedExpenses.length !== expenses.length && (
              <span>Showing {filteredAndSortedExpenses.length} of {expenses.length} expenses</span>
            )}
            {filteredAndSortedExpenses.length === expenses.length && (
              <span>{expenses.length} total expenses</span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
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
              {currentExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    {filteredAndSortedExpenses.length === 0 && expenses.length > 0 
                      ? "No expenses match your filters." 
                      : "No expenses found."}
                  </td>
                </tr>
              ) : (
                currentExpenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-white/5">
                    <td className="py-3 text-gray-400">{new Date(exp.datetime).toLocaleDateString()}</td>
                    <td className="py-3 text-indigo-300 font-medium">{exp.account_name || '-'}</td>
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
                ))
              )}
            </tbody>
            {filteredAndSortedExpenses.length > 0 && (
                <tfoot className="border-t-2 border-white/10 font-bold bg-white/5">
                    <tr>
                        <td colSpan={4} className="py-4 px-4 text-right uppercase text-xs tracking-wider text-gray-400">Total Filtered</td>
                        <td className="py-4 text-right text-red-400">
                            -${filteredAndSortedExpenses.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                        </td>
                        <td></td>
                    </tr>
                </tfoot>
            )}
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedExpenses.length)} of {filteredAndSortedExpenses.length} expenses
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
                      ? 'bg-indigo-600 text-white' 
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
      
      {editingExpense && (
        <EditExpenseModal 
          expense={editingExpense} 
          onClose={() => setEditingExpense(null)} 
          onUpdate={fetchExpenses} 
        />
      )}
    </>
  );
}
