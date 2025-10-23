"use client";

import { CreateSellsPayload } from '@/app/common/types/sells';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useGetMenusQuery } from '@/app/store/api/menu.api';
import { useOpenSellsMutation } from '@/app/store/api/open-sells.api';
import { toggleOpenSellsModal } from '@/app/store/slice/open-sells.slice';
import { addToast } from '@/app/store/slice/toast.slice';
import { yupResolver } from '@hookform/resolvers/yup';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Button, Label, Modal, ModalBody, ModalHeader, Select, TextInput } from 'flowbite-react';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

const OpenSellsModal = () => {
    const dispatch = useAppDispatch();
    const openSellsModal = useAppSelector(state => state.openSells.openSellsModal);

    const { data: menus = [] } = useGetMenusQuery();
    const [openSells, { isLoading, isSuccess, isError, error, data }] = useOpenSellsMutation();

    const schema: yup.ObjectSchema<CreateSellsPayload> = yup.object({
        itemId: yup.string().required('Item must be selected'),
        frequency: yup.number().default(0).required('Initial sold unit must be set.')
    }) as yup.ObjectSchema<CreateSellsPayload>;

    const {
        register,
        handleSubmit,
        setValue,
        reset,
    } = useForm<CreateSellsPayload>({
        resolver: yupResolver(schema),
    });

    const handleClose = useCallback(() => {
        dispatch(toggleOpenSellsModal());
        reset();
    }, [dispatch, reset]);

    const onSubmit = useCallback(async (data: CreateSellsPayload) => {
        setValue('timestamp', new Date());
        await openSells(data);
    }, [openSells, setValue]);

    useEffect(() => {
        if (isSuccess) {
            // const successMessage = data.message;
            dispatch(addToast('Sells opened successfully.', 'success'));
            handleClose();
        }

        if (isError) {
            let errorMessage = 'Error occured';
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
    }, [isSuccess, isError, error, handleClose, data, dispatch]);

    return (
        <Modal show={openSellsModal} size="md" onClose={handleClose} popup>
            <ModalHeader />
            <ModalBody>
                <div className="space-y-6">
                    <div className='flex gap-2 items-center'>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">Open Sells Modal</h3>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="max-w-md">
                            <div className="mb-2 block">
                                <Label htmlFor="menu-item">Select Menu Item</Label>
                            </div>
                            <Select id="menu-item" required {...register('itemId')}>
                                {
                                    menus.map(item => {
                                        return (
                                            <option value={item.id} key={`${item.id}`}>{item.name} - {item.catagory}</option>
                                        )
                                    })
                                }
                            </Select>
                        </div>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="init-sells">Units Sold</Label>
                            </div>
                            <TextInput id="init-sells" type="number" required shadow placeholder='15' defaultValue={0} {...register('frequency')} />
                        </div>
                        <div className="w-full flex justify-end gap-4 mt-4">
                            <Button type="submit" disabled={isLoading} className='w-full'>
                                {isLoading ? 'Adding ...' : 'Add'}
                            </Button>
                        </div>
                    </form>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default OpenSellsModal