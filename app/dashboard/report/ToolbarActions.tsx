"use client";

import { ReportFilters, ReportFiltersType } from '@/app/common/types/report';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useGetReportQuery } from '@/app/store/api/report.api';
import { setLastMonth, setLastWeek, setLastYear, setReportFilter, setReportType, setToday } from '@/app/store/slice/report.slice';
import { Breadcrumb, BreadcrumbItem, Dropdown, DropdownItem } from 'flowbite-react';
import { useEffect } from 'react';
import { MdDashboard } from 'react-icons/md';

const ToolbarActions = () => {
    const dispatch = useAppDispatch();
    const filter = useAppSelector((state) => state.report.reportFilter);
    const reportType = useAppSelector((state) => state.report.reportType);

    const { data: reportData, isLoading: isReportLoading } = useGetReportQuery({ filter });

    useEffect(() => {
        if (reportData) {
            switch (filter) {
                default:
                case ReportFilters.TODAY:
                    dispatch(setToday(reportData));
                    break;
                case ReportFilters.LAST_WEEK:
                    dispatch(setLastWeek(reportData));
                    break;
                case ReportFilters.LAST_MONTH:
                    dispatch(setLastMonth(reportData));
                    break;
                case ReportFilters.LAST_YEAR:
                    dispatch(setLastYear(reportData));
            }

        }
    }, [reportData, filter, dispatch]);

    return (
        <div className="flex w-full flex-col px-4 text-gray-900 dark:text-white">
            <Breadcrumb className='w-full p-4'>
                <BreadcrumbItem icon={MdDashboard}>Dashboard</BreadcrumbItem>
                <BreadcrumbItem>Report</BreadcrumbItem>
            </Breadcrumb>
            <div className='w-full flex flex-wrap justify-center sm:justify-end gap-2 p-4 '>
                {/* Data Type Selection */}
                <Dropdown label={`${reportType}`} disabled={isReportLoading}>
                    <DropdownItem onClick={() => dispatch(setReportType('Income'))}>
                        Income
                    </DropdownItem>
                    <DropdownItem onClick={() => dispatch(setReportType('Expense'))}>
                        Expense
                    </DropdownItem>
                    {/* <DropdownItem onClick={() => dispatch(setReportType('Analysis'))}>
                        Analysis
                    </DropdownItem> */}
                </Dropdown>
                {/* Filter Selection */}
                <Dropdown label={`${filter}`} disabled={isReportLoading}>
                    {
                        Object.values(ReportFilters).map((filterOption) => (
                            <DropdownItem key={filterOption} onClick={() => dispatch(setReportFilter(filterOption as ReportFiltersType))}>
                                {filterOption}
                            </DropdownItem>
                        ))
                    }
                </Dropdown>
            </div>
        </div>
    );
};

export default ToolbarActions;
