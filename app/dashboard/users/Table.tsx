"use client";

import IconButton from "@/app/components/IconButton"; // Assuming this exists
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useGetUsersQuery } from '@/app/store/api/user.api'; // Adjusted hook
import {
    addSelectedUser,
    clearselectedUser,
    removeSelectedUser,
    toggleOnlyPreview,
    toggleOpenDeleteModal,
    toggleOpenPreviewModal,
} from '@/app/store/slice/user.slice'; // Adjusted imports
import {
    Checkbox,
    Table as FlowbiteTable,
    Spinner,
    TableBody,
    TableCell,
    TableHead,
    TableHeadCell,
    TableRow
} from 'flowbite-react';

import { User } from "@/app/common/types/user";
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { FaBoxOpen, FaRegTrashCan } from 'react-icons/fa6';
import { FiEye } from 'react-icons/fi';

const HeaderCheckbox = memo(
    ({ checked, indeterminate, onChange }: { checked: boolean; indeterminate: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => {
        const ref = useRef<HTMLInputElement>(null);
        useEffect(() => {
            if (ref.current) ref.current.indeterminate = indeterminate;
        }, [indeterminate]);
        return <Checkbox ref={ref} checked={checked} onChange={onChange} />;
    }
);
HeaderCheckbox.displayName = 'HeaderCheckbox';

const UserRow = memo(({ user, isSelected, onToggle, onEdit, onDelete }: {
    user: User;
    isSelected: boolean;
    onToggle: (user: User) => void;
    onEdit: (user: User, previewOnly: boolean) => void;
    onDelete: (user: User) => void;
}) => {

    // const handleEditClick = useCallback((e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     onEdit(user, false);
    // }, [user, onEdit]);

    const handleViewClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(user, true);
    }, [user, onEdit]);

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(user);
    }, [user, onDelete]);

    return (
        <TableRow
            key={user.id}
            onClick={() => onToggle(user)}
            className={`bg-white dark:border-gray-700 dark:bg-gray-800 cursor-pointer ${isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
        >
            <TableCell className='p-4 w-4'>
                <Checkbox checked={isSelected} onChange={() => onToggle(user)} />
            </TableCell>
            <TableCell className='font-medium text-gray-900 dark:text-white'>{user.name}</TableCell>
            <TableCell>{user.username}</TableCell>
            <TableCell>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <IconButton onClick={handleViewClick}>
                        <FiEye />
                    </IconButton>
                    <IconButton onClick={handleDeleteClick}>
                        <FaRegTrashCan />
                    </IconButton>
                </div>
            </TableCell>
        </TableRow>
    );
});
UserRow.displayName = 'UserRow';

export default function UserTable() {
    const dispatch = useAppDispatch();

    const { data: users = [], isLoading: isFetching, isError: fetchIsError } = useGetUsersQuery(); // Adjusted hook

    const selectedUser = useAppSelector((state) => state.user.selectedUser); // Adjusted slice name

    const selectedIds = useMemo(() => new Set(selectedUser.map((m: User) => m.id)), [selectedUser]);
    const isAllSelected = useMemo(() => users.length > 0 && selectedUser.length === users.length, [users.length, selectedUser.length]);
    const isIndeterminate = useMemo(() => selectedUser.length > 0 && selectedUser.length < users.length, [users.length, selectedUser.length]);

    const handleToggleAll = useCallback(() => {
        if (isAllSelected) {
            dispatch(clearselectedUser());
        } else {
            users.forEach((user: User) => {
                if (user.id) dispatch(addSelectedUser(user));
            });
        }
    }, [isAllSelected, users, dispatch]);

    const handleToggleUser = useCallback((user: User) => {
        if (!user.id) return;
        if (selectedIds.has(user.id)) {
            dispatch(removeSelectedUser(user.id));
        } else {
            dispatch(addSelectedUser(user));
        }
    }, [selectedIds, dispatch]);

    const handleEditOrPreview = useCallback((user: User, previewOnly: boolean) => {
        if (!user.id) return;
        dispatch(clearselectedUser());
        dispatch(addSelectedUser(user));
        dispatch(toggleOnlyPreview(previewOnly));
        dispatch(toggleOpenPreviewModal(true));
    }, [dispatch]);

    const handleDeleteSingle = useCallback((user: User) => {
        if (!user.id) return;
        dispatch(clearselectedUser());
        dispatch(addSelectedUser(user));
        dispatch(toggleOpenDeleteModal());
    }, [dispatch]);


    if (isFetching) {
        return <Spinner />
    }

    if (fetchIsError) {
        return <div className="p-4 text-red-500">Error: Failed to load user items.</div>;
    }

    if (users.length === 0) {
        return <div className='flex flex-col justify-center items-center'>
            <span className='text-6xl'><FaBoxOpen /> </span>
            <span className='text-2xl'>No Users</span>
        </div>
    }

    return (
        <>
            <div className="overflow-x-auto w-full">
                <FlowbiteTable striped hoverable className='min-w-full'>
                    <TableHead>
                        <TableRow>
                            <TableHeadCell className='p-4 w-4'>
                                <HeaderCheckbox
                                    checked={isAllSelected}
                                    indeterminate={isIndeterminate}
                                    onChange={handleToggleAll}
                                />
                            </TableHeadCell>
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Username</TableHeadCell>
                            <TableHeadCell>Role</TableHeadCell>
                            <TableHeadCell>
                                <span className="sr-only">Actions</span>
                            </TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className="divide-y">
                        {users.map((user: User) => (
                            user.id ? (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    isSelected={selectedIds.has(user.id)}
                                    onToggle={handleToggleUser}
                                    onEdit={handleEditOrPreview}
                                    onDelete={handleDeleteSingle}
                                />
                            ) : null
                        ))}
                    </TableBody>
                </FlowbiteTable>
            </div>
        </>
    );
}