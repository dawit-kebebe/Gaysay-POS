import { Tab } from './Tab';
import ReportToolbarActions from './ToolbarActions'; // Use the new component

const ReportPage = () => {

    return (
        <div className="flex flex-col p-4 md:px-16 sm:p-4 items-center justify-center">
            <ReportToolbarActions />
            <Tab />
        </div>
    )
}

export default ReportPage;
