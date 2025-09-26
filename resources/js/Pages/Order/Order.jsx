import Button from "@/Components/Button";
import { BackIcon, ContactIcon, DeleteIcon, LogoutIcon, MemberCardLight, MoreActionIcon, OrderHistoryIcon, PaxIcon, QrCode, ReturnIcon, SearchIcon, UserIcon, VoidIcon, VoucherIcon, XIcon, XIcon2 } from "@/Components/Outline";
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
import { Badge, Divider, Radio, Segmented, Tag } from "antd";
import TextInput from "@/Components/TextInput";
import ConfirmDialog from "@/Components/ConfirmDialog";
import Unassigned from "@/Components/Illustration/Unassigned";
import RedirectingText from "@/Components/RedirectingText";
import Numlock from "@/Components/Numlock";
import InputError from "@/Components/InputError";

axios.defaults.withCredentials = true;

export default function Order({ table, paxs, draftOrder, orderItemInComplete }) {

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isPaxOpen, setIsPaxOpen] = useState(false);
    const [pax, setPax] = useState(table.order ? table.order.pax : paxs);
    const [openMoreAction, setOpenMoreAction] = useState(false);
    const [isOpenCustomer, setIsOpenCustomer] = useState(false);
    const [customerMethod, setCustomerMethod] = useState('search_member');
    const [getMember, setGetMember] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [filterSearch, setFilterSearch] = useState('');
    const [isMemberDetailsOpen, setIsMemberDetailsOpen] = useState(false);
    const [getCustomerDetails, setGetCustomerDetails] = useState(null);
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
    const [getOrderHistory, setGetOrderHistory] = useState([]);
    const [selectProdHistory, setSelectProdHistory] = useState(orderItemInComplete ? orderItemInComplete[0] : null);
    const [requiredDisable, setRequiredDisabled] = useState(false);
    const [openConfirmVoid, setOpenConfirmVoid] = useState(false);
    const [isFetchingOrder, setIsFetchingOrder] = useState(false);
    const [directingLoad, setDirectingLoad] = useState(false);
    const [voidRemark, setVoidRemark] = useState('');
    const [pinNo, setPinNo] = useState('');
    const [openNumpad, setOpenNumpad] = useState(false);
    const [pinError, setPinError] = useState('');
    const [remarkRequired, setRemarkRequired] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        table_id: table.id ? table.id : null,
        order_id: table.order ? table.order.id : null,
        order_no: table.order ? table.order.order_no : null,
        products: [],
        total_amount: '',
        pax: pax,
        customer_id: pax,
    });

    // useEffect(() => {
    //     if (draftOrder.length > 0) {
    //         setData('products', draftOrder);
    //     }
    // }, [draftOrder])
 
    const totalBill = data.products.reduce((sum, product) => {
        return sum + parseFloat(product.total_price || 0);
    }, 0);

    useEffect(() => {
        setData('total_amount', totalBill);
    }, [totalBill])

    const findExistingProd = (id) => {
        const existingProd = data.products.find((p) => p.id === id);

        setSelectedProduct(existingProd);
    }

    const returnBack = async () => {

        // if (data.products.length > 0) {

        //     try {

        //         const response = await axios.post('/api/draft-order-items', data)
                
        //     } catch (error) {
        //         console.error('error', error);
        //     }
        // }

        try {

            const response = await axios.post('/api/return-from-order', {
                table: table.id
            })

            window.location.href = '/dashboard';
            
        } catch (error) {
            console.error('error', error);
        }
    }

    const openPax = () => {
        setIsPaxOpen(true);
    }
    const closePax = () => {
        setIsPaxOpen(false);
    }

    const savePax = async () => {
        if (table.order) {
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
        } else {
            setData('pax', pax);
            setIsPaxOpen(false);
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

    useEffect(() => {
        if (table.order) {
            setSelectedMember(table.order.user?.id)
        }
    }, [table.order?.user])

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

        if (table.order) {
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
        } else {
            setData('customer_id', selectedMember);
            setIsOpenCustomer(false);
        }
    }

    const fetchCustomerDetails = async () => {
        try {
            
            const response = await axios.get('/api/getCustomerDetails', {
                params: { id: table.order.user?.id}
            });

            setGetCustomerDetails(response.data);

        } catch (error) {
            console.error('error', error);
        }
    }

    useEffect(() => {
        if (table.order) {
            fetchCustomerDetails();
        }
    }, [table.order?.user])

    const closeConfirDialog = () => {
        setOpenConfirmDialog(false);
    }

    const logoutCurrentUser = async () => {

        try {
            
            const response = await axios.post('/api/unassigned-customer', {
                params: { 
                    customer_id: getCustomerDetails.id,
                    order_id: table.order.id
                }
            });

            setOpenConfirmDialog(false);
            setGetCustomerDetails(null);
            router.reload({ only: ['table'] });

            toast.info(`Unassigned Customer.`, {
                title: `Unassigned Customer.`,
                duration: 3000,
                variant: 'variant3',
            });

        } catch (error) {
            console.error('error', error);
        }
    }

    const placeOrder = async () => {
        setIsPlacingOrder(true);
        try {
            
            const response = await axios.post('/api/place-order-items', data)

            reset();
            setSelectedProduct(null);
            setSelectProdHistory(null);

            router.reload({ only: ['table'] });
            
            toast.success(`Order Placed!.`, {
                title: `Order Placed!.`,
                duration: 3000,
                variant: 'variant3',
            });


        } catch (error) {
            console.error('error', error);
        } finally {
            setIsPlacingOrder(false);
        }
    }

    const goToPay = () => {
        const subtotal = parseFloat(table.order?.subtotal);
        if (subtotal <= 0) {
            toast.error(`Cannot make payment. No items in this order.`, {
                title: `Cannot make payment. No items in this order.`,
                duration: 3000,
                variant: 'variant3',
            });
        } else {
            router.visit('/payment?table=' + table.id + '&order=' + table.order.id, {
                onFinish: () => setDirectingLoad(false) // reset after redirect done
            });
        }
    }

    const fetchOrderHistory = async () => {
        setIsFetchingOrder(true);
        try {
            
            const response = await axios.get('/api/getOrderHistory', {
                params: { id: table.order.id}
            });

            setGetOrderHistory(response.data);
            if (isOrderHistoryOpen) {
                setSelectProdHistory(response.data[0]);
                router.reload({ only: ['table'] });
            }
            
        } catch (error) {
            console.error('error', error);
        } finally {
            setIsFetchingOrder(false)
        }
    }

    useEffect(() => {
        if (isOrderHistoryOpen) {
            if (window.Echo) {
                window.Echo.private('order-histories')
                    .listen('.OrderHistory', (e) => {
                        if (e.orderId === table.order.id) {
                            fetchOrderHistory(); // always refresh from backend
                        }
                    });
            }
            fetchOrderHistory(); // initial load
        }
    }, [isOrderHistoryOpen]);

    useEffect(() => {
        if (orderItemInComplete) {
            if (window.Echo) {
                window.Echo.private('order-histories')
                    .listen('.OrderHistory', (e) => {
                        if (e.orderId === table.order.id) {
                            router.reload({ only: ['orderItemInComplete'] }); // always refresh from backend
                        }
                    });
            }
            fetchOrderHistory(); // initial load
        }
    }, [orderItemInComplete]);

    const findOrderHistoryProd = (id) => {
        const existingProd = getOrderHistory.find((p) => p.id === id);

        setSelectProdHistory(existingProd);
    }

    useEffect(() => {
        let hasMissingRequired = false;

        data.products.forEach((prod) => {
            if (prod.product_modifier_group?.length > 0) {
                prod.product_modifier_group.forEach((group) => {
                    
                    if (group.modifier_group.group_type === "required") {
                        // Check if product_modifier has a selected modifier for this group
                        const selected = prod.product_modifier.find(
                            (m) => m.id === group.modifier_group.id
                        );

                        if (!selected || !selected.product_item_ids?.length) {
                            hasMissingRequired = true;
                        }
                    }
                });
            }
        });

        setRequiredDisabled(hasMissingRequired);
    }, [data.products]);

    const voidOrder = () => {
        setOpenConfirmVoid(true);
    }
    const closeConfirmVoid = () => {
        setOpenConfirmVoid(false);
    }
    const confirmVoidOrder = async () => {
        try {
            
            const response = await axios.post('/api/void-order-bill', {
                params: {
                    order_id: table.order.id,
                    remarks: voidRemark,
                    pinNo: pinNo,
                }
            });

            if (response.data.success) {
                router.visit('dashboard');

                toast.success(`Order Voided!.`, {
                    title: `Order Voided!.`,
                    duration: 3000,
                    variant: 'variant3',
                });
            }

        } catch (error) {
            console.error('error', error);
            setPinError(error.response.data.message);
            if (error.response.data.remark) {
                setOpenNumpad(false);
                setPinNo('');
                setRemarkRequired(error.response.data.remark);
            }
        }
    }

    const serveAll = async () => {
        try {
            
            const response = await axios.post('/api/serve-all-item', {
                items: orderItemInComplete,
                order_id: table.order.id,
            });

            if (response.data.items_served) {

                toast.success(`All Order Served!`, {
                    title: `All Order Served!`,
                    duration: 3000,
                    variant: 'variant3',
                });


                router.visit('dashboard', {
                    onFinish: () => setDirectingLoad(false) // reset after redirect done
                });
            }

        } catch (error) {
            console.error('error', error);
        }
    }

    const clearDraft = () => {
        setData('products', []);
        setSelectedProduct(null)
    }

    const serveOrderHistory = async () => {

        if (getOrderHistory.length == 0) {
            toast.error(`No order item found!`, {
                title: `No order item found!`,
                duration: 3000,
                variant: 'variant3',
            });

            return;
        }

        if (getOrderHistory.length > 0) {

            try {

                const response = await axios.post('/api/serve-all-order-history', {
                    order_id: table.order.id,
                });

                if (response.data.success) {
                    if (window.Echo) {
                        window.Echo.private('order-histories')
                            .listen('.OrderHistory', (e) => {
                                if (e.orderId === table.order.id) {
                                    fetchOrderHistory(); // always refresh from backend
                                }
                            });
                    }
                    toast.success(`All Order Served!`, {
                        title: `All Order Served!`,
                        duration: 3000,
                        variant: 'variant3',
                    });
                } else {
                    if (window.Echo) {
                        window.Echo.private('order-histories')
                            .listen('.OrderHistory', (e) => {
                                if (e.orderId === table.order.id) {
                                    fetchOrderHistory(); // always refresh from backend
                                }
                            });
                    }
                    toast.error(`No item to served!`, {
                        title: `No item to served!`,
                        duration: 3000,
                        variant: 'variant3',
                    });
                }
                
            } catch (error) {
                console.error('error serving all', error);
            }
        }
    }

    const openNumLock = () => {
        setOpenNumpad(true);
    }
    const closeNumpad = () => {
        setOpenNumpad(false);
        setPinNo('');
        setPinError('');
    }

    return (
        <div className="w-full flex flex-row min-h-screen">
            <CustomToaster />
            {directingLoad && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="p-4 rounded-lg">
                        <RedirectingText />
                    </div>
                </div>
            )}

            {
                orderItemInComplete && orderItemInComplete.length > 0 ? (
                    <div className="w-1/3 flex flex-col min-h-screen border-r border-neutral-100 bg-white">
                        <div className="py-5 px-4 flex flex-row gap-5 items-center border-b border-neutral-100 sticky top-0 bg-white">
                            <div className="w-full flex flex-col">
                                <div className="text-neutral-800 text-lg font-bold">Order</div>
                                <div className="text-neutral-800 text-sm">{table.order ? table.order.order_no : ''}</div>
                            </div>
                        </div>
                        <div className="flex flex-col justify-between min-h-[90vh] overflow-y-auto">
                            <div>
                                {
                                    orderItemInComplete.map((item, i) => (
                                        <div key={i} className={`${selectProdHistory?.id === item.id ? "bg-primary-25" : "bg-white"} p-4 flex gap-4 border-b border-neutral-50 `} onClick={() => {
                                                if (isFetchingOrder) {
                                                    return
                                                } else {
                                                    findOrderHistoryProd(item.id)
                                                }
                                            }} >
                                            <div className="w-10 h-10 flex items-center justify-center p-2 border border-primary-200 shadow-input rounded-xl text-primary-500 text-sm font-bold">{item.qty}</div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="text-neutral-800 text-sm font-bold max-w-40 truncate">{item.product.item_code} - {item.product.name}</div>
                                                    <div>RM {item.total_price}</div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {
                                                        item.order_item_modifier.length > 0 && (
                                                            <>
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
                                                            </>
                                                        )
                                                    }
                                                    <div>
                                                        {
                                                            item.status === 'preparing' && (
                                                                <Tag color="blue" className="font-semibold italic text-sm" >Preparing</Tag>
                                                            )
                                                        }
                                                        {
                                                            item.status === 'served' && (
                                                                <Tag color="green" className="font-semibold italic text-sm" >Served</Tag>
                                                            )
                                                        }
                                                        {
                                                            item.status === 'void' && (
                                                                <Tag color="red" className="font-semibold italic text-sm" >Voided</Tag>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="p-3">
                                <Button size="md" className="w-full flex items-center justify-center" onClick={serveAll}>Serve All</Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {
                            isMemberDetailsOpen && getCustomerDetails ? (
                                <div className="w-1/3 flex flex-col min-h-screen border-r border-neutral-100 bg-white">
                                    <div className="py-5 px-4 flex flex-row gap-5 items-center border-b border-neutral-100 sticky top-0 bg-white">
                                        <Button variant="white" size="md" iconOnly pill onClick={() => setIsMemberDetailsOpen(false)}><ReturnIcon className='text-neutral-900'/></Button>
                                        <div className="text-neutral-800 text-lg font-bold text-center w-full">Member Detail</div>
                                        <Button variant="white" size="md" iconOnly pill onClick={() => setOpenConfirmDialog(true)} ><LogoutIcon /></Button>
                                    </div>

                                    <div className="flex flex-col gap-8 min-h-[96vh]">
                                        {/* Member Card */}
                                        <div className="px-4 pt-4" >
                                            <Badge.Ribbon className="capitalize" text={getCustomerDetails.rank.name} color={getCustomerDetails.rank.color ? getCustomerDetails.rank.color : 'orange'}>
                                                <div className="p-5 flex flex-col gap-4 bg-neutral-700 bg-member-card rounded-2xl relative overflow-hidden">
                                                    <div className="absolute top-0 left-0">
                                                        <MemberCardLight />
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <img src="" alt="" className="w-[76px] h-[76px] rounded-full border border-neutral-100" />
                                                        {/* <div>
                                                            {getCustomerDetails.rank.name}
                                                        </div> */}
                                                    </div>
                                                    <div className="flex flex-col ">
                                                        <div className="text-xl font-bold text-white" >{getCustomerDetails.name}</div>
                                                        <div className="flex flex-col text-[#AEAEAE] text-sm">
                                                            <div>{getCustomerDetails.dial_code} {getCustomerDetails.phone}</div>
                                                            <div>{getCustomerDetails.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-white text-base font-bold">
                                                        {getCustomerDetails.point} PTS
                                                    </div>
                                                </div>
                                            </Badge.Ribbon>
                                        </div>

                                        {/* usuals / preference */}
                                        <div></div>
                                    </div>
                                </div>
                            ) : isOrderHistoryOpen ? (
                                <div className="w-1/3 flex flex-col min-h-screen border-r border-neutral-100 bg-white">
                                    <div className="py-5 px-4 flex flex-row gap-5 items-center border-b border-neutral-100 sticky top-0 bg-white">
                                        <div className="w-full flex flex-col">
                                            <div className="text-neutral-800 text-lg font-bold">Order History</div>
                                            <div className="text-neutral-800 text-sm">{table.order ? table.order.order_no : ''}</div>
                                        </div>
                                        <Button size="md" variant="white" className="flex items-center gap-2" onClick={() => {
                                                setIsOrderHistoryOpen(false)
                                                setSelectProdHistory(null)
                                                setGetOrderHistory([])
                                            }} 
                                        >
                                            <BackIcon /> <span>Back</span>
                                        </Button>
                                    </div>
                                    <div className="flex flex-col justify-between max-h-[90vh] min-h-[88vh] overflow-y-auto">
                                        {
                                            getOrderHistory.length > 0 ? (
                                                <div className="flex flex-col max-h-[90vh] overflow-auto ">
                                                    {
                                                        getOrderHistory.map((item, i) => (
                                                            <div key={i} className={`${selectProdHistory?.id === item.id ? "bg-primary-25" : "bg-white"} p-4 flex gap-4 border-b border-neutral-50 `} onClick={() => findOrderHistoryProd(item.id)} >
                                                                <div className="w-10 h-10 flex items-center justify-center p-2 border border-primary-200 shadow-input rounded-xl text-primary-500 text-sm font-bold">{item.qty}</div>
                                                                <div className="flex flex-col gap-1 w-full">
                                                                    <div className="flex items-center justify-between w-full">
                                                                        <div className="text-neutral-800 text-sm font-bold max-w-[180px] truncate">{item.product.item_code} - {item.product.name}</div>
                                                                        <div>RM {item.total_price}</div>
                                                                    </div>
                                                                    <div className="flex flex-col gap-1">
                                                                        {
                                                                            item.order_item_modifier.length > 0 && (
                                                                                <>
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
                                                                                </>
                                                                            )
                                                                        }
                                                                        <div>
                                                                            {
                                                                                item.status === 'preparing' && (
                                                                                    <Tag color="blue" className="font-semibold italic text-sm" >Preparing</Tag>
                                                                                )
                                                                            }
                                                                            {
                                                                                item.status === 'served' && (
                                                                                    <Tag color="green" className="font-semibold italic text-sm" >Served</Tag>
                                                                                )
                                                                            }
                                                                            {
                                                                                item.status === 'void' && (
                                                                                    <Tag color="red" className="font-semibold italic text-sm" >Voided</Tag>
                                                                                )
                                                                            }
                                                                        </div>
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
                                        <div className="flex flex-col gap-3">
                                            <div className="py-2 px-4 flex flex-col gap-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-neutral-900 text-sm">Subtotal</div>
                                                    <div className="text-neutral-900 font-bold text-sm">RM {table.order.subtotal}</div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-neutral-900 text-sm">SST ({table.order.tax_rate}%)</div>
                                                    <div className="text-neutral-900 font-bold text-sm">RM {table.order.tax}</div>
                                                </div>
                                                {
                                                    table.order?.service_rate !== 0 && (
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-neutral-900 text-sm">Service Tax ({table.order.service_rate}%)</div>
                                                            <div className="text-neutral-900 font-bold text-sm">RM {table.order.service_charge}</div>
                                                        </div>
                                                    )
                                                }
                                                <div className="flex items-center justify-between">
                                                    <div className="text-neutral-900 text-sm">Rounding</div>
                                                    <div className="text-neutral-900 font-bold text-sm">RM {table.order.rounding}</div>
                                                </div>
                                                <Divider dashed className="my-2" />
                                                <div className="flex items-center justify-between">
                                                    <div className="text-neutral-900 text-lg">Total (Incl. Tax)</div>
                                                    <div className="text-neutral-900 font-bold text-lg">RM {table.order.total}</div>
                                                </div>
                                            </div>
                                            <div className="py-2 px-4 flex gap-3 items-center">
                                                <Button variant="secondary" size="md" className="w-full flex justify-center" onClick={goToPay} >Go to Pay</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-1/3 flex flex-col min-h-screen border-r border-neutral-100 bg-white">
                                    <div className="py-5 px-4 flex flex-row gap-5 items-center border-b border-neutral-100 sticky top-0 bg-white">
                                        <div className="w-full flex flex-col">
                                            <div className="text-neutral-800 text-lg font-bold">New Order</div>
                                            <div className="text-neutral-800 text-sm">{table.order ? table.order.order_no : ''}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {
                                                table.order?.user ? (
                                                    <Button variant="white" size="md" iconOnly pill className="text-xs" onClick={() => setIsMemberDetailsOpen(true)} >
                                                        {/* display customer image */}
                                                        <div className="w-5 h-5">
                                                            {table.order.user.id}
                                                        </div>
                                                    </Button>
                                                ) : null
                                            }
                                            <Button variant="white" size="md" iconOnly pill disabled={requiredDisable} onClick={() => {
                                                setSelectedProduct(null)
                                                if (table.order) {
                                                    setIsOrderHistoryOpen(true)}}
                                                }
                                            >
                                                <OrderHistoryIcon className='w-4 h-4 text-neutral-900' />
                                            </Button>
                                            <Button variant="white" size="md" iconOnly pill onClick={openAction}>
                                                <MoreActionIcon className='w-5 h-5' />
                                            </Button>
                                        </div>
                                    </div>
                                    {
                                        data.products.length > 0 && (
                                            <div className="py-3 px-4 flex flex-row gap-5 items-center justify-between border-b border-neutral-100 bg-blue-50 ">
                                                <span className="italic font-bold">Draft Order</span>
                                                <Button size="sm" variant="white" onClick={clearDraft}>Clear All</Button>
                                            </div>
                                        )
                                    }
                                    <div className="flex flex-col justify-between max-h-[90vh] min-h-[88vh]">
                                        {
                                            data.products && data.products.length > 0 ? (
                                                <div className="flex flex-col">
                                                    {
                                                        data.products.map((prod, i) => (
                                                            <div key={i} className="flex w-full">
                                                                {
                                                                    selectedProduct?.id === prod.id && (
                                                                        <div className="w-1 bg-primary-500 h-auto"></div>
                                                                    )
                                                                }
                                                                <div className={`${selectedProduct?.id === prod.id ? "bg-primary-25" : "bg-white"} p-4 flex gap-4 border-b border-neutral-50 w-full `} onClick={() => {
                                                                        if (requiredDisable) return;
                                                                        findExistingProd(prod.id)
                                                                    }} >
                                                                    <div className="w-10 h-10 flex items-center justify-center p-2 border border-primary-200 shadow-input rounded-xl text-primary-500 text-sm font-bold">{prod.quantity}</div>
                                                                    <div className="flex flex-col gap-1 w-full">
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <div className="text-neutral-800 text-sm font-bold">{prod.item_code} - {prod.name}</div>
                                                                            <div>RM {prod.total_price}</div>
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
                                                                        {
                                                                            prod.remarks && (
                                                                                <div className="text-xs">Remark - {prod.remarks}</div>
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
                                                <div className="text-neutral-900 text-lg font-bold">Total </div>
                                                <div className="text-neutral-900 text-lg font-bold">RM {formatAmount(totalBill)}</div>
                                            </div>
                                            <div className="py-2 px-4 flex gap-3 items-center">
                                                <Button variant="secondary" size="md" className="w-full flex justify-center" onClick={goToPay} >Go to Pay</Button>
                                                <Button size="md" className="w-full flex justify-center" onClick={placeOrder} disabled={isPlacingOrder || data.products.length == 0 || requiredDisable} >Place Order</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                    </>
                )
            }
            
            
            <div className="w-2/3 flex flex-col">
                <div className="py-5 px-4 flex items-center gap-5 border-b border-neutral-100 sticky top-0 z-20 bg-white">
                    <div className="flex flex-col w-full">
                        <div className="text-neutral-900 text-lg font-bold">{table.table_name}</div>
                        <div className=" uppercase text-sm text-neutral-400">pax: {table.order?.pax}</div>
                    </div>
                    {
                        isOrderHistoryOpen && (
                            <div className="flex gap-3 items-center">
                                <Button size="md" variant="white" className="h-11 box-border text-nowrap bg-green-100" onClick={serveOrderHistory} >Served All</Button>
                            </div>
                        )
                    }
                    {
                        !isOrderHistoryOpen && (
                            <div className="flex gap-3 items-center">
                                <Button size="md" variant="white" className="h-11 box-border">Release</Button>
                                <Button size="md" variant="black" className="text-nowrap text-sm h-11 box-border flex items-center gap-2" disabled={requiredDisable} onClick={returnBack}><BackIcon /> Go Back</Button>
                            </div>
                        )
                    }
                </div>

                <AllProduct 
                    table={table}
                    data={data} 
                    setData={setData} 
                    errors={errors} 
                    selectedProduct={selectedProduct}
                    setSelectedProduct={setSelectedProduct}
                    selectProdHistory={selectProdHistory}
                    setSelectProdHistory={setSelectProdHistory}
                    fetchOrderHistory={fetchOrderHistory}
                    requiredDisable={requiredDisable}
                    orderItemInComplete={orderItemInComplete}
                    setDirectingLoad={setDirectingLoad}
                />
            </div>

            <Modal
                show={isPaxOpen}
                onClose={closePax}
                maxWidth="sm"
                title={`No.of Pax`}
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
                            <div className="flex flex-col items-center gap-4" onClick={openPax}>
                                <div className="w-20 h-20 p-5 flex items-center justify-center bg-white rounded-full hover:bg-neutral-50 cursor-pointer">
                                    <PaxIcon />
                                </div>
                                <div className="text-white text-base font-bold">Pax</div>
                            </div>
                            {
                                table.order && (
                                    <div className="flex flex-col items-center gap-4" onClick={voidOrder}>
                                        <div className="w-20 h-20 p-5 flex items-center justify-center bg-white rounded-full hover:bg-neutral-50 cursor-pointer">
                                            <DeleteIcon className="w-5 h-5" />
                                        </div>
                                        <div className="text-white text-base font-bold">Void</div>
                                    </div>
                                )
                            }
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

            <ConfirmDialog show={openConfirmDialog} >
                <div className="p-6 flex flex-col items-center gap-8">
                    <div>
                        <Unassigned />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="text-lg font-bold text-gray-950 text-center">Unassign Customer?</div>
                        <div className="text-sm text-neutral-700 text-center">This will remove the current customer from this order. You can assign a new customer afterward.</div>
                    </div>
                    <div className="flex justify-center gap-4 w-full">
                        <Button variant="white" size="md" onClick={closeConfirDialog} className="w-full flex items-center justify-center">Cancel</Button>
                        <Button size="md" variant="red" onClick={logoutCurrentUser} className="w-full flex items-center justify-center">Confirm</Button>
                    </div>
                </div>
            </ConfirmDialog>

            {/* Void Order */}
            <ConfirmDialog show={openConfirmVoid}>
                <div className="p-6 flex flex-col items-center gap-8">
                    <div>
                        <VoidIcon className="w-32 h-32" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="text-lg font-bold text-gray-950 text-center">Void Order?</div>
                            <div className="text-sm text-neutral-700 text-center">This action will cancel the entire order and remove it from the active list. Once voided, the order cannot be recovered. </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <TextInput 
                                id="voidRemark"
                                type="text"
                                name="voidRemark"
                                value={voidRemark}
                                className="w-full"
                                autoComplete="voidRemark"
                                isFocused={true}
                                onChange={(e) => setVoidRemark(e.target.value)}
                                placeholder='remarks...'
                            />
                            <InputError message={remarkRequired} />
                        </div>
                    </div>

                    <div className="flex justify-center gap-4 w-full">
                        <Button variant="white" size="md" onClick={closeConfirmVoid} className="w-full flex items-center justify-center">Cancel</Button>
                        <Button size="md" variant="red" onClick={openNumLock} className="w-full flex items-center justify-center">Confirm</Button>
                    </div>
                </div>

                <Numlock 
                    show={openNumpad}
                    value={pinNo} 
                    onChange={(val) => setPinNo(val)} 
                    onClose={closeNumpad}
                    onSubmit={confirmVoidOrder}
                    error={pinError}
                />
            </ConfirmDialog>
        </div>
    )
}