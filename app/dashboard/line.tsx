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
import { useGetOpenSellsQuery } from '../store/api/open-sells.api';
import { formatEthTime } from "../common/util/date-conv";
import { FaBoxOpen } from "react-icons/fa6";

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

const LineChart = () => {
    const { data: report } = useGetOpenSellsQuery();

    // Build the line chart data with a stable hook so hook order doesn't change between renders
    const lineChartData = useMemo(() => {
        if (!report || report.length <= 0) return null;

        // Use the actual timestamps from unitsSold as the shared label axis.
        const normalize = (t: string | null) => {
            if (t == null) return null;
            const d = new Date(t);
            return isNaN(d.getTime()) ? null : d.toISOString();
        };

        // Collect unique, normalized timestamps across all items
        const timestampSet = new Set<string>();
        report.forEach(item => {
            item.unitsSold.forEach(u => {
                const ts = normalize(u.timestamp);
                if (ts) timestampSet.add(ts);
            });
        });

        // Sort ISO timestamps (lexicographic sort works for ISO strings)
        const timestamps = Array.from(timestampSet).sort();

        const labelsSet = new Set<string>();
        timestamps.map(ts => formatEthTime(ts)).forEach(ts => {
            labelsSet.add(ts);
        });

        const labels = Array.from(labelsSet)

        const maxLen = labels.length;

        const datasets = report.map(item => {
            const color = randomColor();
            return ({
                label: item.itemId.name,
                data: Array.from({ length: maxLen }, (_, idx) => {
                    const entry = item.unitsSold[idx];
                    return entry ? entry.frequency : null;
                }),
                borderColor: color,
                backgroundColor: color,
                tension: 0.4,
            })
        });

        return { labels, datasets };
    }, [report]);

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

