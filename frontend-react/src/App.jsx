import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header/Header';
import Dashboard from './Dashboard/Dashboard';
import InventoryPage from './Inventory/InventoryPage';
import Register from './Login/Register';
import Login from './Login/Login';
import PCBuilder from './PC-Builder/PCBuilder';
import MyPage from './MyPages/MyPage';

function App() {
  return (
    <>
          <Router>
              <Header />
              <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/lager" element={<InventoryPage />} />
                  <Route path="/registrera" element={<Register />} />
                  <Route path="/logga-in" element={<Login />} />
                  <Route path="/pc-byggare" element={<PCBuilder />} />
                  <Route path="/mina-sidor" element={<MyPage />} />
              </Routes>
          </Router>
    </>
  )
}

export default App
