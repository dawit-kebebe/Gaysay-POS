import { FaBoxOpen } from 'react-icons/fa6';
import connectToDatabase from './common/database';
import MenuModel from './common/database/models/Menu';
import { Menu } from './common/types/menu';
import Mesonry from './components/Mesonry';
import { NavBar } from './components/navbar';
import { TabItem, Tabs } from 'flowbite-react';

const MainPage = async () => {
    const allItems = [] as Menu[];
    const foodItems = [] as Menu[];
    const hotItems = [] as Menu[];
    const coldItems = [] as Menu[];

    try {
        await connectToDatabase();

        const menu = await MenuModel.find({}).exec();
        allItems.push(...menu.map((item) => {
            const mapped = {
                id: item.id,
                name: item.name,
                description: item.description,
                catagory: item.catagory,
                price: item.price,
                menuImgUrl: item.menuImgUrl,
            };

            if (item.catagory === 'Food') {
                foodItems.push(mapped)
            } else if (item.catagory === 'Cold Drink') {
                coldItems.push(mapped);
            } else if (item.catagory === 'Hot Drink') {
                hotItems.push(mapped);
            }

            return mapped
        }));

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
            <div className="overflow-x-auto">
                <Tabs aria-label="Full width tabs" variant="fullWidth">
                    <TabItem active title="All">
                        <div className="p-4 md:px-16 sm:p-4">
                            <Mesonry menuItems={allItems} />
                        </div>
                    </TabItem>
                    <TabItem title="Food">
                        <div className="p-4 md:px-16 sm:p-4">
                            <Mesonry menuItems={foodItems} />
                        </div>
                    </TabItem>
                    <TabItem title="Hot Drink">
                        <div className="p-4 md:px-16 sm:p-4">
                            <Mesonry menuItems={hotItems} />
                        </div>
                    </TabItem>
                    <TabItem title="Cold Drink">
                        <div className="p-4 md:px-16 sm:p-4">
                            <Mesonry menuItems={coldItems} />
                        </div>
                    </TabItem>
                </Tabs>
            </div >

        </>
    )
}

export default MainPage