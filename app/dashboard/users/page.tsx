import React from 'react'

import UserTable from './Table'
import ToolbarActions from './ToolbarActions'
import PreviewModal from './modals/PreviewModal'
import DeleteModal from './modals/DeleteModal'
import CreateModal from './modals/CreateModal'

const UserPage = () => { // Changed export name to UserPage
    return (
        <div className="flex flex-col p-4 md:px-16 sm:p-4 items-center justify-center">
            <CreateModal />
            <PreviewModal />
            <DeleteModal />
            <ToolbarActions />
            <UserTable />
        </div>
    )
}

export default UserPage