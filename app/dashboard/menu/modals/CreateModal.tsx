'use client';

import { CreateMenuPayload, MenuItemCatagory, MenuItemCatagoryType, type Menu } from '@/app/common/types/menu';
import fileToDataUrl from '@/app/common/util/file-to-uri.util';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useCreateMenuMutation } from '@/app/store/api/menu.api';
import { toggleOpenCreateModal } from '@/app/store/slice/menu.slice';
import { addToast } from '@/app/store/slice/toast.slice';
import { yupResolver } from '@hookform/resolvers/yup';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Button, FileInput, Label, Modal, ModalBody, ModalHeader, Select, Spinner, Textarea, TextInput } from 'flowbite-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

const schema: yup.ObjectSchema<CreateMenuPayload> = yup.object({
    name: yup.string().required('Name is required').max(100),
    catagory: yup.string().oneOf(Object.values(MenuItemCatagory) as MenuItemCatagoryType[], 'Category is required').required('Category is required'),
    price: yup.number().required('Price is required').min(0.01, 'Price must be greater than 0.01'),
    description: yup.string().optional(),
    menuImgUrl: yup.string().optional(),
}) as yup.ObjectSchema<CreateMenuPayload>;

const CreateModal = () => {
    const dispatch = useAppDispatch();
    const openCreateModal = useAppSelector((state) => state.menu.openCreateModal);

    const [createMenu, { isLoading, isSuccess, isError, error, data }] = useCreateMenuMutation();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const previewUrlRef = useRef<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateMenuPayload>({
        resolver: yupResolver(schema),
        defaultValues: { name: '', catagory: MenuItemCatagory.FOOD as MenuItemCatagoryType, price: 0.01, description: '' },
    });

    // keep a ref to the latest previewUrl so handlers can access it without
    // introducing it into dependency arrays (which would make handlers unstable)
    useEffect(() => {
        previewUrlRef.current = previewUrl;
    }, [previewUrl]);

    useEffect(() => {
        return () => {
            const url = previewUrlRef.current;
            if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
        };
    }, []);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const file = event.target.files ? event.target.files[0] : null;

        if (!file) {
            setImageUri(null);
            setPreviewUrl(null);
            return;
        }

        if (!file.type.startsWith('image/')) {
            dispatch(addToast('Please select a valid image file.', 'failure'));
            setImageUri(null);
            setPreviewUrl(null);
            return;
        }

        try {
            const uri = await fileToDataUrl(file);
            setImageUri(uri);

            if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));

        } catch (_) {
            dispatch(addToast('Failed to read image file.', 'failure'));
            setImageUri(null);
            setPreviewUrl(null);
        }
    };

    const handleClose = useCallback(() => {
        dispatch(toggleOpenCreateModal());
        reset();
        setImageUri(null);
        const url = previewUrlRef.current;
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
        setPreviewUrl(null);
    }, [dispatch, reset]);

    const onSubmit = useCallback(async (formData: CreateMenuPayload) => {
        const menuData: Omit<Menu, 'id'> = {
            name: formData.name,
            catagory: formData.catagory,
            price: formData.price,
            description: formData.description,
            menuImgUrl: imageUri || undefined,
        };

        await createMenu(menuData);
    }, [createMenu, imageUri]);

    useEffect(() => {
        if (isSuccess) {
            const successMessage = (data as Menu)?.name ? `Menu item "${(data as Menu).name}" created successfully.` : 'Menu item created successfully.';
            dispatch(addToast(successMessage, 'success'));
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
    }, [isSuccess, isError, error, handleClose, data, dispatch]);

    return (
        <Modal show={openCreateModal} size="lg" onClose={handleClose} popup>
            <ModalHeader />
            <ModalBody>
                <div className="space-y-6">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Create New Menu Item</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="name">Name <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <TextInput
                                id='name'
                                placeholder='Menu Item Name'
                                {...register('name')}
                                color={errors.name ? 'failure' : undefined}
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="catagory">Category <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <Select
                                id='catagory'
                                {...register('catagory')}
                                color={errors.catagory ? 'failure' : undefined}
                                defaultValue={MenuItemCatagory.FOOD}
                            >
                                {Object.values(MenuItemCatagory).map((catagory) => (
                                    <option key={catagory} value={catagory}>{catagory}</option>
                                ))}
                            </Select>
                            {errors.catagory && (
                                <p className="mt-1 text-xs text-red-600">{errors.catagory.message}</p>
                            )}
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="price">Price <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <TextInput
                                id='price'
                                type='number'
                                step="0.01"
                                placeholder='0.00'
                                {...register('price', { valueAsNumber: true })}
                                color={errors.price ? 'failure' : undefined}
                            />
                            {errors.price && (
                                <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
                            )}
                        </div>

                        <div className="max-w-md">
                            <div className="mb-2 block">
                                <Label htmlFor="description">Description</Label>
                            </div>
                            <Textarea
                                id='description'
                                placeholder='A brief description of the item'
                                {...register('description')}
                                rows={4}
                            />
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="imageFile">Menu Image (Optional)</Label>
                            </div>
                            <FileInput
                                id='imageFile'
                                accept='image/*'
                                onChange={handleFileChange}
                            />
                            {previewUrl && (
                                <div className='mt-3 w-fill h-48 relative border rounded-md overflow-hidden'>
                                    <Image
                                        src={previewUrl}
                                        alt="Image Preview"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        unoptimized
                                    />
                                </div>
                            )}
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