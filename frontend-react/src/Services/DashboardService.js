import { fetchInventory, getAllPCs } from "./API";
import { format } from 'date-fns';

export const fetchDashboardStats = async () => {
    const tokenValue = localStorage.getItem("accessToken");

    const [inventoryData, pcsData] = await Promise.all([
        fetchInventory(),
        getAllPCs(tokenValue),
    ]);

    // Alla sålda PCs
    const soldPCsAll = pcsData.filter(pc => pc.status === "Sold");
    const forSalePCs = pcsData.filter(pc => pc.status === "ForSale");

    const salesByMonth = {};
    const profitByMonth = {};
    const soldComputersByMonth = {};

    soldPCsAll.forEach(pc => {
        if (!pc.soldAt) return;
        const soldDate = new Date(pc.soldAt);
        const monthKey = format(soldDate, 'yyyy-MM');

        salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + (pc.price || 0);
        profitByMonth[monthKey] = (profitByMonth[monthKey] || 0) + ((pc.price || 0) - (pc.componentsTotalCost || 0));
        soldComputersByMonth[monthKey] = (soldComputersByMonth[monthKey] || 0) + 1;
    });

    const totalSales = soldPCsAll.reduce((acc, pc) => acc + (pc.price || 0), 0);
    const totalCost = soldPCsAll.reduce((acc, pc) => acc + (pc.componentsTotalCost || 0), 0);
    const totalProfit = totalSales - totalCost;

    const avgProfit = soldPCsAll.length > 0 ? totalProfit / soldPCsAll.length : 0;
    const avgProfitPercent = soldPCsAll.length > 0
        ? soldPCsAll.reduce((acc, pc) => acc + (((pc.price || 0) - (pc.componentsTotalCost || 0)) / (pc.componentsTotalCost || 1)) * 100, 0) / soldPCsAll.length
        : 0;

    const forSaleTotalValue = forSalePCs.reduce((acc, pc) => acc + (pc.componentsTotalCost || 0), 0);
    const forSaleCount = forSalePCs.length;

    const totalListPrice = soldPCsAll.reduce((acc, pc) => acc + (pc.listPrice || 0), 0);
    const listVsSalePercent = totalListPrice > 0 ? ((totalSales / totalListPrice) - 1) * 100 : 0;
    const listVsSaleDiff = totalSales - totalListPrice;

    const avgSalesCycleDays = soldPCsAll.length > 0
        ? Math.round(soldPCsAll.reduce((acc, pc) => {
            const listed = new Date(pc.listedAt);
            const sold = new Date(pc.soldAt);
            const diffDays = (sold - listed) / (1000 * 60 * 60 * 24);
            return acc + diffDays;
        }, 0) / soldPCsAll.length)
        : 0;

    const planningOrForSalePCs = pcsData.filter(pc =>
        pc.status === "Planning" || pc.status === "ForSale"
    );

    const pcComponentValue = planningOrForSalePCs.reduce((acc, pc) => {
        return acc + (pc.components?.reduce((sum, c) => sum + (c.price || 0), 0) || 0);
    }, 0);

    const inventoryValue = inventoryData.components.reduce((acc, c) => acc + c.price, 0) + pcComponentValue;

    return {
        inventoryValue,
        componentCount: inventoryData.components.length,
        totalSales,
        soldComputers: soldPCsAll.length,
        totalProfit,
        avgProfit,
        avgProfitPercent,
        forSaleTotalValue,
        forSaleCount,
        listVsSalePercent,
        listVsSaleDiff,
        avgSalesCycle: avgSalesCycleDays,

        salesByMonth,
        profitByMonth,
        soldComputersByMonth,

        allSoldPCs: soldPCsAll,
    };
};