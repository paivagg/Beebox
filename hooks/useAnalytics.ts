import { useMemo } from 'react';
import { Transaction, Player, Event } from '../../types';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, format, subDays } from 'date-fns';

export type DateRange = {
    start: Date;
    end: Date;
};

export type Period = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface SalesDataPoint {
    date: string;
    sales: number;
    transactions: number;
}

export interface ProductSales {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
}

export interface CategoryData {
    name: string;
    value: number;
    percentage: number;
}

export interface AnalyticsData {
    totalSales: number;
    totalTransactions: number;
    averageTicket: number;
    activeCredits: number;
    eventsCount: number;
    activePlayers: number;
    salesByDay: SalesDataPoint[];
    topProducts: ProductSales[];
    categoryDistribution: CategoryData[];
    changeVsPrevious: {
        sales: number;
        transactions: number;
        ticket: number;
    };
}

export const useAnalytics = (
    transactions: Transaction[],
    players: Player[],
    events: Event[],
    period: Period = 'month',
    customRange?: DateRange
): AnalyticsData => {
    return useMemo(() => {
        // Determine date range
        const now = new Date();
        let dateRange: DateRange;
        let previousRange: DateRange;

        switch (period) {
            case 'today':
                dateRange = { start: startOfDay(now), end: endOfDay(now) };
                previousRange = { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) };
                break;
            case 'week':
                dateRange = { start: startOfWeek(now), end: endOfWeek(now) };
                previousRange = { start: startOfWeek(subDays(now, 7)), end: endOfWeek(subDays(now, 7)) };
                break;
            case 'month':
                dateRange = { start: startOfMonth(now), end: endOfMonth(now) };
                previousRange = { start: startOfMonth(subDays(now, 30)), end: endOfMonth(subDays(now, 30)) };
                break;
            case 'year':
                dateRange = { start: startOfYear(now), end: endOfYear(now) };
                previousRange = { start: startOfYear(subDays(now, 365)), end: endOfYear(subDays(now, 365)) };
                break;
            case 'custom':
                dateRange = customRange || { start: startOfMonth(now), end: endOfMonth(now) };
                const daysDiff = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
                previousRange = {
                    start: subDays(dateRange.start, daysDiff),
                    end: subDays(dateRange.end, daysDiff)
                };
                break;
        }

        // Filter transactions by date range
        const currentTransactions = transactions.filter(t =>
            isWithinInterval(new Date(t.date), dateRange)
        );

        const previousTransactions = transactions.filter(t =>
            isWithinInterval(new Date(t.date), previousRange)
        );

        // Calculate total sales (only debits)
        const totalSales = currentTransactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);

        const previousSales = previousTransactions
            .filter(t => t.type === 'debit')
            .reduce((sum, t) => sum + t.amount, 0);

        // Total transactions
        const totalTransactions = currentTransactions.length;
        const previousTotalTransactions = previousTransactions.length;

        // Average ticket
        const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;
        const previousAverageTicket = previousTotalTransactions > 0 ? previousSales / previousTotalTransactions : 0;

        // Active credits (players with balance > 0)
        const activeCredits = players
            .filter(p => p.balance > 0)
            .reduce((sum, p) => sum + p.balance, 0);

        // Events count in period
        const eventsCount = events.filter(e =>
            isWithinInterval(new Date(e.date), dateRange)
        ).length;

        // Active players (with transactions in period)
        const activePlayerIds = new Set(currentTransactions.map(t => t.player_id));
        const activePlayers = activePlayerIds.size;

        // Sales by day
        const salesByDay: SalesDataPoint[] = [];
        const dayMap = new Map<string, { sales: number; count: number }>();

        currentTransactions
            .filter(t => t.type === 'debit')
            .forEach(t => {
                const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
                const existing = dayMap.get(dateKey) || { sales: 0, count: 0 };
                dayMap.set(dateKey, {
                    sales: existing.sales + t.amount,
                    count: existing.count + 1
                });
            });

        dayMap.forEach((value, date) => {
            salesByDay.push({
                date: format(new Date(date), 'dd/MM'),
                sales: value.sales,
                transactions: value.count
            });
        });

        salesByDay.sort((a, b) => a.date.localeCompare(b.date));

        // Top products (mock - would need product tracking in transactions)
        const topProducts: ProductSales[] = [];

        // Category distribution (based on transaction categories)
        const categoryMap = new Map<string, number>();
        currentTransactions
            .filter(t => t.type === 'debit')
            .forEach(t => {
                const category = t.category || 'other';
                categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount);
            });

        const totalCategorySales = Array.from(categoryMap.values()).reduce((sum, v) => sum + v, 0);
        const categoryDistribution: CategoryData[] = Array.from(categoryMap.entries()).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            percentage: totalCategorySales > 0 ? (value / totalCategorySales) * 100 : 0
        }));

        // Calculate changes vs previous period
        const calculateChange = (current: number, previous: number): number => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        return {
            totalSales,
            totalTransactions,
            averageTicket,
            activeCredits,
            eventsCount,
            activePlayers,
            salesByDay,
            topProducts,
            categoryDistribution,
            changeVsPrevious: {
                sales: calculateChange(totalSales, previousSales),
                transactions: calculateChange(totalTransactions, previousTotalTransactions),
                ticket: calculateChange(averageTicket, previousAverageTicket)
            }
        };
    }, [transactions, players, events, period, customRange]);
};
