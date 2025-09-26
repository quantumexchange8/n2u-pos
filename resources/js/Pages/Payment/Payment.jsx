import Button from "@/Components/Button";
import { CustomToaster } from "@/Components/CustomToaster";
import { PrintIcon, SearchIcon } from "@/Components/Outline";
import { formatAmount } from "@/Composables";
import React, { useEffect, useState } from "react";
import PaymentMethod from "./Partials/PaymentMethod";
import axios from "axios";
import { router } from "@inertiajs/react";

export default function Payment({ order, table}) {

    const [orderItems, setGetOrderItems] = useState([]);

    const totalBill = 0;

    const cancelPayment = () => {
        router.visit('/order?table_id=' + table.table_id + '&table_layout_id=' + table.table_layout_id);
    }

    const fetchOrderItem = async () => {
        try {
            
            const response = await axios.get('/api/getOrderItems', {
                params: order
            });

            setGetOrderItems(response.data)

        } catch (error) {
            console.error('error', error);
        }
    }

    useEffect(() => {
        fetchOrderItem();
    }, []);

    return (
        <div className="w-full flex flex-row min-h-screen">
            <CustomToaster />

            <div className="w-1/3 flex flex-col min-h-screen border-r border-neutral-100 bg-white">
                <div className="py-7 px-4 flex flex-row gap-5 items-center border-b border-neutral-100 sticky top-0 bg-white">
                    <div className="w-full flex flex-col">
                        <div className="text-neutral-800 text-lg font-bold">Bill {order ? order.order_no : ''}</div>
                    </div>
                </div>
                <div className="flex flex-col justify-between max-h-[95vh] min-h-[90vh]">
                    {/* order history details */}
                    {
                        orderItems.length > 0 ? (
                            <div className="flex flex-col max-h-[80vh] overflow-auto ">
                                {
                                    orderItems.map((item) => (
                                        <div key={item.id} className={`p-4 flex  gap-4 border-b border-neutral-50`} >
                                            <div className="flex flex-col gap-1 w-full">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="text-neutral-800 text-sm font-bold"><span className="pr-1">{item.qty}x</span> {item.product.item_code} - {item.product.name}</div>
                                                    <div className="text-sm font-bold">RM {item.total_price}</div>
                                                </div>
                                                <div className="flex flex-col gap-1 pl-5">
                                                    {
                                                        item.order_item_modifier.map((itemModifier) => (
                                                            <div key={itemModifier.id}>
                                                                <div className="text-xs font-semibold text-neutral-600">{itemModifier.name}</div>
                                                                <div className="pl-2 flex items-center gap-1">
                                                                    <span className="text-xs">- {itemModifier.modifier_name}</span>
                                                                    <span className="text-xs text-primary-500">(+ RM{formatAmount(itemModifier.modifier_price)})</span>
                                                                </div>
                                                            </div>
                                                        ))
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
                    <div className="flex flex-col"></div>

                    <div className="sticky bottom-0 flex flex-col bg-white/80 py-3">
                        <div className="p-4 flex flex-col gap-1">
                            <div className="flex items-center justify-between ">
                                <div className="text-sm text-neutral-900">Subtotal</div>
                                <div className="text-neutral-900 text-sm font-bold">RM {order.subtotal}</div>
                            </div>
                            <div className="flex items-center justify-between ">
                                <div className="text-sm text-neutral-900">SST ({order.tax_rate}%)</div>
                                <div className="text-neutral-900 text-sm font-bold">RM {order.tax}</div>
                            </div>
                            {
                                order.service_charge !== '0.00' && (
                                    <div className="flex items-center justify-between ">
                                        <div className="text-sm text-neutral-900">Service Charge ({order.service_rate})</div>
                                        <div className="text-neutral-900 text-sm font-bold">RM {order.service_charge}</div>
                                    </div>
                                )
                            }
                            <div className="flex items-center justify-between ">
                                <div className="text-sm text-neutral-900">Rounding</div>
                                <div className="text-neutral-900 text-sm font-bold">RM {order.rounding}</div>
                            </div>
                        </div>
                        <div className="py-2 px-4 flex justify-between w-full">
                            <div className="text-neutral-900 text-lg font-bold">Total </div>
                            <div className="text-neutral-900 text-lg font-bold">RM {formatAmount(order.total)}</div>
                        </div>
                        <div className="py-2 px-4 flex flex-col gap-3 items-center">
                            <Button variant="white" size="md" className="w-full flex gap-1 justify-center" ><PrintIcon /> <span>Print</span></Button>
                            <Button variant="secondary" size="md" className="w-full flex justify-center" onClick={cancelPayment} >Cancel Payment</Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-2/3 flex flex-col overflow-auto">
                <div className="py-5 px-4 flex items-center gap-5 border-b border-neutral-100 sticky top-0 z-20 bg-white">
                    <div className="flex flex-col w-full">
                        <div className="text-neutral-900 text-lg font-bold">{table.table_name}</div>
                        <div className=" uppercase text-xs text-neutral-400">pax: {order.pax}</div>
                    </div>
                </div>

                <PaymentMethod order={order} table={table} />
            </div>
        </div>
    )
}