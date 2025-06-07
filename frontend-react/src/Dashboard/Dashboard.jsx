import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { fetchDashboardStats } from '../Services/DashboardService';
import {
    CpuChipIcon,
    ChartBarIcon,
    ComputerDesktopIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/solid';
import { format, parse, subMonths, subWeeks, subYears, isAfter, startOfMonth } from 'date-fns';
import sv from 'date-fns/locale/sv';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [filter, setFilter] = useState('all');
    const [customRange, setCustomRange] = useState({
        from: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        const loadStats = async () => {
            const data = await fetchDashboardStats();
            setStats(data);
        };
        loadStats();
    }, []);

    const handleFilterChange = (value) => {
        setFilter(value);
        const now = new Date();

        let from;
        if (value === '1w') from = subWeeks(now, 1);
        else if (value === '1m') from = subMonths(now, 1);
        else if (value === '6m') from = subMonths(now, 6);
        else if (value === '1y') from = subYears(now, 1);
        else {
            // Ta första dagen i månaden för det tidigaste soldAt-datumet
            const allDates = stats.allSoldPCs.map(pc => new Date(pc.soldAt));
            const earliestDate = new Date(Math.min(...allDates));
            from = startOfMonth(earliestDate);
        }

        setCustomRange({
            from: format(from, 'yyyy-MM-dd'),
            to: format(now, 'yyyy-MM-dd')
        });
    };

    if (!stats) return <p className="text-center text-gray-500 mt-10">Laddar statistik...</p>;

    const { allSoldPCs } = stats;
    const fromDate = new Date(customRange.from);
    const toDate = new Date(customRange.to);

    const filteredPCs = allSoldPCs.filter(pc => {
        const soldAt = new Date(pc.soldAt);
        return isAfter(soldAt, fromDate) && soldAt <= toDate;
    });

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
        if (filteredPCs.length === 0) return 0;
        const totalCycle = filteredPCs.reduce((acc, pc) => {
            const listed = new Date(pc.listedAt);
            const sold = new Date(pc.soldAt);
            return acc + (sold - listed) / (1000 * 60 * 60 * 24);
        }, 0);
        return Math.round(totalCycle / filteredPCs.length);
    })();

    const filteredAvgProfit = (() => {
        if (filteredPCs.length === 0) return 0;
        const totalProfit = filteredPCs.reduce((acc, pc) => acc + ((pc.price || 0) - (pc.componentsTotalCost || 0)), 0);
        return totalProfit / filteredPCs.length;
    })();

    const filteredAvgProfitPercent = (() => {
        const valid = filteredPCs.filter(pc => pc.componentsTotalCost > 0);
        if (valid.length === 0) return 0;
        const totalPercent = valid.reduce((acc, pc) =>
            acc + (((pc.price || 0) - pc.componentsTotalCost) / pc.componentsTotalCost) * 100, 0);
        return totalPercent / valid.length;
    })();

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">Dashboard</h1>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
                {/* Datumintervall */}
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                        Välj datumintervall
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={customRange.from}
                            onChange={(e) => setCustomRange({ ...customRange, from: e.target.value })}
                            className="px-3 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-none focus:outline-none focus:ring-0 shadow-md hover:shadow-lg transition"
                        />
                        <span className="text-gray-500 dark:text-gray-400">→</span>
                        <input
                            type="date"
                            value={customRange.to}
                            onChange={(e) => setCustomRange({ ...customRange, to: e.target.value })}
                            className="px-3 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-none focus:outline-none focus:ring-0 shadow-md hover:shadow-lg transition"
                        />
                    </div>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                        Snabbfilter
                    </label>
                    <select
                        value={filter}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-none focus:outline-none focus:ring-0 shadow-md hover:shadow-lg transition"
                    >
                        <option value="1w">Senaste veckan</option>
                        <option value="1m">Senaste månaden</option>
                        <option value="6m">6 månader</option>
                        <option value="1y">Senaste året</option>
                        <option value="all">Totalt</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Lagerstatus */}
                <StatGroupCard
                    title="Lagerstatus"
                    tooltipText="Information om komponenter och datorer som ännu inte sålts."
                    icon={<CpuChipIcon className="w-8 h-8 text-blue-600" />}
                    items={[
                        {
                            title: "Lagervärde",
                            value: `${stats.inventoryValue.toLocaleString()} kr`,
                            tooltip: "Summan av komponenter i lagret, planerade datorer och ej sålda datorer."
                        },
                        {
                            title: "Antal komponenter",
                            value: stats.componentCount,
                            tooltip: "Totalt antal komponenter i lagret som inte är kopplade till någon dator."
                        },
                        {
                            title: "Datorer till salu",
                            value: stats.forSaleCount,
                            tooltip: "Antal datorer som är markerade som 'Till salu'."
                        },
                        {
                            title: "Värde till salu",
                            value: `${stats.forSaleTotalValue.toLocaleString()} kr`,
                            tooltip: "Totalt komponentvärde i datorer som ännu inte sålts."
                        }
                    ]}
                />

                {/* Försäljning & Vinst */}
                <StatGroupCard
                    title="Försäljning & Vinst"
                    tooltipText="Summerad försäljning och vinst från sålda datorer."
                    icon={<ChartBarIcon className="w-8 h-8 text-blue-600" />}
                    items={[
                        {
                            title: "Försäljning",
                            value: `${aggregatedStats.sales.toLocaleString()} kr`,
                            tooltip: "Totalt försäljningsbelopp från sålda datorer under vald period."
                        },
                        {
                            title: "Vinst",
                            value: `${aggregatedStats.profit.toLocaleString()} kr`,
                            tooltip: "Total vinst efter att komponentkostnader dragits från försäljningen."
                        },
                        {
                            title: "Genomsnittlig vinst",
                            value: `${Math.round(filteredAvgProfit)} kr`,
                            tooltip: "Medelvinst per såld dator inom vald period."
                        },
                        {
                            title: "Vinstmarginal",
                            value: `${Math.round(filteredAvgProfitPercent)} %`,
                            tooltip: "Genomsnittlig vinst i procent av försäljningspriset per såld dator."
                        }
                    ]}
                />

                {/* Säljstatus */}
                <StatGroupCard
                    title="Säljstatus"
                    tooltipText="Antal sålda datorer och hur snabbt de säljs."
                    icon={<ComputerDesktopIcon className="w-8 h-8 text-blue-600" />}
                    items={[
                        {
                            title: "Sålda datorer",
                            value: aggregatedStats.soldComputers,
                            tooltip: "Totalt antal datorer som sålts under vald period."
                        },
                        {
                            title: "Genomsnittlig säljcykel",
                            value: `${filteredAvgSalesCycle} dagar`,
                            tooltip: "Medelantal dagar från listning till försäljning av en dator."
                        }
                    ]}
                />
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

