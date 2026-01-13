"use client";
import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import LoanForm from '../../components/LoanForm';
import LoanList from '../../components/LoanList';
import LoanDashboard from '../../components/LoanDashboard';

export default function LoansPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-8">Loan Management</h1>
        
        <LoanDashboard refreshKey={refreshKey} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <LoanForm onSuccess={() => setRefreshKey(k => k + 1)} />
            </div>
            <div className="lg:col-span-2">
                <LoanList refreshKey={refreshKey} />
            </div>
        </div>
      </div>
    </div>
  );
}
