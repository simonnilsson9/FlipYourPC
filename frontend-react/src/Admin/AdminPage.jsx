import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAllUsers } from '../services/API';

const AdminPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            const decoded = jwtDecode(token);
            console.log("Decoded Token:", decoded);

            const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            if (role !== "Admin") {
                navigate('/');
            } else {
                loadUsers(token);
            }
        } else {
            navigate('/');
        }
    }, [navigate]);

    const loadUsers = async (token) => {
        try {
            const allUsers = await getAllUsers(token);
            setUsers(allUsers);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Kunde inte hämta användare.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-center mt-8 text-gray-500">Laddar användare...</p>;
    if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

    return (
        <div className="max-w-6xl mx-auto p-4 mt-8">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Adminpanel</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Endast för administratörer</p>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Alla användare</h2>
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">
                            <th className="py-2">Användarnamn</th>
                            <th>Email</th>
                            <th>Roll</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="text-gray-800 dark:text-gray-200">
                                <td className="py-2">{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminPage;