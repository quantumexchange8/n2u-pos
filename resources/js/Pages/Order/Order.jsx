import Button from "@/Components/Button";
import { BackIcon, ContactIcon, DeleteIcon, MoreActionIcon, PaxIcon, QrCode, SearchIcon, UserIcon, VoucherIcon, XIcon, XIcon2 } from "@/Components/Outline";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import React, { useEffect, useState } from "react";
import AllProduct from "./Partials/AllProduct";
import { router, useForm } from "@inertiajs/react";
import { formatAmount } from "@/Composables";
import Modal from "@/Components/Modal";
import axios from "axios";
import toast from "react-hot-toast";
import { CustomToaster } from "@/Components/CustomToaster";
import { Transition } from "@headlessui/react";
import { Radio, Segmented } from "antd";
import TextInput from "@/Components/TextInput";


export default function Order({ table }) {

    const returnBack = () => {
        window.location.href = `/dashboard`;
    }

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isPaxOpen, setIsPaxOpen] = useState(false);
    const [pax, setPax] = useState(table.order.pax);
    const [openMoreAction, setOpenMoreAction] = useState(false);
    const [isOpenCustomer, setIsOpenCustomer] = useState(false);
    const [customerMethod, setCustomerMethod] = useState('search_member');
    const [getMember, setGetMember] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [filterSearch, setFilterSearch] = useState('');

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

    const openPax = () => {
        setIsPaxOpen(true);
    }
    const closePax = () => {
        setIsPaxOpen(false);
    }

    const savePax = async () => {
        try {
            
            const response = await axios.post('/api/update-order-pax', {
                order_id: table.order.id,
                order_no: table.order.order_no,
                pax: pax
            })

            setIsPaxOpen(false);
            router.reload({ only: ['table'] });

            toast.success(`Pax updated!`, {
                title: `Pax updated!`,
                duration: 3000,
                variant: 'variant3',
            });

        } catch (error) {
            console.error('error', error);
        }
    }

    const openAction = () => {
        setOpenMoreAction(true);
    }
    const closeAction = () => {
        setOpenMoreAction(false);
    }

    const openCustomer = () => {
        setIsOpenCustomer(true);
    }
    const closeCustomer = () => {
        setIsOpenCustomer(false)
    }

    const fetchCustomer = async () => {
        try {
            
            const response = await axios.get('/api/getCustomer');

            setGetMember(response.data);

        } catch (error) {
            console.error('error', error);
        }
    }

    useEffect(() => {
        if (isOpenCustomer && customerMethod === 'search_member') {
            fetchCustomer();
        }
    }, [isOpenCustomer, customerMethod])

    const filteredMembers = getMember.filter((member) => {
        if (!filterSearch) return true; // no filter applied

        const search = filterSearch.toLowerCase();
        return (
            member.name.toLowerCase().includes(search) ||
            `${member.dial_code}${member.phone}`.toLowerCase().includes(search) ||
            member.phone.toLowerCase().includes(search)
        );
    });

    const selectUser = async () => {
        try {
            
            const response = await axios.post('/api/add-customer-to-order', {
                member_id: selectedMember,
                order_id: table.order.id,
            })

            setIsOpenCustomer(false);
            router.reload({ only: ['table'] });

            toast.success(`Added Customer!`, {
                title: `Added Customer!`,
                duration: 3000,
                variant: 'variant3',
            });

        } catch (error) {
            console.error('error', error);
        }
    }

    return (
        <div className="w-full flex flex-row min-h-screen">
            <CustomToaster />
            <div className="w-1/3 flex flex-col min-h-screen border-r border-neutral-100 bg-white">
                <div className="py-5 px-4 flex flex-row gap-5 items-center border-b border-neutral-100 sticky top-0 bg-white">
                    <div className="w-full flex flex-col">
                        <div className="text-neutral-800 text-lg font-bold">Order</div>
                        <div className="text-neutral-800 text-sm">{table.order ? table.order.order_no : ''}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        {
                            table.order.user ? (
                                <Button variant="white" size="md" iconOnly pill className="text-xs" >
                                    {/* display customer image */}
                                    <div>
                                        {table.order.user.id}
                                    </div>
                                </Button>
                            ) : null
                        }
                        <Button variant="white" size="md" iconOnly pill onClick={openPax}>
                            <PaxIcon className='w-4 h-4 text-neutral-900' />
                        </Button>
                        <Button variant="white" size="md" iconOnly pill onClick={openAction}>
                            <MoreActionIcon  />
                        </Button>
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
                        <div className=" uppercase text-xs text-neutral-400">pax: {table.order.pax}</div>
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

            <Modal
                show={isPaxOpen}
                onClose={closePax}
                showtitle={false}
                maxWidth="sm"
                footer={
                    <div className="flex items-center gap-3 w-full p-3">
                        <Button variant="white" size="md" className="w-full flex items-center justify-center" onClick={closePax}>Close</Button>
                        <Button size="md" className="w-full flex items-center justify-center" onClick={savePax}>Save</Button>
                    </div>
                }
            >
                <div className="grid grid-cols-5 gap-3 p-4">
                    {[...Array(40)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPax(i + 1)}
                            className={`p-4 rounded-xl text-lg font-semibold border 
                                ${pax === i + 1 ? "bg-primary-500 text-white" : "bg-white border-neutral-200"}`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </Modal>

            <Transition
                show={openMoreAction}
                enter="transition ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="flex flex-col items-center justify-center overflow-hidden rounded-lg shadow-dialog sm:mx-auto sm:w-full">
                        <div className="grid grid-cols-4 gap-20">
                            <div className="flex flex-col items-center gap-4" onClick={openCustomer}>
                                <div className="w-20 h-20 p-5 flex items-center justify-center bg-white rounded-full hover:bg-neutral-50 cursor-pointer">
                                    <UserIcon />
                                </div>
                                <div className="text-white text-base font-bold">Customer</div>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 p-5 flex items-center justify-center bg-white rounded-full hover:bg-neutral-50 cursor-pointer">
                                    <DeleteIcon className="w-5 h-5" />
                                </div>
                                <div className="text-white text-base font-bold">Void</div>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-20 h-20 p-5 flex items-center justify-center bg-white rounded-full hover:bg-neutral-50 cursor-pointer">
                                    <VoucherIcon className="text-neutral-900" />
                                </div>
                                <div className="text-white text-base font-bold">Voucher</div>
                            </div>
                            <div className="flex flex-col items-center gap-4" onClick={closeAction}>
                                <div className="w-20 h-20 p-5 flex items-center justify-center bg-white rounded-full hover:bg-neutral-50 cursor-pointer">
                                    <XIcon2 className="w-5 h-5" />
                                </div>
                                <div className="text-white text-base font-bold">Close</div>
                            </div>
                        </div>
                    </div>

                    <Modal
                        show={isOpenCustomer}
                        onClose={closeCustomer}
                        maxWidth="md"
                        title='Customer'
                        footer={
                            <div className="flex items-center gap-3 w-full p-3">
                                <Button variant="white" size="md" className="w-full flex items-center justify-center" onClick={closeCustomer}>Close</Button>
                                <Button size="md" className="w-full flex items-center justify-center" onClick={selectUser} >Select</Button>
                            </div>
                        }
                    >
                        <div className="flex flex-col">
                            <div className="sticky top-0 z-10">
                                <Segmented
                                    options={[
                                        {
                                            label: (
                                                <div className="flex flex-col gap-1 items-center py-3" >
                                                    <ContactIcon className='w-7 h-7 text-neutral-950' />
                                                    <div className="text-sm font-bold text-neutral-900">Contact</div>
                                                </div>
                                            ),
                                            value: 'contact',
                                            disabled: true
                                        },
                                        {
                                            label: (
                                                <div className="flex flex-col gap-1 items-center py-3" >
                                                    <SearchIcon className='w-7 h-7 text-neutral-950' />
                                                    <div className="text-sm font-bold text-neutral-900">Search Customer</div>
                                                </div>
                                            ),
                                            value: 'search_member',
                                        },
                                        {
                                            label: (
                                                <div className="flex flex-col gap-1 items-center py-3" >
                                                    <QrCode className='w-7 h-7 text-neutral-950' />
                                                    <div className="text-sm font-bold text-neutral-900">QR Code</div>
                                                </div>
                                            ),
                                            value: 'qr_code',
                                            disabled: true
                                        },
                                    ]} 
                                    value={customerMethod}
                                    onChange={(value) => setCustomerMethod(value)}
                                    block
                                />
                            </div>

                            {
                                customerMethod === 'search_member' && (
                                    <div className="p-4 flex flex-col gap-2">
                                        {/* search */}
                                        <div className="w-full border-b border-neutral-50">
                                            <TextInput 
                                                id="filterSearch"
                                                type="text"
                                                name="filterSearch"
                                                value={filterSearch}
                                                className=" w-full"
                                                onChange={(e) => setFilterSearch(e.target.value)}
                                                placeholder="Search..."
                                            />
                                        </div>
                                        <Radio.Group
                                            onChange={(e) => setSelectedMember(e.target.value)}
                                            value={selectedMember}
                                            className="flex flex-col gap-2"
                                        >
                                            {
                                                filteredMembers.length > 0 && filteredMembers.map((member) => (
                                                    <div key={member.id} className={`${selectedMember === member.id ? 'border-primary-500' : 'border-neutral-50' } border rounded-lg flex flex-row gap-3 p-2 w-full cursor-pointer hover:bg-neutral-50 `}
                                                        onClick={() => setSelectedMember(member.id)}
                                                    >
                                                        <div>
                                                            {/* img placeholder */}
                                                        </div>
                                                        <div className="flex flex-col gap-1 w-full">
                                                            <div className="text-sm font-semibold">{member.name}</div>
                                                            <div className="text-neutral-500 text-sm">
                                                                {member.dial_code}{member.phone}
                                                            </div>
                                                        </div>

                                                        <Radio value={member.id} />
                                                    </div>
                                                ))
                                            }
                                        </Radio.Group>
                                    </div>
                                )
                            }
                            
                        </div>
                    </Modal>
                </div>
            </Transition>
        </div>
    )
}