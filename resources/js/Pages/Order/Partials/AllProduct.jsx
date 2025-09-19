import Button from "@/Components/Button";
import ConfirmDialog from "@/Components/ConfirmDialog";
import InputLabel from "@/Components/InputLabel";
import Modal from "@/Components/Modal";
import Numlock from "@/Components/Numlock";
import Numpad from "@/Components/Numpad";
import { DeleteIcon, DiscountIcon, MinusIcon, NoImageIcon, PlusIcon, ReturnIcon, SearchIcon, ServedIcon, VoidIcon, XIcon } from "@/Components/Outline";
import TextInput from "@/Components/TextInput";
import { formatAmount } from "@/Composables";
import { router } from "@inertiajs/react";
import { Badge, Card, Checkbox, Divider, Input, List, Radio, Spin, Tag } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";

export default function AllProduct({ 
    table,
    data, 
    setData, 
    errors, 
    selectedProduct,
    setSelectedProduct,
    selectProdHistory,
    setSelectProdHistory,
    fetchOrderHistory,
    requiredDisable,
}) {

    const { TextArea } = Input;
    const [isProductLoading, setIsProductLoading] = useState(false);
    const [categoryLoading, setIsCatagoryLoading] = useState(false);
    const [getCategory, setGetCategory] = useState([]);
    const [getProducts, setGetProduct] = useState([]);
    const [page, setPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [hasMore, setHasMore] = useState(true);
    const [openVoidItem, setOpenVoidItem] = useState(false);
    const [sysRemark, setSysRemark] = useState('');
    const [openNumpad, setOpenNumpad] = useState(false);
    const [pinNo, setPinNo] = useState('');
    const [filterProduct, setFilterProduct] = useState('');
    const [pinError, setPinError] = useState('');

    const fetchCategories = async () => {
        setIsCatagoryLoading(true)
        try {

            const response = await axios.get('/api/category/getCategories');

            setGetCategory([{ id: 'all', name: 'All' }, ...response.data]);
            
        } catch (error) {
            console.error('error', error);
        } finally {
            setIsCatagoryLoading(false);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchProducts = async (category_id = 'all', page = 1) => {
        setIsProductLoading(true);

        try {

            const response = await axios.get('/api/products/getProducts', {
                params: { 
                    category_id, 
                    page, 
                    limit: 12,
                    filterProduct,
                }
            });

            if (page === 1) {
                // 🔁 reset when switching category
                setGetProduct(response.data.data);
            } else {
                setGetProduct((prev) => [...prev, ...response.data.data]);
            }

            setHasMore(response.data.current_page < response.data.last_page);
            
        } catch (error) {
            console.error('Error Fetching products: ', error)
        } finally {
            setIsProductLoading(false);
        }
    }

    useEffect(() => {
        setPage(1);
        fetchProducts(selectedCategory, 1);
    }, [selectedCategory, filterProduct]);

    const loadMoreData = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(selectedCategory, nextPage);
    };

    const selectProd = (item) => {
        const newProduct = {
            id: Date.now(),
            product_id: item.id,
            name: item.name,
            item_code: item.item_code,
            category_id: item.category_id,
            description: item.description,
            prices: item.prices,
            quantity: 1,
            remarks: '',
            total_price: item.prices,
            product_modifier_group: item.product_modifier_group,
            product_modifier: [],
            product_image: item.product_image ? item.product_image : ''
        }
        setData("products", [...data.products, newProduct]);
        setSelectedProduct(newProduct);
    }

    const removeSelectedProd = (id) => {
        setData("products", data.products.filter((p) => p.id !== id));
        setSelectedProduct(null)
    }

    const updateQuantity = (productId, change) => {
        setData("products", data.products.map((p) => {
            if (p.id === productId) {
                const updated = {
                    ...p,
                    quantity: Math.max(1, p.quantity + change), // prevent below 1
                };

                // also update selectedProduct if it's the same one
                if (selectedProduct?.id === productId) {
                    setSelectedProduct(updated);
                }

                return updated;
            }
            return p;
        }));
    };

    const serveItem = async () => {
        try {
            
            const status = selectProdHistory.status;

            const response = await axios.post('/api/serve-order-item', {
                
                params: { 
                    order_item_id: selectProdHistory.id,
                    status: status,
                }
            });

            router.reload({ only: ['table'] });
            fetchOrderHistory();

            toast.success(`Order Served!.`, {
                title: `Order Served!.`,
                duration: 3000,
                variant: 'variant3',
            });

        } catch (error) {
            console.error('error', error);
        }
    }

    const openNumLock = () => {
        setOpenNumpad(true);
    }
    const closeNumpad = () => {
        setOpenNumpad(false);
    }

    const voidItem = async () => {
        try {
            const response = await axios.post('/api/void-order-item', {
                
                params: { 
                    order_item_id: selectProdHistory.id,
                    sysRemark: sysRemark,
                    pinNo: pinNo,
                }
            });

            router.reload({ only: ['table'] });
            fetchOrderHistory();

            setOpenVoidItem(false);
            setSysRemark('');
            setOpenNumpad(false);
            setPinNo('');

            toast.success(`Order Voided!.`, {
                title: `Order Voided!.`,
                duration: 3000,
                variant: 'variant3',
            });

        } catch (error) {
            console.error('error', error);
            setPinError(error.response.data.message);
        }
    }

    return (
        <div className={` flex flex-col w-full min-h-[80vh]`}>
            {
                selectedProduct ? (
                    <div className="flex flex-col max-h-[85vh] overflow-y-auto">
                        <div className="p-4 flex justify-between items-center">
                            <div className="text-neutral-700 text-lg font-bold">RM {selectedProduct.prices}</div>
                            <div className="flex items-center gap-3">
                                <Button variant="white" size="md" className="flex items-center gap-2">
                                    <DiscountIcon />
                                    <span>Apply Discount</span>
                                </Button>
                                <Button variant="white" size="md" className="flex items-center gap-2" disabled={requiredDisable} onClick={() => setSelectedProduct(null)}>
                                    <ReturnIcon />
                                    <span>Back to Order</span>
                                </Button>
                            </div>
                        </div>
                        <div className="py-4 flex flex-col gap-5">
                            <div className="py-2 px-4 flex flex-row gap-3">
                                <div className="max-w-[140px] w-full h-[140px] bg-neutral-50 flex items-center justify-center rounded-lg px-2">
                                    {
                                        selectedProduct.product_image ? (
                                            <img src={selectedProduct.product_image} alt="" />
                                        ) : (
                                            <div >
                                                <img src='/assets/images/no-picture.svg' alt="" />
                                            </div>
                                        )
                                    }
                                    
                                </div>
                                <div className="w-full flex flex-col gap-3">
                                    <div className="flex flex-col">
                                        <div className="text-neutral-800 text-base font-bold">{selectedProduct.item_code} - {selectedProduct.name}</div>
                                        <div
                                            className="text-neutral-400 text-sm h-[59px] overflow-hidden"
                                            dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="textOnly"
                                                className={`p-2.5 rounded-xl border border-neutral-100 hover:bg-neutral-25 bg-white shadow-button box-border max-h-11 max-w-11 ${
                                                    selectedProduct.quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                                disabled={selectedProduct.quantity <= 1}
                                                onClick={() => updateQuantity(selectedProduct.id, -1)}
                                            >
                                                <MinusIcon className={`${selectedProduct.quantity > 0 ? 'text-neutral-900' : 'text-neutral-100'}`} />
                                            </Button>
                                            <div className="w-full">
                                                <TextInput
                                                    className="border border-neutral-100 rounded-xl bg-white shadow-input w-full text-center"
                                                    readOnly
                                                    value={data.products.find(p => p.id === selectedProduct.id)?.quantity || 1}
                                                />
                                            </div>
                                            <Button
                                                variant="textOnly"
                                                className="p-2.5 rounded-xl border border-neutral-100 hover:bg-neutral-25 bg-white shadow-button box-border max-h-11 max-w-11"
                                                onClick={() => updateQuantity(selectedProduct.id, 1)}
                                            >
                                                <PlusIcon className="text-neutral-900" />
                                            </Button>
                                        </div>
                                        <Button variant="white" size="md" iconOnly pill onClick={() => removeSelectedProd(selectedProduct.id)} >
                                            <DeleteIcon className='w-5 h-5' />
                                        </Button>
                                    </div> 
                                </div>
                            </div>
                            <div className="px-4">
                                <Divider className="my-0" />
                            </div>
                            {
                                selectedProduct.product_modifier_group.length > 0 && (
                                    <div className="flex flex-col gap-5">
                                    {selectedProduct.product_modifier_group.map((modifier, index) => {
                                        const currentProduct = data.products.find((p) => p.id === selectedProduct.id);

                                        // find this modifier group inside the product_modifier array
                                        const currentModifier = currentProduct?.product_modifier?.find((m) => m.id === modifier.modifier_group.id) || null;

                                        const selectedItems = currentModifier?.product_item_ids || [];

                                        return (
                                        <div className="px-4 flex flex-col gap-3" key={index}>
                                            {/* Group title */}
                                            <div className="flex items-center gap-2">
                                            <span className="text-neutral-800 text-base font-bold">
                                                {modifier.modifier_group.display_name}
                                            </span>
                                            {
                                                modifier.modifier_group.group_type === "required" ? (
                                                    <span
                                                        className={`text-error-500 text-xs font-medium`}
                                                    >
                                                        Required *
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={`text-neutral-400 text-xs font-medium`}
                                                    >
                                                        Optional
                                                    </span>
                                                )
                                            }
                                            
                                            </div>

                                            {/* If max = 1 → Radio group */}
                                            {
                                                modifier.modifier_group.max_selection === 1 ? (
                                                <Radio.Group
                                                    className="w-full"
                                                    value={selectedItems[0]?.id || null}
                                                >
                                                    <div className="grid grid-cols-4 gap-3">
                                                    {modifier.product_modifier_group_item.map((groupItem) => {
                                                        const isSelected = selectedItems.some((item) => item.id === groupItem.id);

                                                        return (
                                                        <div
                                                            key={groupItem.id}
                                                            className={`p-3 flex gap-3 border rounded-lg cursor-pointer ${
                                                            isSelected
                                                                ? "border-primary-500 bg-primary-25"
                                                                : "border-neutral-100"
                                                            }`}
                                                            onClick={() => {
                                                            setData(
                                                                "products",
                                                                data.products.map((p) => {
                                                                    if (p.id !== selectedProduct.id) return p;

                                                                // copy current modifiers
                                                                const updatedModifiers = [...(p.product_modifier || [])];

                                                                const existingIndex = updatedModifiers.findIndex(
                                                                    (m) => m.id === modifier.modifier_group.id
                                                                );

                                                                const enrichedItem = {
                                                                    id: groupItem.id,
                                                                    modifier_name: groupItem.modifier_name,
                                                                    modifier_price: groupItem.modifier_price,
                                                                };

                                                                if (existingIndex >= 0) {
                                                                    updatedModifiers[existingIndex] = {
                                                                    ...updatedModifiers[existingIndex],
                                                                    product_item_ids: [enrichedItem], // ✅ store enriched object
                                                                    };
                                                                } else {
                                                                    updatedModifiers.push({
                                                                    id: modifier.modifier_group.id,
                                                                    name: modifier.modifier_group.display_name,
                                                                    product_item_ids: [enrichedItem],
                                                                    });
                                                                }

                                                                // recalc total_price
                                                                const modifierSum = updatedModifiers.reduce((sum, mod) => {
                                                                    return (
                                                                    sum +
                                                                    mod.product_item_ids.reduce(
                                                                        (innerSum, item) => innerSum + parseFloat(item.modifier_price || 0),
                                                                        0
                                                                    )
                                                                    );
                                                                }, 0);

                                                                const totalPrice = parseFloat(p.prices) + modifierSum;

                                                                return {
                                                                    ...p,
                                                                    product_modifier: updatedModifiers,
                                                                    total_price: totalPrice.toFixed(2),
                                                                };
                                                                })
                                                            );
                                                            }}
                                                        >
                                                            <div className="flex flex-col gap-1 text-left w-full">
                                                            <div className="text-neutral-800 text-xs font-bold">
                                                                {groupItem.modifier_name}
                                                            </div>
                                                            <div className="text-neutral-400 text-xs">
                                                                + RM {formatAmount(groupItem.modifier_price)}
                                                            </div>
                                                            </div>

                                                            <Radio value={groupItem.id} />
                                                        </div>
                                                        );
                                                    })}
                                                    </div>
                                                </Radio.Group>
                                            ) : (
                                            /* If max > 1 → Checkbox group */
                                            <Checkbox.Group value={selectedItems.map(item => item.id)}>
                                                <div className="grid grid-cols-4 gap-3 w-full">
                                                    {modifier.product_modifier_group_item.map((groupItem) => {

                                                    const isSelected = selectedItems.some((item) => item.id === groupItem.id);
                                                    
                                                    return (
                                                        <div
                                                            key={groupItem.id}
                                                            className={`p-3 flex gap-3 border rounded-lg cursor-pointer custom-checkbox w-full ${
                                                                isSelected
                                                                ? "border-primary-500 bg-primary-25"
                                                                : "border-neutral-100"
                                                            }`}
                                                            onClick={() => {
                                                                let updated = [...selectedItems];

                                                                if (isSelected) {
                                                                    updated = updated.filter((item) => item.id !== groupItem.id);
                                                                } else if (updated.length < modifier.modifier_group.max_selection) {
                                                                    updated.push({
                                                                    id: groupItem.id,
                                                                    modifier_name: groupItem.modifier_name,
                                                                    modifier_price: groupItem.modifier_price,
                                                                    });
                                                                }

                                                                // update state
                                                                setData(
                                                                "products",
                                                                data.products.map((p) => {
                                                                    if (p.id !== selectedProduct.id) return p;

                                                                    const updatedModifiers = [...(p.product_modifier || [])];
                                                                    const existingIndex = updatedModifiers.findIndex((m) => m.id === modifier.modifier_group.id);

                                                                    if (existingIndex >= 0) {
                                                                        updatedModifiers[existingIndex] = {
                                                                            ...updatedModifiers[existingIndex],
                                                                            product_item_ids: updated,
                                                                        };
                                                                    } else {
                                                                        updatedModifiers.push({
                                                                            id: modifier.modifier_group.id,
                                                                            name: modifier.modifier_group.display_name,
                                                                            product_item_ids: updated,
                                                                        });
                                                                    }

                                                                    // recalc total_price
                                                                    const modifierSum = updatedModifiers.reduce((sum, mod) => {
                                                                        return (
                                                                        sum +
                                                                        mod.product_item_ids.reduce(
                                                                            (innerSum, item) => innerSum + parseFloat(item.modifier_price || 0),
                                                                            0
                                                                        )
                                                                        );
                                                                    }, 0);

                                                                    const totalPrice = parseFloat(p.prices) + modifierSum;

                                                                    return {
                                                                        ...p,
                                                                        product_modifier: updatedModifiers,
                                                                        total_price: totalPrice.toFixed(2),
                                                                    };
                                                                })
                                                                );
                                                            }}
                                                        >
                                                        <div className="flex flex-col gap-1 w-full">
                                                            <div className="text-neutral-800 text-xs font-bold">
                                                                {groupItem.modifier_name}
                                                            </div>
                                                            <div className="text-neutral-400 text-xs">
                                                            + RM {formatAmount(groupItem.modifier_price)}
                                                            </div>
                                                        </div>
                                                        {/* keep Checkbox for visual only, state is controlled */}
                                                        <Checkbox value={groupItem.id} checked={isSelected} />
                                                        </div>
                                                    );
                                                    })}
                                                </div>
                                            </Checkbox.Group>
                                            )}
                                        </div>
                                        );
                                    })}
                                    </div>
                                )
                            }

                            {/* Remark */}
                            <div className="flex flex-col gap-2 px-4">
                                <div className="text-neutral-800 font-bold text-base">Remark</div>
                                <TextArea 
                                    rows={4}
                                    value={data.products.find((p) => p.id === selectedProduct.id)?.remarks || ""}
                                    onChange={(e) => {
                                        const newRemark = e.target.value;
                                        setData("products", data.products.map((p) => p.id === selectedProduct.id ? { ...p, remarks: newRemark } : p));
                                    }}
                                    className="rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                ) : selectProdHistory ? (
                    <div className="flex flex-col max-h-[85vh] overflow-y-auto">
                        <div className="py-4 flex flex-col gap-5">
                            <div className="py-2 px-4 flex flex-row gap-3">
                                <div className="max-w-[140px] w-full h-[140px] bg-neutral-50 flex items-center justify-center rounded-lg px-2">
                                    {
                                        selectProdHistory.product.product_image ? (
                                            <img src={selectProdHistory.product.product_image} alt="" />
                                        ) : (
                                            <div >
                                                <img src='/assets/images/no-picture.svg' alt="" />
                                            </div>
                                        )
                                    }
                                    
                                </div>
                                <div className="w-full flex flex-col gap-3">
                                    <div className="flex flex-col">
                                        <div className="text-neutral-800 text-base font-bold">{selectProdHistory.product.item_code} - {selectProdHistory.product.name}</div>
                                        <div
                                            className="text-neutral-400 text-sm h-[50px] overflow-hidden"
                                            dangerouslySetInnerHTML={{ __html: selectProdHistory.product.description }}
                                        />
                                        <div className="text-neutral-700 text-base font-bold">RM {selectProdHistory.total_price}</div>
                                    </div>
                                    <div>
                                        {/* Show status */}
                                        {
                                            selectProdHistory.status === 'preparing' && (
                                                <Tag color="blue" className="font-semibold italic text-sm" >Preparing</Tag>
                                            )
                                        }
                                        {
                                            selectProdHistory.status === 'served' && (
                                                <Tag color="green" className="font-semibold italic text-sm" >Served</Tag>
                                            )
                                        }
                                        {
                                            selectProdHistory.status === 'void' && (
                                                <Tag color="red" className="font-semibold italic text-sm" >Voided</Tag>
                                            )
                                        }

                                    </div>
                                </div>
                            </div>

                            {/* Select Void / Serve this item */}
                            <div className="flex justify-center items-center gap-5">
                                {
                                    (selectProdHistory.status === 'preparing' || selectProdHistory.status === 'served') && (
                                        <>
                                            <div className="p-3 flex flex-col items-center gap-3 w-40 border border-neutral-100 rounded-lg transition duration-300 ease-in-out hover:shadow-[0_0_5px_#85E167] hover:border-success-400 cursor-pointer"
                                                onClick={serveItem}
                                            >
                                                {/* illus */}
                                                <ServedIcon className="w-32 h-32" />
                                                <div className="text-neutral-900 font-semibold text-base">
                                                    {selectProdHistory.status === 'served' ? 'Unserve' : 'Serve'}
                                                </div>
                                            </div>
                                            <div className="p-3 flex flex-col items-center gap-3 w-40 border border-neutral-100 rounded-lg transition duration-300 ease-in-out hover:shadow-[0_0_5px_#FB7967] hover:border-error-400 cursor-pointer"
                                                onClick={() => setOpenVoidItem(true)}
                                            >
                                                {/* illus */}
                                                <VoidIcon className="w-32 h-32" />
                                                <div className="text-neutral-900 font-semibold text-base">Void</div>
                                            </div>
                                        </>
                                    )
                                }
                                
                            </div>

                            {/* Remark */}
                            {
                                selectProdHistory.status === 'void' ? (
                                    <div className="flex flex-col gap-2 px-4">
                                        <div className="text-neutral-800 font-bold text-base">System remark</div>
                                        <TextArea 
                                            rows={4}
                                            value={selectProdHistory.sys_remarks}
                                            className="rounded-lg"
                                            readOnly
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 px-4">
                                        <div className="text-neutral-800 font-bold text-base">Remark</div>
                                        <TextArea 
                                            rows={4}
                                            value={selectProdHistory.remarks}
                                            
                                            className="rounded-lg"
                                        />
                                    </div>
                                )
                            }
                            
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 flex items-center gap-4 bg-white border-b border-neutral-100 relative">
                            <div>
                                <SearchIcon />
                            </div>
                            <div className="w-full">
                                <input type="text" value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} placeholder="Search..." className="border-none focus:ring-0 text-neutral-900 text-sm font-medium w-full" />
                            </div>
                            {
                                filterProduct && (
                                    <div className="absolute right-10 translate-x-1/2" onClick={() => setFilterProduct('')} >
                                        <XIcon />
                                    </div>
                                )
                            }
                        </div>
                        <div className="flex flex-row max-h-[85vh]">
                            <div
                                id="scrollableDiv"
                                style={{
                                    height: '83vh',
                                    overflow: 'auto',
                                    padding: '16px',
                                }}
                                className="w-3/4 "
                            >
                                <InfiniteScroll
                                    dataLength={isProductLoading ? 0 : (getProducts?.length || 0)}
                                    next={loadMoreData}
                                    hasMore={hasMore}
                                    loader={<Spin style={{ display: "block", margin: "16px auto" }} />}
                                    endMessage={
                                        <div className="font-bold" style={{ textAlign: "center", padding: "12px", color: "#888" }}>
                                            🎉 You’ve reached the end !
                                        </div>
                                    }
                                    scrollableTarget="scrollableDiv"
                                >
                                    <div className="grid grid-cols-3 gap-3">
                                        {
                                            getProducts.map((item) => (
                                                <div key={item.id} className="flex flex-col gap-3 p-3 bg-white border border-neutral-50 rounded-lg shadow-sec-voucher cursor-pointer relative" onClick={() => selectProd(item)}>
                                                    {/* <Badge count={} /> */}
                                                    <div className="w-full h-32 bg-neutral-50 rounded flex items-center justify-center">
                                                        <img src={item.product_image} alt="" className="h-[75px] " />
                                                    </div>
                                                    <div className="flex flex-col gap-2">
                                                        <div className="truncate-2-lines text-neutral-800 text-sm font-bold">{item.item_code} - {item.name}</div>
                                                        <div className="text-neutral-700 text-sm font-medium">RM {item.prices}</div>
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </InfiniteScroll>
                            </div>
                            
                            {
                                !categoryLoading && getCategory ? (
                                    <div className="w-1/4 py-4 px-3 flex flex-wrap justify-center lg:grid grid-cols-2 justify-items-center gap-3 overflow-y-auto">
                                        {
                                            getCategory.length > 0 ? (
                                                <>
                                                    {
                                                        getCategory.map((category) => (
                                                            <div key={category.id}
                                                                onClick={() => {
                                                                    setSelectedCategory(category.id); // 🔁 switch to `category.id`
                                                                }}
                                                                className={`${selectedCategory === category.id ? 'border-[3px] border-[#f2652280] ' : 'border-none' } ${category.id === 'all' && 'bg-primary-500'} rounded-xl max-h-[85px] `}
                                                                style={{ background: category.color}} 
                                                            >
                                                                <div className={`${selectedCategory === category.id ? 'border-2 border-white' : 'border-none'} p-2 w-20 h-20 flex items-center justify-center text-center rounded-xl text-white text-xs font-bold`}>
                                                                    {category.name}
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </>
                                            ) : (
                                                <></>
                                            )
                                        }
                                    </div>
                                ) : (
                                    <div className="w-1/4 py-4 px-3 flex justify-center items-center">
                                        <Spin size="large" />
                                    </div>
                                )
                            }
                        </div>
                    </>
                )
            }

            <ConfirmDialog show={openVoidItem} >
                <div className="p-6 flex flex-col items-center gap-8">
                    <div>
                        <VoidIcon className="w-20 h-20" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="text-lg font-bold text-gray-950 text-center">Void this item?</div>
                            <div className="text-sm text-neutral-700 text-center">This will void the current selected item from this order</div>
                        </div>
                        <div>
                            <TextInput 
                                id="sysRemark"
                                type="text"
                                name="sysRemark"
                                value={sysRemark}
                                className="w-full"
                                autoComplete="sysRemark"
                                isFocused={true}
                                onChange={(e) => setSysRemark(e.target.value)}
                                placeholder='remarks...'
                            />
                        </div>
                    </div>
                    <div className="flex justify-center gap-4 w-full">
                        <Button variant="white" size="md" onClick={() => {setOpenVoidItem(false), setSysRemark('')}} className="w-full flex items-center justify-center">Cancel</Button>
                        <Button size="md" variant="red" disabled={!sysRemark} onClick={openNumLock} className="w-full flex items-center justify-center">Confirm</Button>
                    </div>
                </div>


                <Numlock 
                    show={openNumpad}
                    value={pinNo} 
                    onChange={(val) => setPinNo(val)} 
                    onClose={closeNumpad}
                    onSubmit={voidItem}
                    error={pinError}
                />

            </ConfirmDialog>
            
        </div>
    )
}