"use client";

import { SellsCard } from '@/app/components/SellsCard';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { useGetOpenSellsQuery } from '@/app/store/api/open-sells.api';
import { increaseFreqOnSells, setOpenSells } from '@/app/store/slice/open-sells.slice';
import { Spinner } from 'flowbite-react';
import { FaBoxOpen } from 'react-icons/fa6';
import useDeepCompareEffect from 'use-deep-compare-effect';

const Table = () => {
    const dispatch = useAppDispatch();
    const { data: res = [], isLoading: isFetching } = useGetOpenSellsQuery();

    const openSells = useAppSelector(state => state.openSells);

    useDeepCompareEffect(() => {
        dispatch(setOpenSells(res));
    }, [dispatch, res]);

    return (
        <div className="flex flex-wrap gap-8 px-2 sm:px-4">
            {
                isFetching ? <div className='flex w-full flex-col justify-center items-center'><Spinner size='lg' /></div> :
                    (openSells.openSells.length === 0) ? <div className='flex flex-col w-full justify-center items-center'><span className='text-6xl'><FaBoxOpen /></span><span className='text-2xl'>No Open Sells</span></div> : openSells.openSells.map((item, index) => {
                        return (
                            <SellsCard
                                id={item.id}
                                itemId={item.itemId}
                                unitsSold={item.totalFreq || 0}
                                sellsIncrease={item.sellsIncrease}
                                onAdd={(freq: number) => {
                                    dispatch(increaseFreqOnSells({ openSellsId: item.id, frequency: freq }))
                                }}
                                isSync={item.isSync!}
                                isClosed={item.isClosed}
                                createdAt={item.createdAt}
                                key={index}
                            />
                        )
                    })
            }
        </div>
    )
}

export default Table