"use client";

import { useAppDispatch, useAppSelector } from '@/app/store';
import { useClosePurchaseMutation } from '@/app/store/api/expense.api';
import { toggleOpenClosePurchaseModal, clearSelectedPurchases } from '@/app/store/slice/expense.slice';
import { addToast } from '@/app/store/slice/toast.slice';
import { Button, Modal, ModalBody, ModalHeader, Spinner } from 'flowbite-react';
import React, { useCallback } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const ClosePurchaseModal = () => {
    const dispatch = useAppDispatch();

    // Use the specific mutation for closing
    const [closePurchase, { isLoading: isClosing }] = useClosePurchaseMutation();

    // Select state for selected purchases and modal visibility
    const selectedPurchases = useAppSelector((state) => state.expense.selectedPurchases);
    // Assuming the slice exposes this state for the new modal
    const openClosePurchaseModal = useAppSelector((state) => state.expense.openClosePurchaseModal);

    const numSelected = selectedPurchases.length;

    const handleOnClose = useCallback(async () => {
        if (numSelected === 0) {
            dispatch(addToast('No purchases selected to close.', 'warning'));
            return;
        }

        // Create a list of promises for closing each selected item
        const closePromises = selectedPurchases
            .filter((p) => p.id)
            // Use .unwrap() to treat the mutation result as a standard promise for error handling
            .map((p) => closePurchase({ id: p.id }).unwrap());

        // Execute all close mutations concurrently
        const results = await Promise.allSettled(closePromises);

        let successCount = 0;
        let failureCount = 0;

        results.forEach(res => {
            if (res.status === 'fulfilled') {
                successCount++;
            } else {
                failureCount++;
                // Log failure details for debugging, but user gets aggregated toast
                console.error("Failed to close one purchase:", res.reason);
            }
        });

        if (failureCount > 0) {
            dispatch(addToast(`Successfully closed ${successCount} item(s). ${failureCount} item(s) failed to close.`, 'failure'));
        } else if (successCount > 0) {
            dispatch(addToast(`${successCount} purchase(s) closed successfully.`, 'success'));
        }

        // Clear selection and close modal regardless of success
        dispatch(clearSelectedPurchases());
        dispatch(toggleOpenClosePurchaseModal());

    }, [dispatch, selectedPurchases, closePurchase, numSelected]);

    // Safety check: only render if the state is true
    if (!openClosePurchaseModal || numSelected === 0) return null;

    return (
        <Modal show={openClosePurchaseModal} size="md" onClose={() => dispatch(toggleOpenClosePurchaseModal())} popup>
            <ModalHeader />
            <ModalBody>
                <div className="text-center">
                    <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        {numSelected === 1
                            ? `Are you sure you want to close the purchase item "${selectedPurchases[0]?.name}"?`
                            : `Are you sure you want to close ${numSelected} selected purchase items?`
                        }
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button color="blue" onClick={handleOnClose} disabled={isClosing}>
                            {isClosing ? <Spinner size='sm' /> : 'Yes, Close Item(s)'}
                        </Button>
                        <Button color="alternative" onClick={() => dispatch(toggleOpenClosePurchaseModal())} disabled={isClosing}>
                            No, cancel
                        </Button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default ClosePurchaseModal;
