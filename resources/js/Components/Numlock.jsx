import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import React, { useEffect } from "react";
import { BackspaceIcon } from "./Outline";

export default function Numlock({ 
    value = "",
    show = false,
    onChange = () => {},
    onClose = () => {},
    onSubmit = () => {},
    error = null,
 }) {

    const buttons = [
        "1","2","3",
        "4","5","6",
        "7","8","9",
        null,"0","⌫"
    ];

    const handleClick = (btn) => {
        if (btn === "⌫") {
            onChange(value.slice(0, -1));
        } else if (btn !== "" && value.length < 4) {
            onChange(value + btn);
        }
    };

    useEffect(() => {
        if (value.length === 4) {
            onSubmit();  
        }
    }, [value]);


    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
                onClose={onClose}
                static
            >
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-gray-500/75" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    enterTo="opacity-100 translate-y-0 sm:scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                    leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                    <DialogPanel className="flex flex-col transform overflow-hidden rounded-lg transition-all max-w-[356px] w-full">
                        <div className="flex flex-col w-full rounded-xl bg-white shadow-sec-voucher">
                            
                            {/* Title + dots */}
                            <div className="pb-4 pt-10 flex flex-col gap-5 items-center justify-center">
                                {
                                    !!error ? (
                                        <div className="text-error-500 text-base">Wrong passcode, please try again</div>
                                    ) : (
                                        <div className="text-neutral-400 text-base">Enter Passcode</div>
                                    )
                                }
                                
                                <div className="flex gap-3">
                                    {[0,1,2,3].map(i => (
                                        <div 
                                            key={i} 
                                            className={`w-3 h-3 rounded-full ${i < value.length ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Keypad */}
                            <div className="grid grid-cols-3 justify-items-center gap-5 p-5">
                                {
                                    buttons.map((btn, i) => (
                                        btn === null ? (
                                            // 🔹 render an empty placeholder div instead of a button
                                            <div key={i} className="max-w-20 h-20 w-full" />
                                        ) : (
                                            <button
                                                key={i}
                                                onClick={() => handleClick(btn)}
                                                className="max-w-20 h-20 w-full p-2.5 flex items-center justify-center border border-neutral-200 hover:bg-neutral-50 rounded-full text-xl text-neutral-500"
                                            >
                                                {
                                                    btn === '⌫' ? (
                                                        <BackspaceIcon />
                                                    ) : (
                                                        <span className="text-xl text-neutral-500">{btn}</span>
                                                    )
                                                }
                                            </button>
                                        )
                                    ))
                                }
                            </div>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    )
}