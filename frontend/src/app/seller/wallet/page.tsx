'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Wallet, WalletTransaction } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function SellerWalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchWallet = () => {
    api.wallet.get().then((d) => setWallet(d as Wallet)).catch(() => {});
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await api.wallet.withdraw(Number(withdrawAmount), { accountNumber, bankName });
      setMessage('Withdrawal request submitted successfully');
      setWithdrawAmount('');
      fetchWallet();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout type="seller">
      <h1 className="mb-6 text-2xl font-bold">Wallet</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="card bg-gradient-to-br from-primary to-purple-600 text-white">
          <p className="text-sm text-white/70">Available Balance</p>
          <p className="text-3xl font-bold">{formatPrice(wallet?.availableBalance || 0)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Pending in Escrow</p>
          <p className="text-3xl font-bold text-amber-500">{formatPrice(wallet?.pendingEscrow || 0)}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={handleWithdraw} className="card space-y-4">
          <h2 className="font-semibold">Withdraw Earnings</h2>
          {message && <div className="rounded-lg bg-primary/5 p-3 text-sm">{message}</div>}
          <input className="input-field" placeholder="Amount (₦)" type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required min="1000" />
          <input className="input-field" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
          <input className="input-field" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Processing...' : 'Withdraw Funds'}
          </button>
        </form>

        <div className="card">
          <h2 className="mb-4 font-semibold">Transaction History</h2>
          {!wallet?.transactions?.length ? (
            <p className="text-sm text-gray-500">No transactions yet</p>
          ) : (
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {(wallet.transactions as WalletTransaction[]).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm">
                  <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(t.createdAt)}</p>
                  </div>
                  <p className={`font-semibold ${t.amount >= 0 ? 'text-success' : 'text-error'}`}>
                    {t.amount >= 0 ? '+' : ''}{formatPrice(Math.abs(t.amount))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
