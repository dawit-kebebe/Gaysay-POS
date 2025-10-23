"use client";

import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from "chart.js";
import { Spinner } from "flowbite-react";
import randomColor from 'randomcolor';
import { useMemo } from 'react';
import { Doughnut } from "react-chartjs-2";
import { FaBoxOpen } from "react-icons/fa6";
import { useGetOpenPurchasesQuery } from "../store/api/expense.api";
import { useGetOpenSellsQuery } from '../store/api/open-sells.api';

// Register all necessary components for both Doughnut and Line charts at module scope
ChartJS.register(
    ArcElement,       // Needed for Doughnut
    Tooltip,
    Legend,
    // Line chart components:
    CategoryScale,    // Registers the X-axis scale
    LinearScale,      // Registers the Y-axis scale
    PointElement,
    LineElement,
    Title             // Optional, for chart title
);

const PieChart = () => {
    const { data: openPurchases = [], isLoading: isPurchaseLoading } = useGetOpenPurchasesQuery();
    const { data: openSells = [], isLoading: isSellsLoading } = useGetOpenSellsQuery();

    const pieChartData = useMemo(() => {
        if (!openPurchases || openPurchases.length <= 0) return null;
        if (!openSells || openSells.length <= 0) return null;

        const totalPurchase = openPurchases.reduce(
            (sum, p) => sum + (p.quantity ?? 0) * (p.unitPrice ?? 0),
            0
        );

        const totalSells = openSells.reduce(
            (sum, s) => {
                const itemPrice = s.itemId && s.itemId.price ? s.itemId.price : 0;
                const itemFreq = s.totalFreq ? s.totalFreq : 0;
                return sum + itemPrice * itemFreq;
            },
            0
        );

        return {
            labels: ['Expenses', 'Income'],
            datasets: [
                {
                    label: 'Amount',
                    data: [totalPurchase, totalSells],
                    backgroundColor: [
                        randomColor({ luminosity: 'dark', hue: 'red' }),
                        randomColor({ luminosity: 'dark', hue: 'green' }),
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [openPurchases, openSells]);

    if (!pieChartData) {
        return (
            <div className='flex flex-col justify-center items-center p-8'>
                <span className='text-6xl text-gray-400'><FaBoxOpen /> </span>
                <span className='text-xl mt-2'>No expense/income found</span>
            </div>
        );
    }

    return (
        <div className='w-full flex justify-center items-center'>
            {/* You should use data specifically structured for a Line chart */}
            {
                isPurchaseLoading || isSellsLoading && <div className='flex justify-center'><Spinner size="lg" className='mx-auto my-8' /></div>
            }
            {pieChartData && <Doughnut data={pieChartData} />}
        </div>
    )
}

export default PieChart