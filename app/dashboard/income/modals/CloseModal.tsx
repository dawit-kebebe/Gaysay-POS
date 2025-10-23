"use client";

import { formatEthDate } from '@/app/common/util/date-conv';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useCloseSellsMutation } from '@/app/store/api/open-sells.api';
import { toggleOpenCloseModal } from '@/app/store/slice/open-sells.slice';
import { addToast } from '@/app/store/slice/toast.slice';
import { Button, Checkbox, Modal, ModalBody, ModalHeader, Spinner, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react';
import { useCallback, useMemo, useState } from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const CloseModal = () => {
    const dispatch = useAppDispatch();

    const openSells = useAppSelector((state) => state.openSells.openSells);
    const openCloseModal = useAppSelector((state) => state.openSells.openCloseModal);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const [closeOpenSells, { isLoading: isClosing }] = useCloseSellsMutation();

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }, []);

    const allSelected = useMemo(() => openSells.length > 0 && selectedIds.length === openSells.length, [openSells, selectedIds]);

    const toggleSelectAll = useCallback(() => {
        if (allSelected) return setSelectedIds([]);
        setSelectedIds(openSells.map(s => s.id));
    }, [allSelected, openSells]);

    const handleOnClose = useCallback(async () => {
        if (selectedIds.length === 0) {
            dispatch(addToast('No items selected.', 'warning'));
            return;
        }

        // Exclude any selected items that are not synced (isSync === false)
        const syncedSelectedIds = selectedIds.filter(id => {
            const s = openSells.find(x => x.id === id);
            return s?.isSync !== false;
        });

        const excludedCount = selectedIds.length - syncedSelectedIds.length;
        if (excludedCount > 0) {
            dispatch(addToast(`${excludedCount} item${excludedCount > 1 ? 's are' : ' is'} not synced.`, 'warning'));
            return;
        }

        if (syncedSelectedIds.length === 0) return;

        const promises = syncedSelectedIds.map(id => closeOpenSells({ id }));
        const results = await Promise.all(promises);

        let hasError = false;
        let successCount = 0;

        results.forEach(res => {
            if ('error' in res && res.error) {
                hasError = true;
            } else if ('data' in res && res.data) {
                successCount++;
            }
        });

        if (hasError) dispatch(addToast('One or more items failed to close.', 'failure'));
        if (successCount > 0) dispatch(addToast(`${successCount} item${successCount > 1 ? 's' : ''} closed.`, 'success'));

        setSelectedIds([]);
        dispatch(toggleOpenCloseModal());
    }, [selectedIds, closeOpenSells, dispatch, openSells]);

    return (
        <Modal show={openCloseModal} size="2xl" onClose={() => dispatch(toggleOpenCloseModal())} popup>
            <ModalHeader />
            <ModalBody>
                <div className="text-center">
                    <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                    <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                        {selectedIds.length === 1
                            ? `Close 1 selected open sells?`
                            : `Close ${selectedIds.length} selected open sells?`
                        }
                    </h3>

                    <div className="overflow-x-auto mb-4 p-2 border dark:border-gray-800 rounded-md">
                        <Table className='min-w-full' striped>
                            <TableHead>
                                <TableRow>
                                    <TableHeadCell className='p-2 w-4'>
                                        <Checkbox checked={allSelected} onChange={toggleSelectAll} />
                                    </TableHeadCell>
                                    <TableHeadCell>Item</TableHeadCell>
                                    <TableHeadCell>Units Sold</TableHeadCell>
                                    <TableHeadCell>Created</TableHeadCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {openSells.map(s => (
                                    <TableRow key={s.id} className='cursor-pointer'>
                                        <TableCell className='p-2'>
                                            <Checkbox checked={selectedIds.includes(s.id)} onChange={() => toggleSelect(s.id)} />
                                        </TableCell>
                                        <TableCell>{s.itemId?.name ?? s.itemId ?? 'Unknown'}</TableCell>
                                        <TableCell>{s.totalFreq ?? 0}</TableCell>
                                        <TableCell>{s.createdAt ? formatEthDate(s.createdAt) : '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-center gap-4">
                        <Button color="blue" onClick={handleOnClose} disabled={isClosing}>
                            {isClosing ? <Spinner size='sm' /> : 'Close selected'}
                        </Button>
                        <Button color="alternative" onClick={() => { setSelectedIds([]); dispatch(toggleOpenCloseModal()); }} disabled={isClosing}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default CloseModal;
