import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    const { data } = await supabase.from('household_profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Household Users</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pickups</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recycled (kg)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.phone || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.total_pickups}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.total_recycled_kg?.toFixed(1)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="p-6 text-center text-gray-500">Loading...</p>}
        {!loading && users.length === 0 && <p className="p-6 text-center text-gray-500">No households registered yet.</p>}
      </div>
    </div>
  );
}
