"use client";

import { useAppDispatch, useAppSelector } from '@/app/store';
import { useDeletePurchaseMutation } from '@/app/store/api/expense.api';
import { toggleOpenDeleteModal, clearSelectedPurchases } from '@/app/store/slice/expense.slice';
import { addToast } from '@/app/store/slice/toast.slice';
import { Button, Modal, ModalBody, ModalHeader, Spinner } from 'flowbite-react';
import { useCallback } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import React from 'react';

const DeleteModal = () => {
    const dispatch = useAppDispatch();

    const [deletePurchase, { isLoading: isDeleting }] = useDeletePurchaseMutation();

    const selectedPurchases = useAppSelector((state) => state.expense.selectedPurchases);
    const openDeleteModal = useAppSelector((state) => state.expense.openDeleteModal);

    const handleOnDelete = useCallback(async () => {
        if (selectedPurchases.length <= 0) {
            dispatch(addToast('No purchases selected.', 'warning'));
            return;
        }

        const deletePromises = selectedPurchases.filter((p) => p.id).map((p) => deletePurchase({ id: p.id }));

        const results = await Promise.all(deletePromises);

        let hasError = false;
        let successCount = 0;

        results.forEach(res => {
            if ('error' in res && res.error) {
                hasError = true;
            } else if ('data' in res || !('error' in res)) {
                successCount++;
            }
        });

        if (hasError) dispatch(addToast('One or more purchases failed to delete.', 'failure'));
        if (successCount > 0) dispatch(addToast(`${successCount} purchase(s) deleted successfully.`, 'success'));

        dispatch(clearSelectedPurchases());
        dispatch(toggleOpenDeleteModal());
    }, [dispatch, selectedPurchases, deletePurchase]);

    return (
        <Modal show={openDeleteModal} size="md" onClose={() => dispatch(toggleOpenDeleteModal())} popup>
            <ModalHeader />
            <ModalBody>
                <div className="text-center">
                    <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        {selectedPurchases.length === 1
                            ? `Are you sure you want to delete "${selectedPurchases[0]?.name}"?`
                            : `Are you sure you want to delete ${selectedPurchases.length} selected purchase(s)?`
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