const StatCard = ({ title, value, icon, tooltipText }) => (
    <div className="relative p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition">
        {/* Info-ikon i övre högra hörnet */}
        {tooltipText && (
            <div className="absolute top-2 right-2">
                <InformationCircleIcon
                    title={tooltipText}
                    className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-help"
                />
            </div>
        )}

        {/* Ikon + text */}
        <div className="flex items-center">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </div>
);

const StatGroupCard = ({ icon, title, tooltipText, items }) => (
    <div className="relative p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition">
        {/* Info-ikon */}
        {tooltipText && (
            <div className="absolute top-2 right-2">
                <InformationCircleIcon
                    title={tooltipText}
                    className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-help"
                />
            </div>
        )}

        {/* Titel + ikon */}
        <div className="flex items-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full mr-4">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>

        {/* Innehållsrader */}
        <div>
            {items.map(({ title, value, tooltip }) => (
                <InfoItem key={title} title={title} value={value} tooltip={tooltip} />
            ))}
        </div>
    </div>
);

const InfoItem = ({ title, value, tooltip }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
        <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600 dark:text-gray-300">{title}</span>
            {tooltip && (
                <InformationCircleIcon
                    className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-pointer"
                    title={tooltip}
                />
            )}
        </div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
);

export default Dashboard;