"use client";
import React from 'react';
import Navbar from '../../../components/Navbar';
import InvestmentAccountsList from '../../../components/InvestmentAccountsList';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function InvestmentAccountsPage() {
  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
            <Link href="/investments" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
                <ArrowLeft size={16} className="mr-2" />
                Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Investment Accounts</h1>
            <p className="text-gray-400 mt-1">Detailed overview of all your investment portfolios</p>
        </div>
        
        <InvestmentAccountsList />
      </div>
    </div>
  );
}
