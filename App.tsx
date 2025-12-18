
import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
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
import BottomNav from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import { StoreProvider } from './context/StoreContext';
import { useToast } from './hooks/useToast';

const Layout = () => {
  return (
    // Max-width constrain for desktop to look like mobile app
    <div className="flex justify-center min-h-screen w-full">
      <div className="relative flex flex-col w-full max-w-[480px] min-h-screen text-white font-display overflow-x-hidden shadow-2xl">
        <div className="flex-grow pb-28">
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
    <StoreProvider>
      <ToastContainer toasts={toasts} onClose={hideToast} />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="players" element={<Players />} />
            <Route path="products" element={<Products />} />
            <Route path="events" element={<Events />} />
          </Route>
          <Route path="/player/:id" element={<PlayerProfile />} />
          <Route path="/products/add" element={<AddProduct />} />
          <Route path="/products/edit/:id" element={<AddProduct />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/sales-history" element={<SalesHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/store-data" element={<StoreData />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;