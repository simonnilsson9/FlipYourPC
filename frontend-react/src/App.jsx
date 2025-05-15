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
import AdminPage from './Admin/AdminPage';  // ⬅ Lägg till denna
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                {/* Offentliga routes */}
                <Route path="/logga-in" element={<Login />} />
                <Route path="/registrera" element={<Register />} />

                {/* Skyddade routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/lager"
                    element={
                        <ProtectedRoute>
                            <InventoryPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/pc-byggare"
                    element={
                        <ProtectedRoute>
                            <PCBuilder />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/mina-sidor"
                    element={
                        <ProtectedRoute>
                            <MyPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;