import Button from '@/Components/Button';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import Numlock from '@/Components/Numlock';
import { SearchIcon, SearchIcon2 } from '@/Components/Outline';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Spin } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Login({ status, canResetPassword }) {

    const { t, i18n } = useTranslation(); 
    const year = new Date().getFullYear();
    const [openNumLock, setOpenNumLock] = useState(false);
    const [getLastLoginUser, setgetLastLoginUser] = useState([]);
    const [getCanAccessUser, setGetCanAccessUser] = useState([]);
    const [isSearchUserOpen, setIsSearchUserOpen] = useState(false);
    const [filterProduct, setFilterProduct] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        uid: '',
        password: '',
        remember: false,
    });

    const fetchLastLoginUser = async () => {
        try {
            
            const response = await axios.get('/api/getLastLoginUser');

            setgetLastLoginUser(response.data);

        } catch (error) {
            console.error('error', error);
        }
    }

    const fetchAllUser = async () => {
        setIsLoading(true);
        try {
            
            const response = await axios.get('/api/getUser');

            setGetCanAccessUser(response.data);

        } catch (error) {
            console.error('error', error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchLastLoginUser();
    }, []);

    useEffect(() => {
        if (isSearchUserOpen) {
            fetchAllUser();
        }
    }, [isSearchUserOpen]);

    const submit = async (e) => {
        post(route('login'), {
            onFinish: () => reset('password'),
        });
        
    };

    const bgColor = [
        '#FBB479',
        '#F26522',
        '#8E51FF',
        '#85E167',
        '#F6339A',
        '#00B8DB',
        '#00BBA7',
        '#7CCF00',
        '#7CCF00',
        '#F6339A',
        '#8E51FF',
    ];

    const selectUser = (user) => {
        setIsSearchUserOpen(false);
        setOpenNumLock(true);
        setData('uid', user.uid);
    }

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className='w-full flex flex-row min-h-screen '>
                {/* <div className='w-full p-3 flex justify-center items-center'>
                    <img src="assets/images/login-container.jpg" alt="" className='max-h-[95vh] rounded-lg'  />
                </div> */}

                <form onSubmit={submit} className='w-full p-4'>
                    <div className='w-full flex justify-center items-center h-full'>
                        <div className='flex flex-col gap-[60px] px-20 w-full'>
                            <div className='flex flex-col'>
                                <div className='text-neutral-900 text-xxl font-bold text-center'>Who's using this POS?</div>
                                <div className='text-neutral-400 text-sm text-center'>Select the user who wants to access this POS system.</div>
                            </div>
                            <div className='grid grid-cols-6 gap-8'>
                                {
                                    getLastLoginUser && getLastLoginUser.length > 0 && (
                                        <>
                                            {
                                                getLastLoginUser.map((user, i) => {

                                                    const nameParts = user.name.trim().split(" ");
                                                    let initials = "";

                                                    if (nameParts.length === 1) {
                                                        initials = nameParts[0][0].toUpperCase(); // single name -> "J"
                                                    } else {
                                                        initials = (
                                                            nameParts[0][0] + nameParts[nameParts.length - 1][0]
                                                        ).toUpperCase(); // multiple words -> "JW"
                                                    }

                                                    return (
                                                        <div key={i} className='flex flex-col gap-4 items-center max-w-[140px]' onClick={() => selectUser(user)} >
                                                            <div className='max-w-[140px] w-full h-[140px] rounded-lg flex justify-center items-center text-[64px] font-bold text-white' style={{ backgroundColor: bgColor[i % bgColor.length] }}>
                                                                {
                                                                    user.profile_image ? (
                                                                        <img src={user.profile_image} alt={user.name} />
                                                                    ) : (
                                                                        <div>{initials}</div>
                                                                    )
                                                                }
                                                            </div>
                                                            <div className='text-neutral-700 text-base font-bold'>{user.name}</div>
                                                        </div>
                                                    )
                                                })
                                            }
                                            <div className='flex flex-col gap-4 items-center max-w-[140px]' onClick={() => setIsSearchUserOpen(true)} >
                                                <div className='max-w-[140px] w-full h-[140px] rounded-lg bg-neutral-50 flex justify-center items-center text-[64px] font-bold text-white' >
                                                    <SearchIcon2 />
                                                </div>
                                                <div className='text-neutral-700 text-base font-bold'>Search User</div>
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* numlock */}
            <Numlock 
                show={openNumLock}
                value={data.password} 
                onChange={(val) => setData("password", val)} 
                onClose={() => {setOpenNumLock(false), setData('uid', ''), setData('password', '')}}
                error={errors.email}
                onSubmit={submit}
             />

             <Modal
                show={isSearchUserOpen}
                onClose={() => setIsSearchUserOpen(false)}
                maxWidth="md"
                title='Search User'
             >
                <div className='flex flex-col'>
                    <div className='p-4 flex items-center gap-4 w-full border-y border-neutral-100 sticky top-0 bg-white'>
                        <SearchIcon />
                        <div className="w-full">
                            <input type="text" value={filterProduct} onChange={(e) => setFilterProduct(e.target.value)} placeholder="Search..." className="border-none focus:ring-0 text-neutral-900 text-sm font-medium w-full" />
                        </div>
                    </div>
                    <div className='flex flex-col'>
                        {
                            getCanAccessUser && getCanAccessUser.length > 0 ? (
                                <>
                                    {
                                        getCanAccessUser.map((user, index) => {

                                            const nameParts = user.name.trim().split(" ");
                                            let initials = "";

                                            if (nameParts.length === 1) {
                                                initials = nameParts[0][0].toUpperCase(); // single name -> "J"
                                            } else {
                                                initials = (
                                                    nameParts[0][0] + nameParts[nameParts.length - 1][0]
                                                ).toUpperCase(); // multiple words -> "JW"
                                            }

                                            return (
                                                <div key={index} className='p-4 flex items-center gap-3 cursor-pointer hover:bg-neutral-50' onClick={() => selectUser(user)}>
                                                    <div className='w-10 h-10 bg-blue-300 rounded-full text-white flex items-center justify-center' >
                                                        {
                                                            user.profile_image ? (
                                                                <img src={user.profile_image} alt={user.name} />
                                                            ) : (
                                                                <div>{initials}</div>
                                                            )
                                                        }
                                                    </div>
                                                    <div className='text-neutral-900 text-sm font-bold'>{user.name}</div>
                                                </div>
                                            )
                                        })
                                    }
                                </>
                            ) : (
                                <>
                                    {
                                        isLoading ? (
                                            <div className='w-full flex items-center justify-center py-20'>
                                                <Spin />
                                            </div>
                                        ) : (
                                            <div>No User found.</div>
                                        )
                                    }
                                </>
                            )
                        }
                    </div>
                </div>
             </Modal>

        </GuestLayout>
    );
}
