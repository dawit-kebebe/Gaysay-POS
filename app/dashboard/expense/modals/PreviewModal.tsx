"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { Button, Label, Modal, ModalBody, ModalHeader, Spinner, Textarea, TextInput } from 'flowbite-react';
import { toggleOpenPreviewModal } from '@/app/store/slice/expense.slice';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaPencil } from 'react-icons/fa6';
import { FiEye } from 'react-icons/fi';
import { PurchaseItem, UpdatePurchaseItemPayload } from '@/app/common/types/purchase'; // Assuming this path is correct
import { useUpdatePurchaseMutation } from '@/app/store/api/expense.api';
import { addToast } from '@/app/store/slice/toast.slice';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

// Schema based on UpdatePurchaseItemPayload
const schema: yup.ObjectSchema<UpdatePurchaseItemPayload> = yup.object({
    id: yup.string().required(), // Hidden field, but required for update
    name: yup.string().required('Name is required').max(100),
    unitPrice: yup.number().required('Unit Price is required').min(0.01, 'Unit Price must be greater than 0.01'),
    quantity: yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1').integer('Quantity must be a whole number'),
    description: yup.string().optional(),
    isClosed: yup.boolean().optional(),
}) as yup.ObjectSchema<UpdatePurchaseItemPayload>;


const PreviewModal = () => {
    const dispatch = useAppDispatch();
    // Assuming selectedPurchases holds an array, and we operate on the first item
    const selectedPurchases: PurchaseItem[] = useAppSelector((state) => state.expense.selectedPurchases);
    const open = useAppSelector((state) => state.expense.openPreviewModal);

    // Default to preview mode
    const [previewOnly, setPreviewOnly] = useState(true);

    const [updatePurchase, { isLoading, isSuccess, isError, error}] = useUpdatePurchaseMutation();

    const item = selectedPurchases[0];

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<UpdatePurchaseItemPayload>({
        resolver: yupResolver(schema),
    });

    // Populate form fields when the modal opens or the selected item changes (UNCONDITIONAL HOOK)
    useEffect(() => {
        if (item && item.id) {
            setValue('id', item.id);
            setValue('name', item.name);
            setValue('unitPrice', item.unitPrice);
            setValue('quantity', item.quantity);
            setValue('description', item.description || '');
            setValue('isClosed', item.isClosed || false);
        } else {
            // Reset form if no item is selected (shouldn't happen if selectedPurchases is correct)
            reset();
        }
    }, [item, setValue, reset]);

    // handleClose hook (UNCONDITIONAL HOOK)
    const handleClose = useCallback(() => {
        dispatch(toggleOpenPreviewModal());
        reset();
        setPreviewOnly(true); // Reset to preview mode on close
    }, [dispatch, reset]);

    const onSubmit = useCallback(async (formData: UpdatePurchaseItemPayload) => {
        // Construct the payload, ensuring unitPrice and quantity are correctly typed as numbers (though yup/rhf handles most of this)
        const updateData: UpdatePurchaseItemPayload = {
            ...formData,
            unitPrice: Number(formData.unitPrice),
            quantity: Number(formData.quantity),
            description: formData.description || undefined,
        };
        await updatePurchase(updateData);
    }, [updatePurchase]);

    // Handle success/error hook (UNCONDITIONAL HOOK)
    useEffect(() => {
        if (isSuccess) {
            dispatch(addToast('Purchase item updated successfully.', 'success'));
            handleClose();
        }
        if (isError) {
            let errorMessage = 'Failed to update purchase.';
            if (typeof error === 'object' && error !== null && 'data' in error) {
                const fetchError = error as FetchBaseQueryError;
                if (typeof fetchError.data === 'object' && fetchError.data !== null && 'message' in fetchError.data) {
                    errorMessage = (fetchError.data as { message: string }).message;
                }
            } else {
                const serializedError = error as SerializedError;
                if (serializedError.message) {
                    errorMessage = serializedError.message;
                }
            }
            dispatch(addToast(errorMessage, 'failure'));
        }
    }, [isSuccess, isError, error, handleClose, dispatch]);

    // Conditional return is now SAFE because all hooks have been called above
    if (!item) return null;

    const togglePreviewMode = () => setPreviewOnly(prev => !prev);


    return (
        <Modal show={Boolean(open)} size="md" onClose={handleClose} popup>
            <ModalHeader />
            <ModalBody>
                <div className="space-y-6">
                    <div className='flex justify-between items-center'>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                            {previewOnly ? 'Purchase Item Preview' : 'Edit Purchase Item'}
                        </h3>
                        <Button className='h-fit py-1 px-2' color='alternative' onClick={togglePreviewMode} disabled={isLoading}>
                            {previewOnly ? <FaPencil className='mr-1' /> : <FiEye className='mr-1' />}
                            {previewOnly ? 'Edit' : 'Preview'}
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <input type="hidden" {...register('id')} />

                        {/* Name Input */}
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="name">Name <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <TextInput
                                id='name'
                                placeholder='Name of the purchased item'
                                {...register('name')}
                                color={errors.name ? 'failure' : undefined}
                                disabled={previewOnly || isLoading}
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Unit Price Input */}
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="unitPrice">Unit Price <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <TextInput
                                id='unitPrice'
                                type='number'
                                step='0.01'
                                placeholder='0.00'
                                {...register('unitPrice', { valueAsNumber: true })}
                                color={errors.unitPrice ? 'failure' : undefined}
                                disabled={previewOnly || isLoading}
                            />
                            {errors.unitPrice && (
                                <p className="mt-1 text-xs text-red-600">{errors.unitPrice.message}</p>
                            )}
                        </div>

                        {/* Quantity Input */}
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="quantity">Quantity <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <TextInput
                                id='quantity'
                                type='number'
                                placeholder='1'
                                {...register('quantity', { valueAsNumber: true })}
                                color={errors.quantity ? 'failure' : undefined}
                                disabled={previewOnly || isLoading}
                            />
                            {errors.quantity && (
                                <p className="mt-1 text-xs text-red-600">{errors.quantity.message}</p>
                            )}
                        </div>

                        {/* Description Input */}
                        <div className="max-w-md">
                            <div className="mb-2 block">
                                <Label htmlFor="description">Description</Label>
                            </div>
                            <Textarea
                                id='description'
                                placeholder='A brief description of the purchase (optional)'
                                {...register('description')}
                                disabled={previewOnly || isLoading}
                                rows={3}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full flex justify-end gap-4 pt-4">
                            <Button
                                color="alternative"
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading || previewOnly}>
                                {isLoading ? <Spinner size='sm' /> : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default PreviewModal;
