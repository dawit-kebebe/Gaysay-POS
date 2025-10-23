'use client';

import { UpdatePasswordPayload, UpdateUserPayload, User, UserRole, UserRoleType } from '@/app/common/types/user';
import fileToDataUrl from '@/app/common/util/file-to-uri.util';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useUpdateUserMutation, useUpdateUserPasswordMutation } from '@/app/store/api/user.api'; // Adjusted path
import { addToast } from '@/app/store/slice/toast.slice';
import { toggleOnlyPreview, toggleOpenPreviewModal } from '@/app/store/slice/user.slice'; // Adjusted path
import { yupResolver } from '@hookform/resolvers/yup';
import { SerializedError } from '@reduxjs/toolkit';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Button, FileInput, Label, Modal, ModalBody, ModalHeader, Select, Spinner, TextInput } from 'flowbite-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaPencil } from 'react-icons/fa6';
import { FiEye } from 'react-icons/fi';
import * as yup from 'yup';


// Schema for UpdateUserPayload (ID is required, password is not for general update form)
const schema: yup.ObjectSchema<UpdateUserPayload> = yup.object({
    id: yup.string().required(),
    name: yup.string().required('Full Name is required').max(100),
    username: yup.string().required('Username is required').min(4).max(50),
    role: yup.string().oneOf(Object.values(UserRole) as UserRoleType[], 'Role is required').required('Role is required'),
    avatarUrl: yup.string().optional(),
}) as yup.ObjectSchema<UpdateUserPayload>;

// Separate schema for password update
const passwordSchema = yup.object({
    newPassword: yup.string().min(8, 'New password must be at least 8 characters').required('New password is required'),
});

