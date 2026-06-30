import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { Web3Provider } from './context/Web3Context';
import NetworkBanner from './components/NetworkBanner';
import ReferralPage from './pages/ReferralPage';
import CreatePage from './pages/CreatePage';
import NavBar from './utils/navbar/NavBar';
import Header from './utils/header/Header';
import Footer from './utils/footer/Footer';
import DisclaimerPage from './pages/DisclaimerPage';
import AllPoolsPage from './pages/AllPoolsPage';
import PoolDetailPage from './pages/PoolDetailPage';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <Web3Provider>
        <BrowserRouter>
          <div className="app-shell">
            <Header />
            <NetworkBanner />
            <NavBar />
            <main className="App-Container">
              <Routes>
                <Route path="/" element={<AllPoolsPage />} />
                <Route path="/pool/:address" element={<PoolDetailPage />} />
                <Route path="/create" element={<CreatePage />} />
                <Route path="/referral" element={<ReferralPage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </Web3Provider>
    </ToastProvider>
  );
}

export default App;
