import Button from "@/Components/Button";
import { BackIcon, DeleteIcon, SearchIcon } from "@/Components/Outline";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useState } from "react";
import AllProduct from "./Partials/AllProduct";
import { useForm } from "@inertiajs/react";
import { formatAmount } from "@/Composables";

export default function Order({ table }) {

    const returnBack = () => {
        window.location.href = `/dashboard`;
    }

    const [selectedProduct, setSelectedProduct] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        products: [],
        total_amount: '',
    });

    const totalBill = data.products.reduce((sum, product) => {
        return sum + parseFloat(product.total_price || 0);
    }, 0);

    const findExistingProd = (id) => {
        const existingProd = data.products.find((p) => p.id === id);

        setSelectedProduct(existingProd);
    }

    return (
        <div className="w-full flex flex-row min-h-screen">
            <div className="w-1/3 flex flex-col min-h-screen border-r border-neutral-100 bg-white">
                <div className="py-5 px-4 flex flex-row gap-5 items-center border-b border-neutral-100 sticky top-0 bg-white">
                    <div className="text-neutral-800 text-lg font-bold w-full">New Order</div>
                    <div className="flex items-center gap-3">
                        <Button variant="white" size="md" iconOnly pill>
                            <DeleteIcon className='w-4 h-4' />
                        </Button>
                        <div></div>
                    </div>
                </div>
                <div className="flex flex-col justify-between min-h-[96vh]">
                    {
                        data.products && data.products.length > 0 ? (
                            <div className="flex flex-col">
                                {
                                    data.products.map((prod, i) => (
                                        <div key={i} className={`${selectedProduct?.id === prod.id ? "bg-primary-25" : "bg-white"} p-4 flex gap-4 border-b border-neutral-50 `} onClick={() => findExistingProd(prod.id)} >
                                            <div className="w-10 h-10 flex items-center justify-center p-2 border border-primary-200 shadow-input rounded-xl text-primary-500 text-sm font-bold">{prod.quantity}</div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="text-neutral-800 text-sm font-bold">{prod.item_code} - {prod.name}</div>
                                                    <div>RM {prod.prices}</div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {
                                                        (prod.product_modifier && prod.product_modifier.length > 0) && (
                                                            <>
                                                                {
                                                                    prod.product_modifier.map((prodModifier) => (
                                                                        <div key={prodModifier.id}>
                                                                            {
                                                                                prodModifier.product_item_ids.length > 0 && (
                                                                                    <>
                                                                                        <div className="text-xs font-semibold text-neutral-600">{prodModifier.name}</div>
                                                                                        {
                                                                                            prodModifier.product_item_ids.map((item) => (
                                                                                                <div key={item.id} className="" >
                                                                                                    <div className="pl-2 flex items-center gap-1">
                                                                                                        <span className="text-xs">- {item.modifier_name}</span>
                                                                                                        <span className="text-xs text-primary-500">(+ RM{formatAmount(item.modifier_price)})</span>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))
                                                                                        }
                                                                                    </>
                                                                                )
                                                                            }
                                                                        </div>
                                                                    ))
                                                                }
                                                            </>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        ) : (
                            <div></div>
                        )
                    }

                    <div className="sticky bottom-0 flex flex-col bg-white/80 py-3">
                        <div className="py-2 px-4 flex justify-between w-full">
                            <div className="text-neutral-900 text-lg">Total </div>
                            <div className="text-neutral-900 text-lg font-bold">RM {formatAmount(totalBill)}</div>
                        </div>
                        <div className="py-2 px-4 flex gap-3 items-center">
                            <Button variant="secondary" size="md" className="w-full flex justify-center">Go to Pay</Button>
                            <Button size="md" className="w-full flex justify-center">Place Order</Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-2/3 flex flex-col min-h-screen">
                <div className="py-5 px-4 flex items-center gap-5 border-b border-neutral-100 sticky top-0 z-20 bg-white">
                    <div className="flex flex-col w-full">
                        <div className="text-neutral-900 text-lg font-bold">{table.table_name}</div>
                        <div className=" uppercase text-xs text-neutral-400">pax: {table.pax}</div>
                    </div>
                    <div className="flex gap-3 items-center">
                        <Button size="sm" variant="white" className="h-11 box-border">Release</Button>
                        <Button size="sm" variant="black" className="text-nowrap text-sm h-11 box-border flex items-center gap-2" onClick={returnBack}><BackIcon /> Go Back</Button>
                    </div>
                </div>
                
                {
                    !selectedProduct && (
                        <div className="p-4 flex items-center gap-4 bg-white border-b border-neutral-100 sticky top-0 z-10">
                            <div>
                                <SearchIcon />
                            </div>
                            <div className="w-full">
                                <input type="text" placeholder="Search..." className="border-none focus:ring-0 text-neutral-900 text-sm font-medium w-full" />
                            </div>
                        </div>
                    )
                }

                <AllProduct 
                    data={data} 
                    setData={setData} 
                    errors={errors} 
                    selectedProduct={selectedProduct}
                    setSelectedProduct={setSelectedProduct}
                />
            </div>
        </div>
    )
}