const PreviewModal = () => {
    const dispatch = useAppDispatch();
    const { open: openPreviewModal, previewOnly } = useAppSelector((state) => state.user.previewModal); // Adjusted slice name
    const selectedUser: User[] = useAppSelector((state) => state.user.selectedUser); // Adjusted slice name

    const [updateUser, { isLoading: isUpdating, isSuccess: isUpdateSuccess, isError: isUpdateError, error: updateError, data: updateData }] = useUpdateUserMutation();
    const [updatePassword, { isLoading: isPasswordUpdating, isSuccess: isPasswordSuccess, isError: isPasswordError, error: passwordError }] = useUpdateUserPasswordMutation();

    const [newImageUri, setNewImageUri] = useState<string | null>(null); // New Data URL to submit
    const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null); // Local Blob URL for image preview
    const localPreviewRef = useRef<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<UpdateUserPayload>({
        resolver: yupResolver(schema),
    });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        formState: { errors: passwordErrors },
        reset: resetPassword,
        // getValues: getPasswordValues
    } = useForm<{ newPassword: string }>({
        resolver: yupResolver(passwordSchema),
        defaultValues: { newPassword: '' }
    });

    const currentAvatarUrl = watch('avatarUrl');
    const currentUserId = watch('id');

    // Effect to populate form when selectedUser changes
    useEffect(() => {
        const item = selectedUser[0];
        if (item && item.id) {
            setValue('id', item.id);
            setValue('name', item.name);
            setValue('username', item.username);
            setValue('role', item.role);
            setValue('avatarUrl', item.avatarUrl || '');

            setNewImageUri(null);
            const prev = localPreviewRef.current;
            if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
            setLocalPreviewUrl(null);
            localPreviewRef.current = null;
            resetPassword();
        }
    }, [selectedUser, setValue, resetPassword]);

    useEffect(() => {
        localPreviewRef.current = localPreviewUrl;
    }, [localPreviewUrl]);

    // Cleanup Blob URL on unmount
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
        resetPassword();
        setNewImageUri(null);
        const prev = localPreviewRef.current;
        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
        setLocalPreviewUrl(null);
        localPreviewRef.current = null;
    }, [dispatch, reset, resetPassword]);

    const onSubmit = useCallback(async (formData: UpdateUserPayload) => {
        const finalAvatarUrl = newImageUri || formData.avatarUrl;

        const userData: UpdateUserPayload = {
            id: formData.id,
            name: formData.name,
            username: formData.username,
            role: formData.role,
            avatarUrl: finalAvatarUrl,
            // Password is NOT sent here
        };

        await updateUser(userData);
    }, [updateUser, newImageUri]);


    const onPasswordSubmit = useCallback(async (formData: { newPassword: string }) => {
        const id = currentUserId;
        if (!id) {
            dispatch(addToast('User ID is missing for password update.', 'failure'));
            return;
        }
        const passwordData: UpdatePasswordPayload = {
            id: id,
            newPassword: formData.newPassword,
        };
        await updatePassword(passwordData);
    }, [updatePassword, currentUserId, dispatch]);


    // Effect for handling general update mutation result
    useEffect(() => {
        if (isUpdateSuccess) {
            const successMessage = (updateData as User)?.name ? `User "${(updateData as User).name}" updated successfully.` : 'User updated successfully.';
            dispatch(addToast(successMessage, 'success'));
            handleClose();
        }
        if (isUpdateError) {
            let errorMessage = 'An unknown error occurred during user update.';
            // Error handling logic
            if (typeof updateError === 'object' && updateError !== null && 'status' in updateError) {
                const fetchError = updateError as FetchBaseQueryError;
                if (typeof fetchError.data === 'object' && fetchError.data !== null && 'message' in fetchError.data) {
                    errorMessage = (fetchError.data as { message: string }).message;
                }
            } else {
                const serializedError = updateError as SerializedError;
                if (serializedError.message) {
                    errorMessage = serializedError.message;
                }
            }
            dispatch(addToast(errorMessage, 'failure'));
        }
    }, [isUpdateSuccess, isUpdateError, updateError, handleClose, updateData, dispatch]);

    // Effect for handling password update mutation result
    useEffect(() => {
        if (isPasswordSuccess) {
            dispatch(addToast('Password updated successfully.', 'success'));
            resetPassword();
        }
        if (isPasswordError) {
            let errorMessage = 'An unknown error occurred during password update.';
            // Error handling logic
            if (typeof passwordError === 'object' && passwordError !== null && 'status' in passwordError) {
                const fetchError = passwordError as FetchBaseQueryError;
                if (typeof fetchError.data === 'object' && fetchError.data !== null && 'message' in fetchError.data) {
                    errorMessage = (fetchError.data as { message: string }).message;
                }
            } else {
                const serializedError = passwordError as SerializedError;
                if (serializedError.message) {
                    errorMessage = serializedError.message;
                }
            }
            dispatch(addToast(errorMessage, 'failure'));
        }
    }, [isPasswordSuccess, isPasswordError, passwordError, dispatch, resetPassword]);

    const currentItem = selectedUser[0];
    const isLoading = isUpdating || isPasswordUpdating;

    if (!currentItem) return null;

    const imageSrc = localPreviewUrl || currentAvatarUrl || '/images/default-avatar.png'; // Use a default image if none is set

    return (
        <Modal show={openPreviewModal} size="lg" onClose={handleClose} popup>
            <ModalHeader />
            <ModalBody>
                <div className="space-y-6">
                    <div className='flex gap-2 items-center'>
                        <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                            {previewOnly ? 'User Preview' : 'Update User Details'}
                        </h3>
                        <Button className='h-fit py-1 px-2' color='alternative' onClick={() => dispatch(toggleOnlyPreview())}>
                            {previewOnly ? <FaPencil /> : <FiEye />}
                        </Button>
                    </div>
                    {/* Main User Details Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                        <input type="hidden" {...register('id')} />

                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="name">Full Name <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <TextInput
                                id='name'
                                placeholder='Full Name'
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
                                <Label htmlFor="username">Username <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <TextInput
                                id='username'
                                placeholder='Username'
                                {...register('username')}
                                color={errors.username ? 'failure' : undefined}
                                disabled={previewOnly}
                            />
                            {errors.username && (
                                <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
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
                                disabled={previewOnly}
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
                                <Label htmlFor="avatarFile">Avatar Image (Replace)</Label>
                            </div>
                            <FileInput
                                id='avatarFile'
                                accept='image/*'
                                onChange={handleFileChange}
                                disabled={previewOnly}
                            />
                            {imageSrc && (
                                <div className='mt-3 w-32 h-32 relative border rounded-full overflow-hidden'>
                                    <Image
                                        src={imageSrc}
                                        alt="Avatar Preview"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        unoptimized
                                    />
                                </div>
                            )}
                        </div>
                        <input type="hidden" {...register('avatarUrl')} />


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
                                {isUpdating ? <Spinner size='sm' /> : 'Submit Update'}
                            </Button>
                        </div>
                    </form>

                    <hr className='my-4 border-gray-200 dark:border-gray-700' />

                    {/* Password Update Form (always visible for privileged users/self-update, but disabled in previewOnly) */}
                    <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className='space-y-4'>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Update Password</h4>
                        <div>
                            <div className="mb-2 block">
                                <Label htmlFor="newPassword">New Password <span className='text-lg text-red-500'>{'*'}</span></Label>
                            </div>
                            <TextInput
                                id='newPassword'
                                type='password'
                                placeholder='••••••••'
                                {...registerPassword('newPassword')}
                                color={passwordErrors.newPassword ? 'failure' : undefined}
                                disabled={previewOnly}
                            />
                            {passwordErrors.newPassword && (
                                <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword.message}</p>
                            )}
                        </div>
                        <div className="w-full flex justify-end">
                            <Button type="submit" disabled={isPasswordUpdating || previewOnly}>
                                {isPasswordUpdating ? <Spinner size='sm' /> : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default PreviewModal;