"use client";

import { RootState, useAppDispatch, useAppSelector } from '@/app/store';
// Assuming the necessary actions are available in expense.slice
import { toggleOpenCreateModal, toggleOpenDeleteModal, toggleOpenClosePurchaseModal } from '@/app/store/slice/expense.slice';
import { addToast } from '@/app/store/slice/toast.slice';
import { Breadcrumb, BreadcrumbItem, Button } from 'flowbite-react';
import { FaLock } from 'react-icons/fa';
import { FaRegTrashCan } from 'react-icons/fa6';
import { GrAdd } from 'react-icons/gr';
import { MdDashboard } from 'react-icons/md';

const ToolbarActions = () => {
    const dispatch = useAppDispatch();

    // Select the currently selected purchases
    const selectedPurchases = useAppSelector((state: RootState) => state.expense.selectedPurchases);
    const numSelected = selectedPurchases.length;

    const handleDeleteClick = () => {
        if (numSelected <= 0) {
            dispatch(addToast('Please select at least one purchase to delete.', 'warning'));
            return;
        }
        dispatch(toggleOpenDeleteModal());
    };

    /**
     * Handles the click event for the "Close" button.
     * Launches the ClosePurchaseModal confirmation prompt.
     */
    const handleCloseClick = () => {
        if (numSelected <= 0) {
            dispatch(addToast('Please select at least one purchase to close.', 'warning'));
            return;
        }
        // Use the new toggle action to open the simple confirmation modal
        dispatch(toggleOpenClosePurchaseModal());
    };

    const handleCreateClick = () => {
        // Open the Create Modal (Assuming this is for creating a new purchase)
        dispatch(toggleOpenCreateModal());
    }

    return (
        <div className="flex w-full flex-col px-4 text-gray-900 dark:text-white">
            <Breadcrumb className='w-full p-4'>
                <BreadcrumbItem icon={MdDashboard}>Dashboard</BreadcrumbItem>
                <BreadcrumbItem>Expenses</BreadcrumbItem>
            </Breadcrumb>
            <div className='w-full flex flex-wrap justify-center sm:justify-end gap-2 p-4 '>
                <Button className='w-fit' onClick={handleCreateClick}>
                    <GrAdd className="sm:me-3" />
                    <span className='hidden sm:inline'>
                        Add Purchase
                    </span>
                </Button>

                {/* Close Button: Calls handleCloseClick which launches the confirmation modal */}
                <Button
                    className='w-fit'
                    onClick={handleCloseClick}
                    disabled={numSelected === 0}
                    color='blue'
                >
                    <FaLock className="sm:me-3" />
                    <span className='hidden sm:inline'>
                        Close {numSelected > 0 && `(${numSelected})`}
                    </span>
                </Button>

                {/* Delete Button */}
                <Button
                    color="red"
                    onClick={handleDeleteClick}
                    disabled={numSelected === 0}
                >
                    <FaRegTrashCan className="sm:me-3" />
                    <span className='hidden sm:inline'>
                        Delete {numSelected > 0 && `(${numSelected})`}
                    </span>
                </Button>
            </div>
        </div>
    );
};

export default ToolbarActions;
