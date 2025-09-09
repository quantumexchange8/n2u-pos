import Button from "@/Components/Button";
import { BillLisingIcon, DashboardIcon, IventoryIcon, ReservationIcon, ReturnIcon, ShiftManagementIcon } from "@/Components/Outline";
import { Link, useForm, usePage } from "@inertiajs/react";
import React from "react";

export default function Sidebar() {

    const { url } = usePage();

    const { data, setData, post, processing, reset } = useForm({});

    const logout = () => {
        post(route('logout'));
    }

    return (
        <aside
            className={`
                fixed inset-y-0 z-30 max-w-60 bg-gray-25 overflow-hidden
                shadow-container min-h-screen bg-neutral-800
                scrollbar-thin scrollbar-webkit
                transition-all duration-300 ease-in-out
            `}
        >
            <nav className="flex flex-col justify-between gap-5 shadow-container min-h-screen bg-white py-5 px-4">
                <div className="flex flex-col gap-4">
                    <div className="p-2">
                        <img src="assets/images/logo.png" alt="logo.png" className="w-10 h-10" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <Link href={route('dashboard')} className={`${
                            url === '/dashboard' ? 'w-full text-secondary-700 font-semibold' : 'text-white'
                        }`}>
                            <div className={`${url === '/dashboard' ? 'bg-primary-500 shadow-sidebar' : 'bg-white hover:bg-neutral-25'} p-4 rounded-xl flex items-center justify-center cursor-pointer`}>
                                <DashboardIcon />
                            </div>
                        </Link>
                        <div className={`p-4 rounded-xl flex items-center justify-center hover:bg-neutral-25 cursor-pointer`}>
                            <BillLisingIcon />
                        </div>
                        <div className={`p-4 rounded-xl flex items-center justify-center hover:bg-neutral-25 cursor-pointer`}>
                            <ShiftManagementIcon />
                        </div>
                        <div className={`p-4 rounded-xl flex items-center justify-center hover:bg-neutral-25 cursor-pointer`}>
                            <ReservationIcon />
                        </div>
                        <div className={`p-4 rounded-xl flex items-center justify-center hover:bg-neutral-25 cursor-pointer`}>
                            <IventoryIcon />
                        </div>
                    </div>
                </div>
                <div>
                    <Button variant="white" size="md" onClick={logout}>
                        <ReturnIcon />
                    </Button>
                </div>
            </nav>
        </aside>
    )
}