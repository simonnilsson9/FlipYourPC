import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();

    // Kontrollera om användaren är inloggad genom att se om accessToken finns i localStorage
    const isLoggedIn = localStorage.getItem('accessToken');

    // Hantera logga ut
    const handleLogout = () => {
        localStorage.removeItem('accessToken');  // Ta bort accessToken från localStorage
        navigate("/login");  // Navigera användaren till login-sidan
    };

    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <Link to="/" className="navbar-brand">FlipYourPC</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <Link to="/" className="nav-link active">Dashboard</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/inventory" className="nav-link">Components</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/pc-builder" className="nav-link">PC Builder</Link>
                            </li>
                            <li className="nav-item">
                                {/* Om användaren är inloggad, visa Logga ut, annars visa Logga in */}
                                {isLoggedIn ? (
                                    <button className="btn btn-link nav-link" onClick={handleLogout}>Logga ut</button>
                                ) : (
                                    <Link to="/login" className="nav-link">Logga in</Link>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
