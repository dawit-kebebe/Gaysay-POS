import React, { MouseEventHandler } from 'react'

interface IconButtonProps {
    children: React.ReactNode,
    className?: string,
    onClick?: MouseEventHandler<HTMLButtonElement> //(e: MouseEvent) => void,
    ref?: React.RefObject<HTMLButtonElement | null>
}

const IconButton = ({ children, className = '', onClick, ref }: IconButtonProps) => {
    return (
        <button ref={ref} onClick={onClick} className={`flex items-center justify-center grow-0 p-1 md:p-3 rounded-[50%] text-gray-50 transition-colors duration-300 ease-in bg-primary-700 border border-gray-50 hover:bg-gray-50 hover:text-gray-800 hover:border-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:hover:border-gray-50 ${className}`} >
            {children}
        </button >
    )
}

export default IconButton