// ToolbarActions.tsx
"use client";

import { RootState, useAppDispatch, useAppSelector } from '@/app/store'; // Assuming RootState is available
import { toggleOpenCreateModal, toggleOpenDeleteModal } from '@/app/store/slice/user.slice'; // Adjusted imports
import { addToast } from '@/app/store/slice/toast.slice';
import { Breadcrumb, BreadcrumbItem, Button } from 'flowbite-react';
import { FaRegTrashCan } from 'react-icons/fa6';
import { GrAdd } from 'react-icons/gr';
import { MdDashboard } from 'react-icons/md';

const ToolbarActions = () => {
    const dispatch = useAppDispatch();

    // Select the currently selected users
    const selectedUser = useAppSelector((state: RootState) => state.user.selectedUser); // Adjusted slice name

    const handleDeleteClick = () => {
        if (selectedUser.length <= 0) {
            dispatch(addToast('Please select at least one user to delete.', 'warning'));
            return;
        }
        // Open the Delete Modal
        dispatch(toggleOpenDeleteModal());
    };

    const handleCreateClick = () => {
        // Open the Create Modal
        dispatch(toggleOpenCreateModal());
    }

    return (
        <div className="flex w-full flex-col px-4 text-gray-900 dark:text-white">
            <Breadcrumb className='w-full p-4'>
                <BreadcrumbItem icon={MdDashboard}>Dashboard</BreadcrumbItem>
                <BreadcrumbItem>Users</BreadcrumbItem>
            </Breadcrumb>
            <div className='w-full flex justify-end gap-2 p-4 '>
                <Button className='w-fit' onClick={handleCreateClick}>
                    <GrAdd className="me-3" />
                    Add User
                </Button>
                <Button
                    color="red"
                    onClick={handleDeleteClick}
                    disabled={selectedUser.length === 0}
                >
                    <FaRegTrashCan className="me-3" />
                    Delete {selectedUser.length > 0 && `(${selectedUser.length})`}
                </Button>
            </div>
        </div>
    );
};

export default ToolbarActions;