import { NavBarLink } from "@/app/common/types/navbar";
import { User } from "@/app/common/types/user";
import GaysayLogo from "@/app/components/icons/GaysayLogo";
import {
    Avatar,
    DarkThemeToggle,
    Dropdown,
    DropdownDivider,
    DropdownHeader,
    DropdownItem,
    Navbar,
    NavbarBrand,
    NavbarCollapse,
    NavbarLink,
    NavbarToggle,
} from "flowbite-react";
import { FaUser } from "react-icons/fa";
import Logout from "./logout";

interface NavBarProps {
    navbarLinks?: Array<NavBarLink>;
    user?: User;
}

export function NavBar({ navbarLinks, user }: NavBarProps) {
    return (
        <Navbar fluid rounded className="my-2 shadow-md">
            <NavbarBrand href="#">
                <GaysayLogo className="w-fit mr-3 h-6 sm:h-9 text-primary-800 dark:text-primary-600" />
            </NavbarBrand>
            {user ? (
                <>
                    <div className="flex gap-2 md:order-2">
                        <DarkThemeToggle className="hidden md:flex" />
                        <Dropdown
                            arrowIcon={false}
                            inline
                            label={
                                (user.avatarUrl && <Avatar alt="User settings" img={user.avatarUrl} rounded />) || (
                                    <FaUser className="text-gray-500 dark:text-gray-400" />
                                )
                            }
                        >
                            <DropdownHeader>
                                <span className="block text-sm text-center">{user.name}</span>
                                <DropdownDivider />
                                <span className="block truncate text-sm font-medium text-center">@{user.username}</span>
                                <DropdownDivider />
                                <span className="block truncate text-sm font-medium text-center">{user.role}</span>
                            </DropdownHeader>
                            <DropdownDivider />
                            <DropdownItem>
                                <Logout />
                            </DropdownItem>
                        </Dropdown>
                        <NavbarToggle />
                    </div>
                    <NavbarCollapse>
                        {navbarLinks?.map((link, index) => (
                            <NavbarLink
                                href={link.href}
                                aria-label={link.label}
                                key={`${link.label.replace(/\s+/g, "-").toLowerCase()}-${index}`}
                            >
                                {link.label}
                            </NavbarLink>
                        ))}
                        <span className="flex md:hidden justify-center gap-2 px-4 py-2">
                            <DarkThemeToggle className="w-full flex justify-center bg-primary-100 dark:bg-primary-950" />
                        </span>
                    </NavbarCollapse>
                </>
            ) : null}
        </Navbar>
    );
}
