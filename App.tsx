
import React from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Players from './pages/Players';
import PlayerProfile from './pages/PlayerProfile';
import Products from './pages/Products';
import AddProduct from './pages/AddProduct';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import POS from './pages/POS';
import SalesHistory from './pages/SalesHistory';
import Profile from './pages/Profile';
import StoreData from './pages/StoreData';
import Settings from './pages/Settings';
import { Analytics } from './pages/Analytics';
import BottomNav from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import { StoreProvider } from './context/StoreContext';
import { useToast } from './hooks/useToast';
import { AuthProvider, useAuth } from './context/AuthContext';

const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useAuth();
  const isGuest = localStorage.getItem('isGuest') === 'true';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

import Sidebar from './components/Sidebar';

const Layout = () => {
  return (
    <div className="flex min-h-screen w-full bg-[#121212]">
      <Sidebar />
      <div className="relative flex flex-col flex-1 min-h-screen text-white font-display overflow-x-hidden">
        <div className="flex-grow pb-28 md:pb-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { toasts, hideToast } = useToast();

  return (
    <AuthProvider>
      <StoreProvider>
        <ToastContainer toasts={toasts} onClose={hideToast} />
        <HashRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }>
              <Route index element={<Dashboard />} />
              <Route path="players" element={<Players />} />
              <Route path="products" element={<Products />} />
              <Route path="events" element={<Events />} />
              <Route path="player/:id" element={<PlayerProfile />} />
              <Route path="products/add" element={<AddProduct />} />
              <Route path="products/edit/:id" element={<AddProduct />} />
              <Route path="events/:id" element={<EventDetails />} />
              <Route path="pos" element={<POS />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="sales-history" element={<SalesHistory />} />
              <Route path="profile" element={<Profile />} />
              <Route path="store-data" element={<StoreData />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </HashRouter>
      </StoreProvider>
    </AuthProvider>
  );
};

export default App;