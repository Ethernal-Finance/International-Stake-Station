import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReferralPage from './pages/ReferralPage.js';
import CreatePage from './pages/CreatePage.js';
import NavBar from './utils/navbar/NavBar.js';
import Header from './utils/header/Header.js';
import Footer from './utils/footer/Footer.js';
import './App.css'
import DisclaimerPage from './pages/DisclaimerPage.js';
import AllPoolsPage from './pages/AllPoolsPage.js';

function App() {
  return (
  
    <BrowserRouter> 
    <Header/>
    <NavBar />
     <div className='App-Container'>
     
      
        <Routes>
          <Route path="/" element={<AllPoolsPage />} />
          <Route path="create" element={<CreatePage />} />
          <Route path="referral" element={<ReferralPage />} />
          <Route path="disclaimer" element={<DisclaimerPage />} />
        </Routes>
      </div>

    <Footer/>
    </BrowserRouter>
    
  );
}

export default App;
