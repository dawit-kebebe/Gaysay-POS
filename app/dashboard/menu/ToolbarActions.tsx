"use client";

import { RootState, useAppDispatch, useAppSelector } from '@/app/store';
import { toggleOpenCreateModal, toggleOpenDeleteModal } from '@/app/store/slice/menu.slice'; // Menu slice actions
import { addToast } from '@/app/store/slice/toast.slice'; // Assuming path to toast slice
import { Breadcrumb, BreadcrumbItem, Button } from 'flowbite-react';
import { FaRegTrashCan } from 'react-icons/fa6';
import { GrAdd } from 'react-icons/gr';
import { MdDashboard } from 'react-icons/md';

const ToolbarActions = () => {
    const dispatch = useAppDispatch();

    // Select the currently selected menu items
    const selectedMenu = useAppSelector((state: RootState) => state.menu.selectedMenu);

    const handleDeleteClick = () => {
        if (selectedMenu.length <= 0) {
            dispatch(addToast('Please select at least one menu item to delete.', 'warning'));
            return;
        }
        // Open the Delete Modal (which will handle the mutation)
        dispatch(toggleOpenDeleteModal());
    };

    const handleCreateClick = () => {
        // Open the Create Modal
        dispatch(toggleOpenCreateModal());
    }

    return (
        <div className="flex w-full flex-col px-4 text-gray-900 dark:text-white">
            <Breadcrumb className='w-full p-4'>
                {/* Replaced generic icons/text with Menu specific ones */}
                <BreadcrumbItem icon={MdDashboard}>Dashboard</BreadcrumbItem>
                <BreadcrumbItem>Menu</BreadcrumbItem>
            </Breadcrumb>
            <div className='w-full flex flex-wrap justify-center sm:justify-end gap-2 p-4 '>
                <Button className='w-fit' onClick={handleCreateClick}>
                    <GrAdd className="sm:me-3" />
                    <span className='hidden sm:inline'>
                        Add Menu Item
                    </span>
                </Button>
                <Button
                    color="red"
                    onClick={handleDeleteClick}
                    disabled={selectedMenu.length === 0}
                >
                    <FaRegTrashCan className="sm:me-3" />
                    <span className='hidden sm:inline'>
                        Delete {selectedMenu.length > 0 && `(${selectedMenu.length})`}
                    </span>
                </Button>
            </div>
        </div>
    );
};

export default ToolbarActions;