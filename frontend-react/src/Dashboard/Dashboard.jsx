import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { fetchDashboardStats } from '../Services/DashboardService';
import { CurrencyDollarIcon, CpuChipIcon, ShoppingCartIcon, ComputerDesktopIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/24/solid';
import { format, parse } from 'date-fns';
import sv from 'date-fns/locale/sv';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const loadStats = async () => {
            const data = await fetchDashboardStats();
            setStats(data);
        };
        loadStats();
    }, []);

    if (!stats) {
        return <p className="text-center text-gray-500 mt-10">Laddar statistik...</p>;
    }

    const { salesByMonth, soldComputersByMonth, profitByMonth } = stats;

    const sortedMonths = Object.keys(salesByMonth).sort((a, b) => new Date(a) - new Date(b));
    const formattedLabels = sortedMonths.map(month => format(parse(month, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: sv }));

    const salesData = {
        labels: formattedLabels,
        datasets: [
            {
                label: 'Försäljning (kr)',
                data: sortedMonths.map(month => salesByMonth[month] ?? 0),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.4,
                categoryPercentage: 0.5,
            },
            {
                label: 'Vinst (kr)',
                data: sortedMonths.map(month => profitByMonth[month] ?? 0),
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.4,
                categoryPercentage: 0.5,
            },
        ],
    };

    const soldComputersData = {
        labels: formattedLabels,
        datasets: [
            {
                label: 'Sålda datorer',
                data: sortedMonths.map(month => soldComputersByMonth[month] ?? 0),
                fill: false,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                tension: 0.4,
            },
        ],
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 mt-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Lagervärde" value={`${stats.inventoryValue.toLocaleString()} kr`} icon={<CurrencyDollarIcon className="w-8 h-8 text-green-500" />} />
                <StatCard title="Antal komponenter" value={stats.componentCount} icon={<CpuChipIcon className="w-8 h-8 text-blue-500" />} />
                <StatCard title="Total försäljning" value={`${stats.totalSales.toLocaleString()} kr`} icon={<BanknotesIcon className="w-8 h-8 text-yellow-500" />} />
                <StatCard title="Sålda datorer" value={stats.soldComputers} icon={<ComputerDesktopIcon className="w-8 h-8 text-purple-500" />} />
                <StatCard title="Total vinst" value={`${stats.totalProfit.toLocaleString()} kr`} icon={<ShoppingCartIcon className="w-8 h-8 text-emerald-500" />} />
                <StatCard title="Genomsnittlig säljcykel" value={`${stats.avgSalesCycle} dagar`} icon={<ClockIcon className="w-8 h-8 text-indigo-500" />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Försäljning & vinst per månad</h3>
                    <Bar data={salesData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Sålda datorer per månad</h3>
                    <Line data={soldComputersData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition">
        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export default Dashboard;