import Button from "@/Components/Button";
import { DeleteIcon } from "@/Components/Outline";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React from "react";

export default function Order({ table }) {

    return (
        <div className="w-full flex flex-row min-h-screen">
            <div className="w-1/3 flex flex-col justify-between min-h-screen border-r border-neutral-100 bg-white">
                <div className="py-5 px-4 flex flex-row gap-5 items-center border-b border-neutral-100">
                    <div className="text-neutral-800 text-lg font-bold w-full">New Order</div>
                    <div className="flex items-center gap-3">
                        <Button variant="white" size="md" iconOnly pill>
                            <DeleteIcon className='w-4 h-4' />
                        </Button>
                        <div></div>
                    </div>
                </div>


                <div className="sticky bottom-0 flex flex-col bg-white/80 py-3">
                    <div className="py-2 px-4 flex justify-between w-full">
                        <div className="text-neutral-900 text-lg">Total (Incl. Tax)</div>
                        <div className="text-neutral-900 text-lg font-bold">RM 0.00</div>
                    </div>
                    <div className="py-2 px-4 flex gap-3 items-center">
                        <Button variant="secondary" size="md" className="w-full flex justify-center">Go to Pay</Button>
                        <Button size="md" className="w-full flex justify-center">Place Order</Button>
                    </div>
                </div>
            </div>
            <div className="w-2/3 flex flex-col">
                <div className="py-5 px-4 flex items-center gap-5 border-b border-neutral-100">
                    <div className="flex flex-col w-full">
                        <div className="text-neutral-900 text-lg font-bold">{table.table_name}</div>
                        <div className=" uppercase text-xs text-neutral-400">pax: {table.pax}</div>
                    </div>
                    <div className="flex gap-3 items-center">
                        <Button size="sm" variant="white" className="h-11 box-border">Release</Button>
                        <Button size="sm" variant="black" className="text-nowrap h-11 box-border">Go Back</Button>
                    </div>
                </div>
                <div></div>
            </div>
        </div>
    )
}