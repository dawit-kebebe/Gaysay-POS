"use client";

import { useAppDispatch, useAppSelector } from '@/app/store';
import { useSyncOpenSellsMutation } from '@/app/store/api/open-sells.api';
import { toggleOpenCloseModal, toggleOpenDeleteModal, toggleOpenSellsModal, toggleUnSync } from '@/app/store/slice/open-sells.slice';
// import { toggleOpenSellsModal } from '@/app/store/slice/sells.slice'; // Sells slice actions
import { addToast } from '@/app/store/slice/toast.slice'; // Assuming path to toast slice
import { Breadcrumb, BreadcrumbItem, Button } from 'flowbite-react';
import { useCallback, useEffect } from 'react';
import { FaLock, FaSync } from 'react-icons/fa';
import { FaRegTrashCan } from 'react-icons/fa6';
import { GrAdd } from 'react-icons/gr';
import { MdDashboard } from 'react-icons/md';

const ToolbarActions = () => {
    const dispatch = useAppDispatch();

    const openSells = useAppSelector(state => state.openSells.openSells);
    const unSyncChanges = useAppSelector(state => state.openSells.unSyncChanges);
    const [syncOpenSells, { isLoading: isSyncLoading }] = useSyncOpenSellsMutation();
    // const [closeOpenSells, { isLoading: isCloseLoading, isSuccess: isCloseSuccess, isError: isCloseError, error: closeError, data: closeData }] = useCloseSellsMutation();

    const handleDeleteClick = () => {
        dispatch(toggleOpenDeleteModal());
    };

    const handleCreateClick = () => {
        // Open the Create Modal
        dispatch(toggleOpenSellsModal());
    }

    const handleOnCloseSells = useCallback(async () => {
        if (openSells.length === 0) {
            dispatch(addToast('There are no open sells to close.', 'warning'));
            return;
        }

        dispatch(toggleOpenCloseModal());
    }, [openSells, dispatch]);

    const handleOnSync = useCallback(async () => {
        let anyFailed = false;
        for (const item of openSells) {
            if (item.isSync) continue;
            try {
                await syncOpenSells({ id: item.id, frequency: item.sellsIncrease }).unwrap();
            } catch (err) {
                anyFailed = true;
                console.error('Sync failed for item', item.id, err);
            }
        }

        if (anyFailed) {
            dispatch(addToast('One or more items failed to synchronize.', 'failure'));
            return;
        }

        dispatch(addToast('Your changes have been syncronized successfully.', 'success'));
        dispatch(toggleUnSync({ toggle: false }));
    }, [openSells, syncOpenSells, dispatch]);

    // Leave-page guards: warn user if there are unsynced changes
    useEffect(() => {
        if (!unSyncChanges) return;

        const msg = 'You have unsynchronized changes that may be lost. Do you want to continue?';

        const onBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = msg;
            return msg;
        };

        const onClick = (ev: MouseEvent) => {
            if (ev.button !== 0) return;
            const target = ev.target as HTMLElement | null;
            if (!target) return;
            const anchor = (target.closest && target.closest('a')) as HTMLAnchorElement | null;
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (!href) return;
            if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;
            if (anchor.target === '_blank') return;

            const ok = window.confirm(msg);
            if (!ok) {
                ev.preventDefault();
                ev.stopPropagation();
                return;
            }

            // user confirmed: remove handlers so we don't prompt again and allow navigation
            window.removeEventListener('beforeunload', onBeforeUnload);
            document.removeEventListener('click', onClick, true);
        };

        window.addEventListener('beforeunload', onBeforeUnload);
        document.addEventListener('click', onClick, true);

        return () => {
            window.removeEventListener('beforeunload', onBeforeUnload);
            document.removeEventListener('click', onClick, true);
        };
    }, [unSyncChanges]);

    return (
        <div className="flex w-full flex-col px-4 text-gray-900 dark:text-white">
            <Breadcrumb className='w-full p-4'>
                {/* Replaced generic icons/text with Sells specific ones */}
                <BreadcrumbItem icon={MdDashboard}>Dashboard</BreadcrumbItem>
                <BreadcrumbItem>Income</BreadcrumbItem>
            </Breadcrumb>
            <div className='w-full flex flex-wrap justify-center sm:justify-end gap-2 p-4 '>
                <Button
                    className='w-fit'
                    onClick={handleOnCloseSells}
                    disabled={isSyncLoading}>
                    <FaLock className="sm:mr-3" />
                    <span className='hidden sm:inline'>
                        Close
                    </span>
                </Button>
                <Button
                    className='w-fit disabled:!cursor-not-allowed'
                    onClick={handleOnSync}
                    color='blue'
                    disabled={isSyncLoading || !unSyncChanges}>
                    <FaSync className="sm:mr-3" />
                    <span className='hidden sm:inline'>
                        Sync
                    </span>
                </Button>
                <Button className='w-fit' onClick={handleCreateClick}>
                    <GrAdd className="sm:mr-3" />
                    <span className='hidden sm:inline'>
                        Open Sells
                    </span>
                </Button>
                <Button
                    color="red"
                    onClick={handleDeleteClick}
                >
                    <FaRegTrashCan className="sm:mr-3" />
                    <span className='hidden sm:inline'>
                        Delete
                    </span>
                </Button>
            </div>
        </div>
    );
};

export default ToolbarActions;