import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header/Header';
import Dashboard from './Dashboard/Dashboard';
import InventoryPage from './Inventory/InventoryPage';
import Register from './Login/Register';
import Login from './Login/Login';
import PCBuilder from './PC-Builder/PCBuilder';

function App() {
  return (
    <>
          <Router>
              <Header />
              <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/pc-builder" element={<PCBuilder />} />
              </Routes>
          </Router>
    </>
  )
}

export default App
