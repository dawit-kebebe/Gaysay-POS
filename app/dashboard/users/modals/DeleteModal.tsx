"use client";

import { useAppDispatch, useAppSelector } from '@/app/store';
import { useDeleteUserMutation } from '@/app/store/api/user.api'; // Adjusted hook
import { toggleOpenDeleteModal, clearselectedUser } from '@/app/store/slice/user.slice'; // Adjusted imports
import { addToast } from '@/app/store/slice/toast.slice';
import { Button, Modal, ModalBody, ModalHeader, Spinner } from 'flowbite-react';
import { useCallback } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import React from 'react';
import { User } from '@/app/common/types/user';

const DeleteModal = () => {
    const dispatch = useAppDispatch();

    const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation(); // Adjusted hook

    const selectedUser: User[] = useAppSelector((state) => state.user.selectedUser); // Adjusted slice name
    const openDeleteModal = useAppSelector((state) => state.user.openDeleteModal); // Adjusted slice name

    const handleOnDelete = useCallback(async () => {
        if (selectedUser.length <= 0) {
            dispatch(addToast('No users selected.', 'warning'));
            return;
        }

        // Collect all delete promises
        const deletePromises = selectedUser
            .filter((item: User) => item.id)
            .map((item: User) =>
                deleteUser(item.id as string) // Delete mutation takes the ID
            );

        const results = await Promise.all(deletePromises);

        let hasError = false;
        let hasSuccess = false;

        results.forEach(res => {
            if ('error' in res && res.error) {
                hasError = true;
            } else if ('data' in res || !('error' in res)) {
                hasSuccess = true;
            }
        });

        if (hasError) {
            dispatch(addToast('One or more users failed to delete.', 'failure'));
        }

        if (hasSuccess) {
            dispatch(addToast(`${selectedUser.length} user(s) deleted successfully.`, 'success'));
        }

        dispatch(clearselectedUser());
        dispatch(toggleOpenDeleteModal());
    }, [dispatch, selectedUser, deleteUser]);

    return (
        <Modal show={openDeleteModal} size="md" onClose={() => dispatch(toggleOpenDeleteModal())} popup>
            <ModalHeader />
            <ModalBody>
                <div className="text-center">
                    <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        {selectedUser.length === 1
                            ? `Are you sure you want to delete user "${selectedUser[0]?.name}"?`
                            : `Are you sure you want to delete ${selectedUser.length} selected users?`
                        }
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button color="red" onClick={handleOnDelete} disabled={isDeleting}>
                            {isDeleting ? <Spinner size='sm' /> : 'Yes, I\'m sure'}
                        </Button>
                        <Button color="alternative" onClick={() => dispatch(toggleOpenDeleteModal())} disabled={isDeleting}>
                            No, cancel
                        </Button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default DeleteModal;