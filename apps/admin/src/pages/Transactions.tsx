import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => { loadTransactions(); }, []);

  async function loadTransactions() {
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(50);
    setTransactions(data || []);
    setTotalRevenue(data?.reduce((sum: number, t: any) => sum + (t.commission_amount || 0), 0) || 0);
    setLoading(false);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg">
          <span className="text-sm">Platform Revenue: </span>
          <span className="font-bold text-lg">₹{totalRevenue.toFixed(0)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scrap Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission (10%)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt #</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{txn.total_amount}</td>
                <td className="px-6 py-4 text-sm font-bold text-green-600">₹{txn.commission_amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${txn.payment_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {txn.payment_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{txn.receipt_number || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-6 text-center text-gray-500">Loading...</p>}
        {!loading && transactions.length === 0 && <p className="p-6 text-center text-gray-500">No transactions yet.</p>}
      </div>
    </div>
  );
}
