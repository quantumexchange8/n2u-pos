import Button from "@/Components/Button";
import { BackspaceIcon, BackspaceIcon2, CardIcon, CashIcon } from "@/Components/Outline";
import { DiscountIcon, GuestIcon, MergeIcon, SplitIcon } from "@/Components/PaymentIcon";
import { router } from "@inertiajs/react";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function PaymentMethod({
    order,
    table,
}) {

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [amountCents, setAmountCents] = useState(0);
    const [disabledPaynow, setDisabledPaynow] = useState(true);

    const fetchPaymentMethods = async () => {
        try {
            
            const response = await axios.get('/api/getPaymentMethod');
            setPaymentMethods(response.data);
            setSelectedPayment(response.data[0])
            
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        }
    }

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const buttons = [
        "1","2","3", "RM10",
        "4","5","6", "RM50",
        "7","8","9", "RM100",
        "C","0", "00", <BackspaceIcon2 key="back" />
    ];

    const handleClick = (btn) => {
        if (typeof btn === "string") {
            if (btn.startsWith("RM")) {
                // Add fixed value
                const value = parseInt(btn.replace("RM", ""), 10) * 100;
                setAmountCents((prev) => prev + value);
            } else if (btn === "C") {
                setAmountCents(0);
            } else if (btn === "00") {
                // append 00, but ensure max length
                setAmountCents((prev) => {
                    const next = prev * 100;
                    return next > 99999999 ? prev : next; // optional max cap
                });
            } else {
                // digit input (shift left like calculator)
                const digit = parseInt(btn, 10);
                setAmountCents((prev) => {
                    const next = prev * 10 + digit;
                    return next > 99999999 ? prev : next; // optional max cap
                });
            }
        } else {
            // Backspace → remove last digit
            setAmountCents((prev) => Math.floor(prev / 10));
        }
    };

    const formatAmount = (cents) => (cents / 100).toFixed(2);
    const cash_amount = formatAmount(amountCents);
    const order_total = parseFloat(order.total);

    useEffect(() => {
        if (cash_amount >= order_total) {
            setDisabledPaynow(false);
        } else {
            setDisabledPaynow(true);
        }
    }, [cash_amount, order_total]);

    const payByCash = async () => {
        try {
            
            const response = await axios.post('/api/make-payment', {
                params: {
                    uid: Date.now(),
                    order_id: order.id,
                    order_no: order.order_no,
                    payment_method: selectedPayment.value,
                    pay_amount: cash_amount,
                }
            });

            router.visit(`/payment-success?uuid=${response.data.uuid}&receipt_no=${response.data.payment.receipt_no}`)

        } catch (error) {
            console.error('error payment', error)
        }
    }

    return (
        <div className={` flex flex-col w-full min-h-[80vh]`}>

            <div className="flex flex-row max-h-[85vh]">
                <div className="w-5/6 p-4 flex flex-col gap-4">
                    {
                        selectedPayment?.value === 'cash' && (
                            <div className="flex flex-col gap-4">
                                <div className="p-5 flex justify-between items-center">
                                    <div className="text-neutral-500 text-xs">Amount Tendered (RM)</div>
                                    <div className="text-neutral-700 text-xxl font-bold">{formatAmount(amountCents)}</div>
                                </div>
                                <div className="grid grid-cols-4 gap-3" >
                                    {
                                        buttons.map((btn, i) => (
                                            <button key={i} onClick={() => handleClick(btn)} className="flex items-center justify-center p-8 border border-neutral-100 bg-white shadow-keypad rounded-xl hover:bg-neutral-50" >
                                                {btn}
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        ) 
                    }
                    
                    <div className="flex flex-col gap-10">
                        <div className="w-full">
                            <Button size="lg" className="w-full flex justify-center items-center h-[52px] box-border" disabled={disabledPaynow} onClick={payByCash}>Pay now</Button>
                        </div>
                        {/* others */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="py-4 px-5 border border-neutral-100 rounded-xl flex flex-row gap-4 items-center shadow-keypad">
                                {
                                    order.customer ? (
                                        <>
                                            <div>

                                            </div>
                                            <div className="text-neutral-700 font-bold text-sm">{order.customer.name}</div>
                                        </>
                                    ) : (
                                        <>
                                            <GuestIcon />
                                            <div className="text-neutral-700 font-bold text-sm">Guest</div>
                                        </>
                                    )
                                }
                                
                            </div>
                            <div className="py-4 px-5 border border-neutral-100 rounded-xl flex flex-row gap-4 items-center shadow-keypad">
                                <DiscountIcon />
                                <div className="text-neutral-700 text-sm">Apply Discount</div>
                            </div>
                            <div className="py-4 px-5 border border-neutral-100 rounded-xl flex flex-row gap-4 items-center shadow-keypad">
                                <SplitIcon />
                                <div className="text-neutral-700 text-sm">Split Bill</div>
                            </div>
                            <div className="py-4 px-5 border border-neutral-100 rounded-xl flex flex-row gap-4 items-center shadow-keypad">
                                <MergeIcon />
                                <div className="text-neutral-700 text-sm">Merge Bill</div>
                            </div>
                        </div>
                    </div>
                    
                </div>
                <div className="w-2/6 border-l border-neutral-100 py-4 px-3">
                    {
                        paymentMethods.length > 0 ? (
                            <div className="flex flex-col gap-3">
                                {
                                    paymentMethods.map((method) => (
                                        <div key={method.id} className={`${selectedPayment.value === method.value ? 'bg-neutral-25' : 'bg-white'} py-4 px-5 flex flex-row gap-4 items-center border border-neutral-100  rounded-xl shadow-keypad`}>
                                            {
                                                method.value === 'cash' && (
                                                    <CashIcon />
                                                )
                                            }
                                            {
                                                method.value === 'card' && (
                                                    <CardIcon />
                                                )
                                            }
                                            {
                                                method.value === 'tng' && (
                                                    <></>
                                                )
                                            }
                                            <div className="text-neutral-700 text-sm">{method.name}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        ) : (
                            <div>No Payment Methods</div>
                        )
                    }
                </div>
            </div>

        </div>
    )
}