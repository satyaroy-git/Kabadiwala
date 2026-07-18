import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const [stats, setStats] = useState({ households: 0, kabadiwalas: 0, bookings: 0, revenue: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [{ count: households }, { count: kabadiwalas }, { data: bookings }, { data: transactions }] = await Promise.all([
      supabase.from('household_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('kabadiwala_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('id'),
      supabase.from('transactions').select('commission_amount'),
    ]);

    const revenue = transactions?.reduce((sum: number, t: any) => sum + (t.commission_amount || 0), 0) || 0;
    setStats({
      households: households || 0,
      kabadiwalas: kabadiwalas || 0,
      bookings: bookings?.length || 0,
      revenue,
    });
  }

  const cards = [
    { label: 'Households', value: stats.households, icon: '🏠', color: 'bg-blue-50 text-blue-700' },
    { label: 'Kabadiwalas', value: stats.kabadiwalas, icon: '🚛', color: 'bg-orange-50 text-orange-700' },
    { label: 'Total Bookings', value: stats.bookings, icon: '📋', color: 'bg-green-50 text-green-700' },
    { label: 'Platform Revenue', value: `₹${stats.revenue.toFixed(0)}`, icon: '💰', color: 'bg-purple-50 text-purple-700' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className={`${card.color} rounded-xl p-6`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-sm opacity-75">{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
