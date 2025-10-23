// DeleteModal.tsx
"use client";

import { useAppDispatch, useAppSelector } from '@/app/store';
import { useDeleteMenuMutation } from '@/app/store/api/menu.api';
import { toggleOpenDeleteModal, clearselectedMenu } from '@/app/store/slice/menu.slice';
import { addToast } from '@/app/store/slice/toast.slice';
import { Button, Modal, ModalBody, ModalHeader, Spinner } from 'flowbite-react';
import { useCallback } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import React from 'react';

const DeleteModal = () => {
    const dispatch = useAppDispatch();

    const [deleteMenu, { isLoading: isDeleting }] = useDeleteMenuMutation();

    const selectedMenu = useAppSelector((state) => state.menu.selectedMenu);
    const openDeleteModal = useAppSelector((state) => state.menu.openDeleteModal);

    const handleOnDelete = useCallback(async () => {
        if (selectedMenu.length <= 0) {
            dispatch(addToast('No menu items selected.', 'warning'));
            return;
        }

        // Collect all delete promises, ensure item has a valid 'id'
        const deletePromises = selectedMenu
            .filter((item) => item.id)
            .map((item) =>
                deleteMenu(item.id as string)
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
            dispatch(addToast('One or more menu items failed to delete.', 'failure'));
        }

        if (hasSuccess) {
            dispatch(addToast(`${selectedMenu.length} menu item(s) deleted successfully.`, 'success'));
        }

        dispatch(clearselectedMenu());
        dispatch(toggleOpenDeleteModal());
    }, [dispatch, selectedMenu, deleteMenu]);

    return (
        <Modal show={openDeleteModal} size="md" onClose={() => dispatch(toggleOpenDeleteModal())} popup>
            <ModalHeader />
            <ModalBody>
                <div className="text-center">
                    <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        {selectedMenu.length === 1
                            ? `Are you sure you want to delete "${selectedMenu[0]?.name}"?`
                            : `Are you sure you want to delete ${selectedMenu.length} selected menu items?`
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