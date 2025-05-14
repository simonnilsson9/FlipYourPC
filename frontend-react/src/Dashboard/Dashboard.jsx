import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { fetchDashboardStats } from '../Services/DashboardService';
import { CurrencyDollarIcon, CpuChipIcon, ShoppingCartIcon, ComputerDesktopIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/24/solid';
import { format, parse, subMonths, subWeeks, subYears, isAfter, isSameMonth, isSameDay } from 'date-fns';
import sv from 'date-fns/locale/sv';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const loadStats = async () => {
            const data = await fetchDashboardStats();
            setStats(data);
        };
        loadStats();
    }, []);

    if (!stats) return <p className="text-center text-gray-500 mt-10">Laddar statistik...</p>;

    const { salesByMonth, soldComputersByMonth, profitByMonth, allSoldPCs } = stats;

    const now = new Date();
    let fromDate;
    if (filter === '1w') fromDate = subWeeks(now, 1);
    else if (filter === '1m') fromDate = subMonths(now, 1);
    else if (filter === '6m') fromDate = subMonths(now, 6);
    else if (filter === '1y') fromDate = subYears(now, 1);
    else fromDate = new Date(0);

    const filteredPCs = allSoldPCs.filter(pc => pc.soldAt && isAfter(new Date(pc.soldAt), fromDate));
    const dateLabelsMap = {};

    filteredPCs.forEach(pc => {
        const key = (filter === '1w' || filter === '1m')
            ? format(new Date(pc.soldAt), 'yyyy-MM-dd')
            : format(new Date(pc.soldAt), 'yyyy-MM');

        if (!dateLabelsMap[key]) {
            dateLabelsMap[key] = { sales: 0, profit: 0, soldComputers: 0 };
        }

        dateLabelsMap[key].sales += pc.price || 0;
        dateLabelsMap[key].profit += (pc.price || 0) - (pc.componentsTotalCost || 0);
        dateLabelsMap[key].soldComputers += 1;
    });

    const sortedKeys = Object.keys(dateLabelsMap).sort();
    const formattedLabels = sortedKeys.map(key =>
        (filter === '1w' || filter === '1m')
            ? format(parse(key, 'yyyy-MM-dd', new Date()), 'd MMM', { locale: sv })
            : format(parse(key, 'yyyy-MM', new Date()), 'MMMM yyyy', { locale: sv })
    );

    const salesData = {
        labels: formattedLabels,
        datasets: [
            {
                label: 'Försäljning (kr)',
                data: sortedKeys.map(key => dateLabelsMap[key].sales),
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.4,
                categoryPercentage: 0.5,
            },
            {
                label: 'Vinst (kr)',
                data: sortedKeys.map(key => dateLabelsMap[key].profit),
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
                data: sortedKeys.map(key => dateLabelsMap[key].soldComputers),
                fill: false,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                tension: 0.4,
            },
        ],
    };

    const aggregatedStats = Object.values(dateLabelsMap).reduce(
        (acc, val) => {
            acc.sales += val.sales;
            acc.profit += val.profit;
            acc.soldComputers += val.soldComputers;
            return acc;
        },
        { sales: 0, profit: 0, soldComputers: 0 }
    );

    const filteredAvgSalesCycle = (() => {
        if (filter === 'all') return stats.avgSalesCycle;
        if (filteredPCs.length === 0) return 0;
        const totalCycle = filteredPCs.reduce((acc, pc) => {
            const listed = new Date(pc.listedAt);
            const sold = new Date(pc.soldAt);
            return acc + (sold - listed) / (1000 * 60 * 60 * 24);
        }, 0);
        return Math.round(totalCycle / filteredPCs.length);
    })();

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Dashboard</h1>

            <div className="flex gap-2 justify-center mb-8 flex-wrap">
                {['1w', '1m', '6m', '1y', 'all'].map(val => (
                    <FilterButton key={val} label={labelForFilter(val)} value={val} selected={filter} setFilter={setFilter} />
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Lagervärde" value={`${stats.inventoryValue.toLocaleString()} kr`} icon={<CurrencyDollarIcon className="w-8 h-8 text-green-500" />} />
                <StatCard title="Antal komponenter" value={stats.componentCount} icon={<CpuChipIcon className="w-8 h-8 text-blue-500" />} />
                <StatCard title="Försäljning" value={`${aggregatedStats.sales.toLocaleString()} kr`} icon={<BanknotesIcon className="w-8 h-8 text-yellow-500" />} />
                <StatCard title="Sålda datorer" value={aggregatedStats.soldComputers} icon={<ComputerDesktopIcon className="w-8 h-8 text-purple-500" />} />
                <StatCard title="Vinst" value={`${aggregatedStats.profit.toLocaleString()} kr`} icon={<ShoppingCartIcon className="w-8 h-8 text-emerald-500" />} />
                <StatCard title="Genomsnittlig säljcykel" value={`${filteredAvgSalesCycle} dagar`} icon={<ClockIcon className="w-8 h-8 text-indigo-500" />} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Försäljning & vinst</h3>
                    <Bar data={salesData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Sålda datorer</h3>
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

const FilterButton = ({ label, value, selected, setFilter }) => (
    <button
        onClick={() => setFilter(value)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition 
            ${selected === value ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} 
            hover:bg-blue-500 dark:hover:bg-blue-600`}
    >
        {label}
    </button>
);

const labelForFilter = (filter) => {
    switch (filter) {
        case '1w': return 'Senaste veckan';
        case '1m': return 'Senaste månaden';
        case '6m': return '6 månader';
        case '1y': return 'Senaste året';
        default: return 'Totalt';
    }
};

export default Dashboard;