import React from 'react'
import { ExpenseTable } from './Table'
import ToolbarActions from './ToolbarActions'
import PreviewModal from './modals/PreviewModal'
import DeleteModal from './modals/DeleteModal'
import CreateModal from './modals/CreateModal'
import ClosePurchaseModal from './modals/ClosePurchaseModal'

const ExpensePage = () => {
    return (
        <div className="flex flex-col p-4 md:px-16 sm:p-4 items-center justify-center">
            <CreateModal />
            <ClosePurchaseModal />
            <PreviewModal />
            <DeleteModal />
            <ToolbarActions />
            <ExpenseTable />
        </div>
    )
}

export default ExpensePage