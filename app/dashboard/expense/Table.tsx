"use client";

import { PurchaseItem } from '@/app/common/types/purchase';
import IconButton from "@/app/components/IconButton";
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useGetOpenPurchasesQuery } from '@/app/store/api/expense.api';
import { addSelectedPurchase, clearSelectedPurchases, removeSelectedPurchase, toggleOpenDeleteModal, toggleOpenPreviewModal } from '@/app/store/slice/expense.slice';
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
    ({ checked, indeterminate, onChange }: { checked: boolean; indeterminate: boolean; onChange: () => void; }) => {
        const ref = useRef<HTMLInputElement>(null);
        useEffect(() => {
            if (ref.current) ref.current.indeterminate = indeterminate;
        }, [indeterminate]);
        return <Checkbox ref={ref} checked={checked} onChange={() => onChange()} />;
    }
);
HeaderCheckbox.displayName = 'HeaderCheckbox';


const PurchaseRow = memo(({ item, isSelected, onToggle, onPreview, onDelete }: {
    item: PurchaseItem;
    isSelected: boolean;
    onToggle: (item: PurchaseItem) => void;
    onPreview: (item: PurchaseItem) => void;
    onDelete: (item: PurchaseItem) => void;
}) => {
    const formattedPrice = useMemo(() => `$${(item.unitPrice ?? 0).toFixed(2)}`, [item.unitPrice]);

    const handlePreview = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onPreview(item);
    }, [item, onPreview]);

    const handleDelete = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete(item);
    }, [item, onDelete]);

    return (
        <TableRow key={item.id} onClick={() => onToggle(item)} className={`bg-white dark:border-gray-700 dark:bg-gray-800 cursor-pointer ${isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
            <TableCell className='p-4 w-4'>
                <Checkbox checked={isSelected} onChange={() => onToggle(item)} />
            </TableCell>
            <TableCell className="font-medium text-gray-900 dark:text-white">{item.name}</TableCell>
            <TableCell>{formattedPrice}</TableCell>
            <TableCell className='max-w-xs truncate'>{item.description || 'No description'}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <IconButton onClick={handlePreview}><FiEye /></IconButton>
                    <IconButton onClick={handleDelete}><FaRegTrashCan /></IconButton>
                </div>
            </TableCell>
        </TableRow>
    );
});
PurchaseRow.displayName = 'PurchaseRow';


export function ExpenseTable() {
    const dispatch = useAppDispatch();

    // Fetch purchases
    const { data: purchases = [], isLoading: isFetching, isError: fetchIsError } = useGetOpenPurchasesQuery();

    const selectedPurchases = useAppSelector((state) => state.expense.selectedPurchases);


    // Memoized selection logic
    const selectedIds = useMemo(() => new Set(selectedPurchases.map((m: PurchaseItem) => m.id)), [selectedPurchases]);
    const isAllSelected = useMemo(() => purchases.length > 0 && selectedPurchases.length === purchases.length, [purchases.length, selectedPurchases.length]);
    const isIndeterminate = useMemo(() => selectedPurchases.length > 0 && selectedPurchases.length < purchases.length, [purchases.length, selectedPurchases.length]);


    // Handlers
    const handleToggleAll = useCallback(() => {
        if (isAllSelected) {
            dispatch(clearSelectedPurchases());
        } else {
            purchases.forEach((p: PurchaseItem) => { if (p.id) dispatch(addSelectedPurchase(p)); });
        }
    }, [isAllSelected, purchases, dispatch]);

    const handleTogglePurchase = useCallback((item: PurchaseItem) => {
        if (!item.id) return;
        if (selectedIds.has(item.id)) dispatch(removeSelectedPurchase(item.id));
        else dispatch(addSelectedPurchase(item));
    }, [selectedIds, dispatch]);

    const handlePreview = useCallback((item: PurchaseItem) => {
        if (!item.id) return;
        dispatch(clearSelectedPurchases());
        dispatch(addSelectedPurchase(item));
        dispatch(toggleOpenPreviewModal())
    }, [dispatch]);

    const handleDeleteSingle = useCallback((item: PurchaseItem) => {
        if (!item.id) return;
        dispatch(clearSelectedPurchases());
        dispatch(addSelectedPurchase(item));
        dispatch(toggleOpenDeleteModal());
    }, [dispatch]);


    // Conditional rendering for loading and empty states
    if (isFetching) {
        // return <LoadingSpinner />;
        return <Spinner />
    }

    if (fetchIsError) {
        // NOTE: An HTTPStatusToast component was referenced in the original snippet. 
        // We'll return a simple error message for now.
        return <div className="p-4 text-red-500">Error: Failed to load menu items.</div>;
    }

    if (purchases.length === 0) {
        return <div className='flex flex-col justify-center items-center'>
            <span className='text-6xl'><FaBoxOpen /> </span>
            <span className='text-2xl'>No Purchases</span>
        </div>
    }

    // Render the table
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
                            {/* <TableHeadCell>Photo</TableHeadCell> */}
                            <TableHeadCell>Name</TableHeadCell>
                            <TableHeadCell>Price</TableHeadCell>
                            <TableHeadCell>Description</TableHeadCell>
                            <TableHeadCell>Quantity</TableHeadCell>
                            <TableHeadCell>
                                <span className="sr-only">Actions</span>
                            </TableHeadCell>
                        </TableRow>
                    </TableHead>
                    <TableBody className="divide-y">
                        {purchases.map((p: PurchaseItem) => (
                            p.id ? (
                                <PurchaseRow
                                    key={p.id}
                                    item={p}
                                    isSelected={selectedIds.has(p.id)}
                                    onToggle={handleTogglePurchase}
                                    onPreview={handlePreview}
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