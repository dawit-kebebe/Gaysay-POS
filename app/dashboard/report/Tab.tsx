"use client";

import { TabItem, Tabs } from "flowbite-react";
import { HiChartPie } from "react-icons/hi2";
import { TbReport } from "react-icons/tb";
import ReportTable from "./ReportTable";

export function Tab() {
    return (
        <div className="overflow-x-auto w-full">
            <Tabs aria-label="Full width tabs for report and analysis" variant="fullWidth" className="w-full">
                <TabItem active title="Report" icon={TbReport} className="w-full">
                    <ReportTable />
                </TabItem>
                <TabItem title="Analysis" icon={HiChartPie}>
                    Analysis not yet implemented.
                </TabItem>

            </Tabs>
        </div>
    );
}
