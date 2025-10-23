"use client"

import Image from 'next/image'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import { Menu } from '../common/types/menu'

const Mesonry = ({ menuItems }: { menuItems: Menu[] }) => {
    return (
        <ResponsiveMasonry
            columnsCountBreakPoints={{ 300: 1, 500: 2, 700: 3, 900: 4 }}
        >
            <Masonry gutter="10px">
                {menuItems.map((menuItem) => {
                    return (
                        <div key={menuItem.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <Image
                                src={menuItem.menuImgUrl || ''}
                                alt={menuItem.name}
                                width={400}
                                height={200}
                                style={{ width: "100%", borderRadius: "15px", objectFit: "contain" }}
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold mb-2">{menuItem.name}</h3>
                                <p className="text-gray-600 mb-4">{menuItem.description}</p>
                                <div className="text-xl font-bold">${menuItem.price.toFixed(2)}</div>
                            </div>
                        </div>
                    );
                })}
            </Masonry>
        </ResponsiveMasonry>
    )
}

export default Mesonry