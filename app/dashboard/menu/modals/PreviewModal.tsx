'use client';

import { MenuItemCatagory, MenuItemCatagoryType, UpdateMenuPayload, type Menu } from '@/app/common/types/menu';
import fileToDataUrl from '@/app/common/util/file-to-uri.util';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useUpdateMenuMutation } from '@/app/store/api/menu.api';
import { toggleOnlyPreview, toggleOpenPreviewModal } from '@/app/store/slice/menu.slice';
import { addToast } from '@/app/store/slice/toast.slice';
import { yupResolver } from '@hookform/resolvers/yup';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Button, FileInput, Label, Modal, ModalBody, ModalHeader, Select, Spinner, Textarea, TextInput } from 'flowbite-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaPencil } from 'react-icons/fa6';
import { FiEye } from 'react-icons/fi';
import * as yup from 'yup';


const schema: yup.ObjectSchema<UpdateMenuPayload> = yup.object({
    name: yup.string().required('Name is required').max(100),
    catagory: yup.string().oneOf(Object.values(MenuItemCatagory) as MenuItemCatagoryType[], 'Category is required').required('Category is required'),
    price: yup.number().required('Price is required').min(0.01, 'Price must be greater than 0.01'),
    description: yup.string().optional(),
    menuImgUrl: yup.string().optional(),
}) as yup.ObjectSchema<UpdateMenuPayload>;


const PreviewModal = () => {
    const dispatch = useAppDispatch();
    const { open: openPreviewModal, previewOnly } = useAppSelector((state) => state.menu.previewModal);
    const selectedMenu: Menu[] = useAppSelector((state) => state.menu.selectedMenu);

    const [updateMenu, { isLoading, isSuccess, isError, error, data }] = useUpdateMenuMutation();
    const [newImageUri, setNewImageUri] = useState<string | null>(null);
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
    const localPreviewRef = useRef<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<UpdateMenuPayload>({
        resolver: yupResolver(schema),
    });

    const currentMenuImgUrl = watch('menuImgUrl');

    useEffect(() => {
        const item = selectedMenu[0];
        if (item && item.id) {
            setValue('id', item.id);
            setValue('name', item.name);
            setValue('catagory', item.catagory);
            setValue('price', item.price);
            setValue('description', item.description || '');
            setValue('menuImgUrl', item.menuImgUrl || '');

            setNewImageUri(null);
            const prev = localPreviewRef.current;
            if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
            setLocalPreviewUrl(null);
            localPreviewRef.current = null;
        }
    }, [selectedMenu, setValue]);

    useEffect(() => {
        localPreviewRef.current = localPreviewUrl;
    }, [localPreviewUrl]);

    useEffect(() => {
        return () => {
            const prev = localPreviewRef.current;
            if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        };
    }, []);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;

        if (!file) {
            setNewImageUri(null);
            setLocalPreviewUrl(null);
            return;
        }

        if (!file.type.startsWith('image/')) {
            dispatch(addToast('Please select a valid image file.', 'failure'));
            setNewImageUri(null);
            setLocalPreviewUrl(null);
            return;
        }

        try {
            const uri = await fileToDataUrl(file);
            setNewImageUri(uri);

            if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(localPreviewUrl);
            setLocalPreviewUrl(URL.createObjectURL(file));

        } catch (_) {
            dispatch(addToast('Failed to read image file.', 'failure'));
            setNewImageUri(null);
            setLocalPreviewUrl(null);
        }
    };

    const handleClose = useCallback(() => {
        dispatch(toggleOpenPreviewModal());
        reset();
        setNewImageUri(null);
        const prev = localPreviewRef.current;
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        setLocalPreviewUrl(null);
        localPreviewRef.current = null;
    }, [dispatch, reset]);

    const onSubmit = useCallback(async (formData: UpdateMenuPayload) => {
        const finalMenuImgUrl = newImageUri || formData.menuImgUrl;

        const menuData: Menu = {
            id: formData.id,
            name: formData.name,
            catagory: formData.catagory,
            price: formData.price,
            description: formData.description,
            menuImgUrl: finalMenuImgUrl,
        };

        await updateMenu(menuData);
    }, [updateMenu, newImageUri]);

    useEffect(() => {
        if (isSuccess) {
            const successMessage = (data as Menu)?.name ? `Menu item "${(data as Menu).name}" updated successfully.` : 'Menu item updated successfully.';
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

    const currentItem = selectedMenu[0];

    if (!currentItem) return null;

    const imageSrc = localPreviewUrl || currentMenuImgUrl;

    return (
        <Modal show={openPreviewModal} size="lg" onClose={handleClose} popup>
            <ModalHeader />
            <ModalBody>
                <div className="space-y-6">
                    <div className='flex gap-2 items-center'>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                            {previewOnly ? 'Menu Item Preview' : 'Update Menu Item'}
                        </h3>
                        <Button className='h-fit py-1 px-2' color='alternative' onClick={() => dispatch(toggleOnlyPreview())}>
                            {previewOnly ? <FaPencil /> : <FiEye />}
                        </Button>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <input type="hidden" {...register('id')} />

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="name">Name <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <TextInput
                                id='name'
                                placeholder='Menu Item Name'
                                {...register('name')}
                                color={errors.name ? 'failure' : undefined}
                                disabled={previewOnly}
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
                                disabled={previewOnly}
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
                                disabled={previewOnly}
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
                                disabled={previewOnly}
                                rows={4}
                            />
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="imageFile">Menu Image (Replace)</Label>
                            </div>
                            <FileInput
                                id='imageFile'
                                accept='image/*'
                                onChange={handleFileChange}
                                disabled={previewOnly}
                            />
                            {imageSrc && (
                                <div className='mt-3 w-fill h-48 relative border rounded-md overflow-hidden'>
                                    <Image
                                        src={imageSrc}
                                        alt="Image Preview"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        unoptimized
                                    />
                                </div>
                            )}
                        </div>
                        <input type="hidden" {...register('menuImgUrl')} />


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
                                {isLoading ? <Spinner size='sm' /> : 'Submit Update'}
                            </Button>
                        </div>
                    </form>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default PreviewModal;