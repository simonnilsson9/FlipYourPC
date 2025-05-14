import { fetchInventory, getAllPCs } from "./API";
import { format, subMonths, isAfter } from 'date-fns';

export const fetchDashboardStats = async () => {
    const tokenValue = localStorage.getItem("accessToken");

    const [inventoryData, pcsData] = await Promise.all([
        fetchInventory(),
        getAllPCs(tokenValue),
    ]);

    // Alla sålda PCs (för total statistik)
    const soldPCsAll = pcsData.filter(pc => pc.isSold);

    // Endast senaste 6 månader (för grafer)
    const cutoffDate = subMonths(new Date(), 5);
    const soldPCsLast6Months = soldPCsAll.filter(pc => pc.soldAt && isAfter(new Date(pc.soldAt), cutoffDate));

    const salesByMonth = {};
    const profitByMonth = {};
    const soldComputersByMonth = {};

    soldPCsLast6Months.forEach(pc => {
        const soldDate = new Date(pc.soldAt);
        const monthKey = format(soldDate, 'yyyy-MM');

        salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + (pc.price || 0);
        profitByMonth[monthKey] = (profitByMonth[monthKey] || 0) + ((pc.price || 0) - (pc.componentsTotalCost || 0));
        soldComputersByMonth[monthKey] = (soldComputersByMonth[monthKey] || 0) + 1;
    });

    const totalSales = soldPCsAll.reduce((acc, pc) => acc + (pc.price || 0), 0);
    const totalCost = soldPCsAll.reduce((acc, pc) => acc + (pc.componentsTotalCost || 0), 0);
    const totalProfit = totalSales - totalCost;

    const avgSalesCycleDays = soldPCsAll.length > 0
        ? Math.round(soldPCsAll.reduce((acc, pc) => {
            const listed = new Date(pc.listedAt);
            const sold = new Date(pc.soldAt);
            const diffDays = (sold - listed) / (1000 * 60 * 60 * 24);
            return acc + diffDays;
        }, 0) / soldPCsAll.length)
        : 0;

    return {
        // Obegränsad statistik
        inventoryValue: inventoryData.components.reduce((acc, c) => acc + c.price, 0),
        componentCount: inventoryData.components.length,
        totalSales,
        soldComputers: soldPCsAll.length,
        totalProfit,
        avgSalesCycle: avgSalesCycleDays,

        // Grafer (endast senaste 6 månader)
        salesByMonth,
        profitByMonth,
        soldComputersByMonth,
    };
};
