import { Player } from "@lottiefiles/react-lottie-player";
import React from "react";
import successAnimate from '@/Components/Lottie/success.json';
import Button from "@/Components/Button";
import axios from "axios";
import { router } from "@inertiajs/react";

export default function PaymentSuccess({ findInvoice }) {

    const dontPrint = async () => {
        try {
            
            const response = await axios.post('/api/return-from-success', findInvoice);

            if (response.data.success) {
                router.visit('dashboard');
            }

        } catch (error) {
            console.error('error', error);
        }
    }

    return (
        <div className="min-h-screen flex flex-col gap-8 items-center justify-center w-full">
            <div className="flex flex-col gap-5 w-full max-w-[500px]">
                <Player
                    autoplay
                    loop
                    src={successAnimate} // Pass the Lottie JSON file
                    style={{ height: '160px', width: '160px' }}
                />
                <div className="flex flex-col items-center gap-1">
                    <div className="text-neutral-800 text-xl font-bold">Payment Successful!</div>
                    <div className="text-neutral-500 text-base ">Do you need a receipt for this payment?</div>
                </div>
                <div className="flex justify-center">
                    {
                        findInvoice.change_balance !== '0.00' && (
                            <div className="py-2 px-6 rounded-xl uppercase text-primary-500 font-bold text-lg bg-pchange shadow-pshadow">
                                change: RM {findInvoice.change_balance}
                            </div>
                        )
                    }
                </div>
            </div>

            <div className="w-full flex items-center gap-3 max-w-[500px]">
                <Button size="md" variant="white" className="w-full flex items-center justify-center" onClick={dontPrint} >Don't Print</Button>
                <Button size="md" className="w-full flex items-center justify-center">Print</Button>
            </div>
        </div>
    )
}