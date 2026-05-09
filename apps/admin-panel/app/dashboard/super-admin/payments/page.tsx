'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Search, 
  History as HistoryIcon,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PaymentHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real microservice setup, this would go through the API Gateway
      const response = await fetch('/api/payment/invoices');
      if (!response.ok) {
        throw new Error('Failed to fetch payment history');
      }
      const data = await response.json();
      
      // Ensure data is an array before sorting
      if (Array.isArray(data)) {
        data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPayments(data);
      } else {
        setPayments([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      // Fallback to mock if API fails during dev
      const loaded = JSON.parse(localStorage.getItem('mock_payment_history') || '[]');
      setPayments(loaded);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(p => 
    p.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.planName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tenantId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-10">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-foreground mb-2 text-gradient">Payment History</h1>
            <p className="text-muted-foreground">Global overview of all tenant subscription purchases and attempts.</p>
          </div>
          <div className="flex items-center space-x-3">
             <button 
               onClick={fetchPayments}
               disabled={loading}
               className="p-3 bg-muted hover:bg-accent rounded-2xl border border-border transition-all"
             >
                <RefreshCw className={`w-5 h-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
             </button>
             <div className="bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20 flex items-center space-x-2">
                <HistoryIcon className="w-4 h-4 text-primary" />
                <span className="text-xs font-black text-primary uppercase tracking-widest">Total Transactions: {payments.length}</span>
             </div>
          </div>
        </header>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
           <div className="md:col-span-2 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search by name, email, plan or ID..." 
                className="w-full bg-muted border border-border rounded-3xl pl-14 pr-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex justify-end">
             <button className="flex items-center space-x-2 bg-muted px-6 py-4 rounded-3xl border border-border hover:bg-accent transition-all text-sm font-bold">
               <Filter className="w-4 h-4" />
               <span>Filter</span>
             </button>
           </div>
        </div>

        {error && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[32px] flex items-center space-x-4 text-amber-600">
             <AlertCircle className="w-6 h-6 flex-shrink-0" />
             <p className="text-sm font-bold">Connected to fallback storage: {error}. Real-time syncing may be limited.</p>
          </div>
        )}

        {/* Table Content */}
        <div className="glass-premium rounded-[48px] border border-border overflow-hidden premium-shadow bg-background/50">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Transaction / Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Customer Details</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Plan & Amount</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                   <td colSpan={4} className="px-10 py-20 text-center">
                      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-muted-foreground font-bold">Loading transactions...</p>
                   </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-12 text-center text-muted-foreground">
                    <p className="font-bold">No payment records found.</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-primary/5 transition-all group">
                    <td className="px-10 py-8">
                      <p className="text-base font-black text-foreground uppercase">#{payment.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(payment.createdAt || payment.date).toLocaleString()}</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">
                          {payment.userName?.charAt(0) || payment.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-black text-foreground">{payment.userName || payment.name}</p>
                          <p className="text-xs text-muted-foreground">{payment.userEmail || payment.email} • {payment.tenantId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase mb-1">
                          {payment.planName || payment.plan}
                        </span>
                        <span className="text-sm font-black text-foreground">${payment.amount}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {payment.status === 'SUCCESS' || payment.status === 'PAID' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                         payment.status === 'PENDING' ? <Clock className="w-4 h-4 text-amber-500" /> :
                         <XCircle className="w-4 h-4 text-red-500" />}
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          payment.status === 'SUCCESS' || payment.status === 'PAID' ? 'text-emerald-500' :
                          payment.status === 'PENDING' ? 'text-amber-500' :
                          'text-red-500'
                        }`}>{payment.status}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
