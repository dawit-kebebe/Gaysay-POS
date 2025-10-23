"use client";

import { useAppDispatch, useAppSelector } from '@/app/store';
import { useCreatePurchaseMutation } from '@/app/store/api/expense.api';
import { toggleOpenCreateModal } from '@/app/store/slice/expense.slice';
import { addToast } from '@/app/store/slice/toast.slice';
import { Button, Label, Modal, ModalBody, ModalHeader, Spinner, Textarea, TextInput } from 'flowbite-react';
import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { CreatePurchaseItemPayload } from '@/app/common/types/purchase'; // Assuming the type is at this path
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

// Schema based on CreatePurchaseItemPayload
const schema: yup.ObjectSchema<CreatePurchaseItemPayload> = yup.object({
    name: yup.string().required('Name is required').max(100),
    unitPrice: yup.number().required('Unit Price is required').min(0.01, 'Unit Price must be greater than 0.01'),
    quantity: yup.number().required('Quantity is required').min(1, 'Quantity must be at least 1').integer('Quantity must be a whole number'),
    description: yup.string().optional(),
}) as yup.ObjectSchema<CreatePurchaseItemPayload>;


const CreateModal = () => {
    const dispatch = useAppDispatch();
    const openCreateModal = useAppSelector((state) => state.expense.openCreateModal);

    const [createPurchase, { isLoading, isSuccess, isError, error }] = useCreatePurchaseMutation();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreatePurchaseItemPayload>({
        resolver: yupResolver(schema),
        defaultValues: { name: '', unitPrice: 0.01, quantity: 1, description: '' },
    });

    const handleClose = useCallback(() => {
        dispatch(toggleOpenCreateModal());
        reset();
    }, [dispatch, reset]);

    const onSubmit = useCallback(async (formData: CreatePurchaseItemPayload) => {
        await createPurchase(formData);
    }, [createPurchase]);

    React.useEffect(() => {
        if (isSuccess) {
            dispatch(addToast('Purchase item created successfully.', 'success'));
            handleClose();
        }
        if (isError) {
            let errorMessage = 'An unknown error occurred.';
            if (typeof error === 'object' && error !== null && 'status' in error) {
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
    }, [isSuccess, isError, dispatch, handleClose, error]);

    return (
        <Modal show={openCreateModal} size="md" onClose={handleClose} popup>
            <ModalHeader />
            <ModalBody>
                <div className="space-y-6">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Create Purchase</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="name">Name <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <TextInput
                                id='name'
                                placeholder='Name of the purchased item'
                                {...register('name')}
                                color={errors.name ? 'failure' : undefined}
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                            )}
                        </div>

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
                            />
                            {errors.unitPrice && (
                                <p className="mt-1 text-xs text-red-600">{errors.unitPrice.message}</p>
                            )}
                        </div>

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
                            />
                            {errors.quantity && (
                                <p className="mt-1 text-xs text-red-600">{errors.quantity.message}</p>
                            )}
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="description">Description</Label>
                            </div>
                            <Textarea
                                id='description'
                                placeholder='A brief description of the purchase (optional)'
                                {...register('description')}
                                rows={3}
                            />
                        </div>

                        <div className="w-full flex justify-end gap-4 pt-4">
                            <Button
                                color="alternative"
                                type="button"
                                onClick={handleClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Spinner size='sm' /> : 'Create'}
                            </Button>
                        </div>
                    </form>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default CreateModal;