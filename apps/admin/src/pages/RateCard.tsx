import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function RateCard() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState('');

  useEffect(() => { loadRates(); }, []);

  async function loadRates() {
    const { data } = await supabase.from('rate_cards').select('*').eq('is_active', true).order('sort_order');
    setRates(data || []);
    setLoading(false);
  }

  async function handleSave(id: string) {
    const newRate = parseFloat(editRate);
    if (isNaN(newRate) || newRate <= 0) return;

    const current = rates.find((r) => r.id === id);
    const change = current ? ((newRate - current.rate_per_kg) / current.rate_per_kg * 100) : 0;

    await supabase.from('rate_cards').update({
      rate_per_kg: newRate,
      previous_rate: current?.rate_per_kg,
      rate_change: Math.round(change * 100) / 100,
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    setEditingId(null);
    loadRates();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Rate Card Management</h1>
      <p className="text-gray-500 mb-6">Update scrap rates. Changes reflect immediately in the app.</p>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icon</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate (₹/kg)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rates.map((rate) => (
              <tr key={rate.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-xl">{rate.category_icon}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{rate.category_name}</td>
                <td className="px-6 py-4">
                  {editingId === rate.id ? (
                    <input
                      type="number"
                      value={editRate}
                      onChange={(e) => setEditRate(e.target.value)}
                      className="w-24 px-2 py-1 border rounded text-sm"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm font-bold text-green-700">₹{rate.rate_per_kg}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  {rate.rate_change ? (
                    <span className={rate.rate_change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {rate.rate_change > 0 ? '↑' : '↓'} {Math.abs(rate.rate_change).toFixed(1)}%
                    </span>
                  ) : '—'}
                </td>
                <td className="px-6 py-4">
                  {editingId === rate.id ? (
                    <div className="space-x-2">
                      <button onClick={() => handleSave(rate.id)} className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg">Save</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-lg">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingId(rate.id); setEditRate(String(rate.rate_per_kg)); }} className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg hover:bg-blue-100">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-6 text-center text-gray-500">Loading...</p>}
      </div>
    </div>
  );
}
