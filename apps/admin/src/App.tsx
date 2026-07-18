import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Kabadiwalas } from './pages/Kabadiwalas';
import { Bookings } from './pages/Bookings';
import { RateCard } from './pages/RateCard';
import { Transactions } from './pages/Transactions';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="kabadiwalas" element={<Kabadiwalas />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="rates" element={<RateCard />} />
        <Route path="transactions" element={<Transactions />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
