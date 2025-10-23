import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow, TextInput } from "flowbite-react";
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FaLock, FaLockOpen } from "react-icons/fa6";
import { MdDone } from "react-icons/md";
import { OpenSells } from "../common/types/sells";
import { formatEthDate } from "../common/util/date-conv";

interface SellsCardProps extends Omit<OpenSells, 'unitsSold' | 'updatedAt'> {
    isSync: boolean;
    isClosed: boolean;
    unitsSold: number;
    sellsIncrease: number;
    onAdd?: (frequency: number) => void;
}

export function SellsCard({
    id,
    itemId: menu,
    unitsSold,
    sellsIncrease,
    isClosed,
    isSync,
    createdAt,
    onAdd,
}: SellsCardProps) {
    const [increaseBy, setIncreaseBy] = useState<number>(1);
    const increaseByRef = useRef<HTMLInputElement | null>(null);

    const ethDate = useMemo(() => formatEthDate(createdAt), [createdAt]);

    const handleOnAdd = useCallback(() => {
        if (!onAdd) return;
        const by = Number.isFinite(Number(increaseBy)) && (sellsIncrease + increaseBy) >= 0 ? increaseBy : 0;
        onAdd(by);
        setIncreaseBy(1);
    }, [onAdd, increaseBy, sellsIncrease]);

    return (
        <Card
            className="max-w-sm relative self-start"
            imgAlt={menu.description}
            imgSrc={menu.menuImgUrl}
            id={id}
        >
            <div className="flex gap-2">
                <div className="w-full flex-1">
                    <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {menu.name}
                    </h5>
                    <p className="font-normal text-gray-700 dark:text-gray-400">
                        {menu.description}
                    </p>
                </div>
                <div className="flex items-center">
                    <span className={`text-2xl font-semibold ${isSync ? 'text-green-800 dark:text-green-600' : 'text-red-800 dark:text-red-600 '}`}>
                        {isSync ? <MdDone /> : (<>&times; {sellsIncrease}</>)}
                    </span>
                </div>
            </div>
            <Table className="text-lg">
                <TableHead>
                    <TableRow>
                        <TableHeadCell>Unit Price</TableHeadCell>
                        <TableHeadCell>Sold</TableHeadCell>
                        <TableHeadCell>Total Price</TableHeadCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            {menu.price}
                        </TableCell>
                        <TableCell>
                            {unitsSold}
                        </TableCell>
                        <TableCell>
                            {unitsSold * menu.price}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <hr className="text-gray-400 dark:text-gray-500" />
            <div className="flex flex-nowrap justify-between gap-2">
                <TextInput
                    type="number"
                    className="w-full"
                    value={increaseBy}
                    ref={increaseByRef}
                    onChange={(e) => {
                        const val = e.target.value;
                        const incBy = (val !== '') ? parseInt(val, 10) : 1;
                        if (!Number.isNaN(incBy)) {
                            setIncreaseBy(incBy);
                        }
                    }}
                    placeholder="Units Sold"
                />
                <Button className="w-fit" onClick={handleOnAdd}>&#43;</Button>
            </div>
            <div className="flex flex-nowrap px-4 py-2 items-center rounded-lg absolute top-1 left-1 gap-2 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                {isClosed ? <FaLock className="text-primary-600 dark:text-primary-400" /> : <FaLockOpen className="text-green-800 dark:text-green-400" />}
                <span>{ethDate}</span>
            </div>
        </Card>
    );
}

export default React.memo(SellsCard);
