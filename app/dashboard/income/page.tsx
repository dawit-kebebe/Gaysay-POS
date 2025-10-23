import CloseModal from "./modals/CloseModal";
import DeleteModal from "./modals/DeleteModal";
import OpenSellsModal from "./modals/OpenSellsModal";
import Table from "./Table";
import ToolbarActions from "./ToolbarActions";

const IncomePage = () => {
    return (
        <div className='flex flex-col w-full h-full p-4 md:px-16 sm:p-4 overflow-y-auto'>
            <OpenSellsModal />
            <DeleteModal />
            <CloseModal />
            <ToolbarActions />
            <Table />
        </div>
    )
}

export default IncomePage