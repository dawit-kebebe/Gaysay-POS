'use client';

import fileToDataUrl from '@/app/common/util/file-to-uri.util'; // Assuming this utility is available
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useCreateUserMutation } from '@/app/store/api/user.api'; // Adjusted path
import { toggleOpenCreateModal } from '@/app/store/slice/user.slice'; // Adjusted path
import { addToast } from '@/app/store/slice/toast.slice';
import { yupResolver } from '@hookform/resolvers/yup';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Button, FileInput, Label, Modal, ModalBody, ModalHeader, Select, Spinner, TextInput } from 'flowbite-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { CreateUserPayload, User, UserRole, UserRoleType } from '@/app/common/types/user';

// Define the schema for CreateUserPayload (omits 'id')
const schema: yup.ObjectSchema<CreateUserPayload> = yup.object({
    name: yup.string().required('Full Name is required').max(100),
    username: yup.string().required('Username is required').min(4).max(50),
    password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    role: yup.string().oneOf(Object.values(UserRole) as UserRoleType[], 'Role is required').required('Role is required'),
    avatarUrl: yup.string().optional(),
}) as yup.ObjectSchema<CreateUserPayload>;

const CreateModal = () => {
    const dispatch = useAppDispatch();
    const openCreateModal = useAppSelector((state) => state.user.openCreateModal); // Adjusted slice name

    const [createMenu, { isLoading, isSuccess, isError, error, data }] = useCreateUserMutation(); // Adjusted hook
    const [imageUri, setImageUri] = useState<string | null>(null); // Stores the data URL for submission
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Stores the blob URL for local preview
    const previewUrlRef = useRef<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateUserPayload>({
        resolver: yupResolver(schema),
        defaultValues: { name: '', username: '', password: '', role: UserRole.EMPLOYEE as UserRoleType },
    });

    useEffect(() => {
        previewUrlRef.current = previewUrl;
    }, [previewUrl]);

    useEffect(() => {
        // Cleanup function to revoke Blob URL on unmount
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
            // Convert to data URL for submission
            const uri = await fileToDataUrl(file);
            setImageUri(uri);

            // Create blob URL for local preview and revoke old one
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

    const onSubmit = useCallback(async (formData: CreateUserPayload) => {
        const userData: CreateUserPayload = {
            name: formData.name,
            username: formData.username,
            password: formData.password,
            role: formData.role,
            avatarUrl: imageUri || undefined, // Use the data URL from state
        };

        await createMenu(userData);
    }, [createMenu, imageUri]);

    useEffect(() => {
        if (isSuccess) {
            const successMessage = (data as User)?.name ? `User "${(data as User).name}" created successfully.` : 'User created successfully.';
            dispatch(addToast(successMessage, 'success'));
            handleClose();
        }
        if (isError) {
            let errorMessage = 'An unknown error occurred.';
            // Error handling logic as seen in PreviewModal.tsx
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
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">Create New User</h3>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="name">Full Name <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <TextInput
                                id='name'
                                placeholder='John Doe'
                                {...register('name')}
                                color={errors.name ? 'failure' : undefined}
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="username">Username <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <TextInput
                                id='username'
                                placeholder='johndoe'
                                {...register('username')}
                                color={errors.username ? 'failure' : undefined}
                            />
                            {errors.username && (
                                <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
                            )}
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="password">Password <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <TextInput
                                id='password'
                                type='password'
                                placeholder='••••••••'
                                {...register('password')}
                                color={errors.password ? 'failure' : undefined}
                            />
                            {errors.password && (
                                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="role">Role <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <Select
                                id='role'
                                {...register('role')}
                                color={errors.role ? 'failure' : undefined}
                                defaultValue={UserRole.EMPLOYEE}
                            >
                                {Object.values(UserRole).map((role) => (
                                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                ))}
                            </Select>
                            {errors.role && (
                                <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>
                            )}
                        </div>


                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="avatarFile">Avatar Image (Optional)</Label>
                            </div>
                            <FileInput
                                id='avatarFile'
                                accept='image/*'
                                onChange={handleFileChange}
                            />
                            {previewUrl && (
                                <div className='mt-3 w-32 h-32 relative border rounded-full overflow-hidden'>
                                    <Image
                                        src={previewUrl}
                                        alt="Avatar Preview"
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
                                {isLoading ? <Spinner size='sm' /> : 'Create User'}
                            </Button>
                        </div>
                    </form>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default CreateModal;