"use client";

import { Menu } from '@/app/common/types/menu';
import IconButton from "@/app/components/IconButton";
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useGetMenusQuery } from '@/app/store/api/menu.api';
import {
    addSelectedMenu,
    clearselectedMenu,
    removeSelectedMenu,
    toggleOnlyPreview,
    toggleOpenDeleteModal,
    toggleOpenPreviewModal,
} from '@/app/store/slice/menu.slice';
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

const MenuRow = memo(({ menu, isSelected, onToggle, onEdit, onDelete }: {
    menu: Menu;
    isSelected: boolean;
    onToggle: (menu: Menu) => void;
    onEdit: (menu: Menu, previewOnly: boolean) => void;
    onDelete: (menu: Menu) => void;
}) => {
    const formattedPrice = useMemo(() => {
        return menu.price ? `$${menu.price.toFixed(2)}` : 'N/A';
    }, [menu.price]);

    // const handleEditClick = useCallback((e: React.MouseEvent) => {
    //     e.stopPropagation();
    //     onEdit(menu, false);
    // }, [menu, onEdit]);

    const handleViewClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit(menu, true);
    }, [menu, onEdit]);

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(menu);
    }, [menu, onDelete]);

    return (
        <TableRow
            key={menu.id}
            onClick={() => onToggle(menu)}
            className={`bg-white dark:border-gray-700 dark:bg-gray-800 cursor-pointer ${isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
        >
            <TableCell className='p-4 w-4'>
                <Checkbox checked={isSelected} onChange={() => onToggle(menu)} />
            </TableCell>
            <TableCell className="font-medium text-gray-900 dark:text-white">{menu.name}</TableCell>
            <TableCell>{formattedPrice}</TableCell>
            <TableCell className='max-w-xs truncate'>{menu.description || 'No description'}</TableCell>
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
MenuRow.displayName = 'MenuRow';

export function MenuTable() {
    const dispatch = useAppDispatch();

    const { data: menus = [], isLoading: isFetching, isError: fetchIsError } = useGetMenusQuery();

    const selectedMenu = useAppSelector((state) => state.menu.selectedMenu);

    const selectedIds = useMemo(() => new Set(selectedMenu.map((m: Menu) => m.id)), [selectedMenu]);
    const isAllSelected = useMemo(() => menus.length > 0 && selectedMenu.length === menus.length, [menus.length, selectedMenu.length]);
    const isIndeterminate = useMemo(() => selectedMenu.length > 0 && selectedMenu.length < menus.length, [menus.length, selectedMenu.length]);

    const handleToggleAll = useCallback(() => {
        if (isAllSelected) {
            dispatch(clearselectedMenu());
        } else {
            menus.forEach((menu: Menu) => {
                if (menu.id) dispatch(addSelectedMenu(menu));
            });
        }
    }, [isAllSelected, menus, dispatch]);

    const handleToggleMenu = useCallback((menu: Menu) => {
        if (!menu.id) return;
        if (selectedIds.has(menu.id)) {
            dispatch(removeSelectedMenu(menu.id));
        } else {
            dispatch(addSelectedMenu(menu));
        }
    }, [selectedIds, dispatch]);

    const handleEditOrPreview = useCallback((menu: Menu, previewOnly: boolean) => {
        if (!menu.id) return;
        dispatch(clearselectedMenu());
        dispatch(addSelectedMenu(menu));
        dispatch(toggleOnlyPreview(previewOnly));
        dispatch(toggleOpenPreviewModal(true));
    }, [dispatch]);

    const handleDeleteSingle = useCallback((menu: Menu) => {
        if (!menu.id) return;
        dispatch(clearselectedMenu());
        dispatch(addSelectedMenu(menu));
        dispatch(toggleOpenDeleteModal());
    }, [dispatch]);

    if (isFetching) {
        return <div className='flex w-full flex-col justify-center items-center'><Spinner size='lg' /></div>
    }

    if (fetchIsError) {
        return <div className="p-4 text-red-500">Error: Failed to load menu items.</div>;
    }

    if (menus.length === 0) {
        return <div className='flex flex-col justify-center items-center'>
            <span className='text-6xl'><FaBoxOpen /> </span>
            <span className='text-2xl'>No Purchases</span>
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
                            <TableHeadCell>Price</TableHeadCell>
                            <TableHeadCell>Description</TableHeadCell>
                            <TableHeadCell>
                                <span className="sr-only">Actions</span>
                            </TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className="divide-y">
                        {menus.map((menu: Menu) => (
                            menu.id ? (
                                <MenuRow
                                    key={menu.id}
                                    menu={menu}
                                    isSelected={selectedIds.has(menu.id)}
                                    onToggle={handleToggleMenu}
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
