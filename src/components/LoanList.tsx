"use client";
import { useEffect, useState, useMemo } from 'react';
import api from '../lib/api';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import TableFilters from './TableFilters';

// Since TableFilters expects accounts, we need to mock or fetch them if loans had accounts. 
// But loans don't have accounts in the current model. We can pass an empty array or hide the account filter.
// The current TableFilters requires accounts. I might need to make it optional or just pass empty.
// Also loans don't have 'types' in the same way (just GIVEN/TAKEN).

export default function LoanList({ refreshKey }: { refreshKey?: number }) {
  const [loans, setLoans] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  // Filter and sort loans
  const filteredAndSortedLoans = useMemo(() => {
    let filtered = loans.filter(loan => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        loan.person_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date range filter
      const loanDate = new Date(loan.date);
      const matchesDateFrom = !dateFrom || loanDate >= new Date(dateFrom + 'T00:00:00');
      const matchesDateTo = !dateTo || loanDate <= new Date(dateTo + 'T23:59:59');
      
      // Type filter
      const matchesType = !selectedType || loan.type === selectedType;
      
      return matchesSearch && matchesDateFrom && matchesDateTo && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch(sortBy) {
        case 'date':
          compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          compareValue = a.amount - b.amount;
          break;
        case 'type':
          compareValue = (a.type || '').localeCompare(b.type || '');
          break;
        // Person sort if needed, leveraging the 'account' sort field in UI or adding a new one?
        // Let's use 'account' field in TableFilters to represent 'Person' for now? 
        // Or just map it manually. The TableFilters component is generic but has specific labels.
        // Actually TableFilters has 'onSortChange' but the dropdown options are hardcoded.
        // I will stick to what is available or accept 'account' sorting as 'person' name here roughly?
        // Wait, TableFilters has hardcoded options: Date, Amount, Account, Type.
        // I can treat 'Account' as 'Person' for sorting purposes in the UI if I want, or just ignore it.
        // Let's map 'account' sort to 'person_name' here.
        case 'account': 
           compareValue = (a.person_name || '').localeCompare(b.person_name || '');
           break;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [loans, searchTerm, dateFrom, dateTo, selectedType, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedLoans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLoans = filteredAndSortedLoans.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFrom, dateTo, selectedType, sortBy, sortOrder]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
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
        selectedAccount="" // Loans don't have accounts, so we pass empty and hide logic if possible or just ignore
        onAccountChange={() => {}} // No-op
        accounts={[]} // Empty accounts
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        types={['GIVEN', 'TAKEN']}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        typeLabel="Loan Type"
      />
      {/* Note: The 'Account' dropdown in TableFilters will be empty/useless here, which is acceptable for now or I could update TableFilters to hide it if accounts is empty. 
          For now I'll leave it as is, it just won't show options. */}

      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Total Loans</h3>
          <div className="text-sm text-gray-400">
            {filteredAndSortedLoans.length !== loans.length && (
              <span>Showing {filteredAndSortedLoans.length} of {loans.length} records</span>
            )}
            {filteredAndSortedLoans.length === loans.length && (
              <span>{loans.length} total records</span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
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
                  onClick={() => handleColumnSort('account')} // Mapping 'account' sort to Person Name
                >
                  Person{getSortIndicator('account')}
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
              {currentLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                     {filteredAndSortedLoans.length === 0 && loans.length > 0 
                      ? "No records match your filters." 
                      : "No records found."}
                  </td>
                </tr>
              ) : (
                currentLoans.map(loan => (
                  <tr key={loan.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 text-gray-400">{new Date(loan.date).toLocaleDateString()}</td>
                    <td className="py-3 font-medium">{loan.person_name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${loan.type === 'GIVEN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {loan.type}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 truncate max-w-[200px]">{loan.description}</td>
                    <td className={`py-3 text-right font-bold ${loan.type === 'GIVEN' ? 'text-green-400' : 'text-red-400'}`}>
                      ${loan.amount.toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      <button onClick={() => handleDelete(loan.id)} className="p-1 hover:bg-white/10 rounded text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredAndSortedLoans.length > 0 && (
                <tfoot className="border-t-2 border-white/10 font-bold bg-white/5">
                    <tr>
                        <td colSpan={4} className="py-4 px-4 text-right uppercase text-xs tracking-wider text-gray-400">
                            Totals
                        </td>
                        <td className="py-4 px-4 text-right space-y-1">
                           {/* Calculate totals dynamically */}
                           {(() => {
                               const givenTotal = filteredAndSortedLoans
                                   .filter(t => t.type === 'GIVEN')
                                   .reduce((sum, t) => sum + t.amount, 0);
                               const takenTotal = filteredAndSortedLoans
                                   .filter(t => t.type === 'TAKEN')
                                   .reduce((sum, t) => sum + t.amount, 0);
                               
                               return (
                                   <>
                                     {givenTotal > 0 && <div className="text-green-400">Given: ${givenTotal.toFixed(2)}</div>}
                                     {takenTotal > 0 && <div className="text-red-400">Taken: ${takenTotal.toFixed(2)}</div>}
                                     {givenTotal === 0 && takenTotal === 0 && <div className="text-gray-500">$0.00</div>}
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
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedLoans.length)} of {filteredAndSortedLoans.length} records
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
                      ? 'bg-blue-600 text-white' 
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
    </>
  );
}
