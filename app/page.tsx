import { FaBoxOpen } from 'react-icons/fa6';
import connectToDatabase from './common/database';
import MenuModel from './common/database/models/Menu';
import { Menu } from './common/types/menu';
import Mesonry from './components/Mesonry';
import { NavBar } from './components/navbar';

const MainPage = async () => {
    const menuItems = [] as Menu[];

    try {
        await connectToDatabase();

        const menu = await MenuModel.find({}).exec();
        menuItems.push(...menu.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            catagory: item.catagory,
            price: item.price,
            menuImgUrl: item.menuImgUrl,
        })));

    } catch (err) {
        console.error('Database connection error:', err);
        return (
            <div className='flex flex-col justify-center items-center p-8'>
                <span className='text-6xl text-gray-400'><FaBoxOpen /> </span>
                <span className='text-xl mt-2'>No Menu Item Found.</span>
            </div>
        );
    }

    return (
        <>
            <NavBar
                navbarLinks={[]}
                user={undefined}
            />
            <div className="p-4 md:px-16 sm:p-4">
                <Mesonry menuItems={menuItems} />
            </div>
        </>
    )
}

export const revalidate = 3600;
export default MainPage