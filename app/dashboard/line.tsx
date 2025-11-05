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
import randomColor from 'randomcolor';
import { useMemo } from 'react';
import { Line } from "react-chartjs-2";
import { FaBoxOpen } from "react-icons/fa6";
import { formatEthTime } from "../common/util/date-conv";
import { useGetOpenSellsQuery } from '../store/api/open-sells.api';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title
);

const getHourlyLabel = (hour24: number) => {
    return `${hour24.toString().padStart(2, '0')}:00`;
};

const LineChart = () => {
    const { data: report } = useGetOpenSellsQuery();

    const HOURLY_LABELS = useMemo(() => {
        return Array.from({ length: 24 }, (_, i) => getHourlyLabel(i));
    }, []);

    const lineChartData = useMemo(() => {
        if (!report || report.length <= 0) return null;

        const labels = HOURLY_LABELS;
        const maxLen = labels.length;

        const datasets = report.map(item => {
            const hourlyFrequencies = Array(maxLen).fill(0);

            item.unitsSold.forEach(u => {
                if (!u.timestamp || u.frequency == null) return;

                // Assuming formatEthTime(timestamp, 'HH') returns the 24-hour (00-23) in EAT
                const ethTimeString = formatEthTime(u.timestamp);
                const hourIndex = parseInt(ethTimeString, 10);

                if (!isNaN(hourIndex) && hourIndex >= 0 && hourIndex < maxLen) {
                    hourlyFrequencies[hourIndex] += u.frequency;
                }
            });

            const color = randomColor();
            return ({
                label: item.itemId.name,
                data: hourlyFrequencies,
                borderColor: color,
                //backgroundColor: color,
                tension: 0.5,
                fill: false,
            })
        });

        return { labels, datasets };
    }, [report, HOURLY_LABELS]);

    if (!report || report.length <= 0) {
        return (
            <div className='flex flex-col justify-center items-center p-8'>
                <span className='text-6xl text-gray-400'><FaBoxOpen /> </span>
                <span className='text-xl mt-2'>No open sells found</span>
            </div>
        );
    }

    return (
        <div className='w-full flex justify-center items-center'>
            {lineChartData && <Line data={lineChartData} />}
        </div>
    )
}

export default LineChart
