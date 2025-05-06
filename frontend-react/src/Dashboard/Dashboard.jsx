import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [data, setData] = useState({
        inventoryValue: 0,
        componentCount: 0,
        totalSales: 0,
        totalProfit: 0,
        soldComputers: 0,
    });

    const navigate = useNavigate();

    useEffect(() => {
        // Kontrollera om användaren är inloggad
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            navigate("/login");  // Om användaren inte är inloggad, omdirigera till login-sidan
        } else {
            
            
        }
    }, [navigate]);

    useEffect(() => {
        // Här kan du anropa API för att hämta data
        // Exempel: fetch("/api/dashboard")
        // sedan sätta state med data från ditt API
    }, []);

    return (
        <div className="container mt-5">
            <h1 className="text-center text-white">Dashboard</h1>

            <div className="row row-cols-1 row-cols-md-4 g-4 mt-4">
                <div className="col">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <h5 className="card-title">Lagervärde</h5>
                            <p className="card-text">{data.inventoryValue} kr</p>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <h5 className="card-title">Antal komponenter</h5>
                            <p className="card-text">{data.componentCount}</p>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <h5 className="card-title">Sålda datorer</h5>
                            <p className="card-text">{data.soldComputers}</p>
                        </div>
                    </div>
                </div>
                <div className="col">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <h5 className="card-title">Total vinst</h5>
                            <p className="card-text">{data.totalProfit} kr</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Diagram sektion */}
            <div className="row mt-4">
                <div className="col-md-6">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <h5 className="card-title">Försäljning vs Vinst</h5>
                            {/* Här kan du placera ditt diagram, t.ex. med Chart.js eller annat bibliotek */}
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card bg-dark text-white">
                        <div className="card-body">
                            <h5 className="card-title">Sålda datorer per månad</h5>
                            {/* Ditt diagram här */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
