import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function Kabadiwalas() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDealers(); }, []);

  async function loadDealers() {
    const { data } = await supabase.from('kabadiwala_profiles').select('*').order('created_at', { ascending: false });
    setDealers(data || []);
    setLoading(false);
  }

  async function handleApprove(id: string) {
    await supabase.from('kabadiwala_profiles').update({ status: 'verified', aadhaar_verified: true }).eq('id', id);
    loadDealers();
  }

  async function handleSuspend(id: string) {
    await supabase.from('kabadiwala_profiles').update({ status: 'suspended' }).eq('id', id);
    loadDealers();
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      verified: 'bg-green-100 text-green-700',
      pending_verification: 'bg-yellow-100 text-yellow-700',
      suspended: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kabadiwala Partners</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickups</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pincodes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {dealers.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{d.name || '—'}</td>
                <td className="px-6 py-4">{getStatusBadge(d.status)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">⭐ {d.rating?.toFixed(1) || '0.0'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{d.total_pickups}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{d.service_pincodes?.join(', ') || '—'}</td>
                <td className="px-6 py-4 space-x-2">
                  {d.status === 'pending_verification' && (
                    <button onClick={() => handleApprove(d.id)} className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600">Approve</button>
                  )}
                  {d.status === 'verified' && (
                    <button onClick={() => handleSuspend(d.id)} className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600">Suspend</button>
                  )}
                  {d.status === 'suspended' && (
                    <button onClick={() => handleApprove(d.id)} className="px-3 py-1 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600">Reactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-6 text-center text-gray-500">Loading...</p>}
        {!loading && dealers.length === 0 && <p className="p-6 text-center text-gray-500">No kabadiwalas registered yet.</p>}
      </div>
    </div>
  );
}
