const MenuItemCatagory = {
    COLD_DRINK: 'Cold Drink',
    HOT_DRINK: 'Hot Drink',
    FOOD: 'Food',
} as const;

type MenuItemCatagoryType = typeof MenuItemCatagory[keyof typeof MenuItemCatagory];

interface Menu {
    id?: string;
    menuImgUrl?: string;
    name: string;
    catagory: MenuItemCatagoryType;
    price: number;
    description?: string;
}

type CreateMenuPayload = Omit<Menu, 'id'>;

type UpdateMenuPayload = Menu & { id: string };

export type { Menu, CreateMenuPayload, UpdateMenuPayload, MenuItemCatagoryType };
export { MenuItemCatagory }