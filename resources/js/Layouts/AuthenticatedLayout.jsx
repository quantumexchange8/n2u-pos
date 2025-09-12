import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-white">
            <Sidebar />
            <div className={`min-h-screen flex flex-col ml-[88px]`}>
                <Navbar header={header} user={user} showingNavigationDropdown={showingNavigationDropdown} />
                <main className='w-full flex justify-center'>{children}</main>
            </div>
        </div>
    );
}
