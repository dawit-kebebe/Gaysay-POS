"use client";

import { RootState } from '@/app/store';
import { removeToast, Toast } from '@/app/store/slice/toast.slice';
import { Toast as FlowbiteToast, ToastToggle } from "flowbite-react";
import React, { useEffect } from 'react';
import { HiCheck, HiExclamation, HiX } from "react-icons/hi";
import { useDispatch, useSelector } from 'react-redux';

interface ToastProps {
	message: string;
	type?: "success" | "failure" | "warning";
}

const AUTO_DISMISS_MS = 5000

function UIToast({ message, type = "success" }: ToastProps) {
	return (
		<FlowbiteToast className='dark:bg-gray-700'>
			{
				type === "success" &&
				<div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
					<HiCheck className="h-5 w-5" />
				</div>
			}

			{
				type === "failure" &&
				<div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
					<HiX className="h-5 w-5" />
				</div>
			}

			{
				type === "warning" &&
				<div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200">
					<HiExclamation className="h-5 w-5" />
				</div>
			}
			<div className="mx-3 text-sm font-normal">{message}</div>
			<ToastToggle />
		</FlowbiteToast>
	);
}

const ToastContainer: React.FC = () => {
	const toasts = useSelector((state: RootState) => state.toast.toasts)
	const dispatch = useDispatch()

	useEffect(() => {
		// Create timers for each toast and ensure proper cleanup
		const timers = toasts.map(t =>
			window.setTimeout(() => dispatch(removeToast(t.id)), AUTO_DISMISS_MS)
		);
		return () => timers.forEach(clearTimeout);
	}, [toasts, dispatch])

	return (
		<div className="fixed top-4 right-4 flex flex-col gap-2" style={{ zIndex: 9999 }}>
			{toasts.map((t: Toast) => (
				<UIToast
					key={t.id}
					message={t.message}
					type={t.type}
				/>
			))}
		</div>
	)
}

export default ToastContainer