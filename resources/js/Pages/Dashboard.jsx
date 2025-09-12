import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { InputNumber, Result, Segmented } from 'antd';
import { useEffect, useState } from 'react';
import TableOrder from './Dashboard/TableOrder';
import NonTableOrder from './Dashboard/NonTableOrder';
import axios from 'axios';
import NoShiftIllus from '@/Components/Illustration/NoShiftIllus';
import Button from '@/Components/Button';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Numpad from '@/Components/Numpad';
import dayjs from 'dayjs';

export default function Dashboard({ checkShift }) {


    const [tableType, setTableType] = useState('table_order');
    const [isStartingCashOpen, setIsStartingCashOpen] = useState(false);
    const [openNumpad, setOpenNumpad] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [shiftDetails, setShiftDetails] = useState(null);
    const [currentTime, setCurrentTime] = useState(dayjs().format("HH:mm:ss"));

    const openShift = async () => {
        try {
            
            const response = await axios.post('/api/checkShift');

            if (response.status === 200) {
                setIsStartingCashOpen(true);
            }

        } catch (error) {
            console.error('error', error);
        }
    }

    const { data, setData, post, processing, errors, reset } = useForm({
        cash: '0.00',
    });


    const closeStartingCash = () => {
        setIsStartingCashOpen(false);
    }

    const closeNumpad = () => {
        setOpenNumpad(false);
    }

    const startShift = async () => {
        setIsLoading(true);
        try {
            
            const response = await axios.post('/api/openShift', data);

            if (response.status === 200) {
                setIsLoading(false);
                setIsSuccess(true);
                setShiftDetails(response.data.shift)
                router.reload({ only: ['checkShift'] });
            }

        } catch (error) {
            console.error('error', error)
        } finally {
            setIsLoading(true)
        }
    }

    const reloadPage = () => {
        setIsSuccess(false);
        setIsStartingCashOpen(false);
        setShiftDetails(null);
        setIsLoading(false);
    }

    if (isSuccess) {
        return (
            <div className='h-[80vh] flex items-center justify-center'>
                <Result
                    status="success"
                    title={<span className='text-neutral-900 font-bold text-lg'>Shift opened successfully!</span>}
                    subTitle={
                        <div className='text-neutral-500 text-base flex flex-col gap-2 pt-5'>
                            <div className='flex flex-row gap-2'>
                                <div className='w-40 text-left'>Shift No.:</div>
                                <div className='font-bold'>{shiftDetails.shift_number}</div>
                            </div>
                            <div className='flex flex-row gap-2'>
                                <div className='w-40 text-left'>Shift Date & Time.:</div>
                                <div className='font-bold'>{shiftDetails.shift_date} {shiftDetails.opening_time}</div>
                            </div>
                            <div className='flex flex-row gap-2'>
                                <div className='w-40 text-left'>Starting Cash:</div>
                                <div className='font-bold'>{shiftDetails.starting_cash} </div>
                            </div>
                        </div>
                    }
                    extra={[
                        <Button size='md' key="console" onClick={reloadPage}>
                            Back
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dayjs().format("HH:mm:ss"));
        }, 1000);

        return () => clearInterval(timer); // cleanup on unmount
    }, []);


    return (
        <AuthenticatedLayout>
            <Head title="Table" />

            <div className='flex flex-col w-full'>
                {/* header */}
                <div className='py-3 px-4 bg-white w-full flex items-center justify-between'>
                    <Segmented 
                        options={[
                            { label: 'Table Order', value: 'table_order'},
                            { label: 'Non-table Order', value: 'non_table_order'},
                        ]}
                        onChange={(value) => setTableType(value)}
                        className='p-1 rounded-lg'
                    />

                    {
                        checkShift && (
                            <div className='text-base font-bold text-neutral-900'>
                                {currentTime}
                            </div>
                        )
                    }
                    
                </div>

                {
                    checkShift ? (
                        <>
                            {/* content */}
                            {
                                tableType === 'table_order' && (
                                    <TableOrder />
                                )
                            }
                            {
                                tableType === 'non_table_order' && (
                                    <NonTableOrder />
                                )
                            }
                        </>
                    ) : (
                        <div className='w-full flex flex-col gap-2 justify-center items-center py-24'>
                            <div>
                                <NoShiftIllus />
                            </div>
                            <div className='flex flex-col items-center gap-4'>
                                <div className='flex flex-col gap-1 items-center'>
                                    <div className='text-neutral-800 text-xl font-bold'>No shift has opened yet</div>
                                    <div className='text-neutral-500 text-base'>To place an order, you'll need to open a shift first.</div>
                                </div>
                                <div>
                                    <Button size='md' onClick={openShift}>Open Shift</Button>
                                </div>
                            </div>
                        </div>
                    )
                }

                
            </div>

            <Modal
                show={isStartingCashOpen}
                onClose={closeStartingCash}
                title='Start Cash'
                maxWidth='lg'
            >
                <div className='py-3 px-4 flex flex-col gap-3'>
                    <div className='flex flex-col gap-1'>
                        <InputLabel value='Starting Cash' />
                        <InputNumber
                            value={data.cash}
                            prefix="RM "
                            step="0.01"
                            min="0.00"
                            precision={2}
                            className='w-full custom-input-min'
                            readOnly
                            onClick={() => setOpenNumpad(true)}
                        />
                    </div>
                    <div className='flex justify-center'>
                        <Button size='lg' onClick={startShift} disabled={isLoading}>Start Shift</Button>
                    </div>

                    <Modal 
                        show={openNumpad}
                        onClose={closeNumpad}
                        showtitle={false}
                        maxWidth='lg'
                    >
                        <Numpad 
                            value={data.cash} 
                            onSave={(val) => setData('cash', val)} 
                            onClose={closeNumpad}
                        />
                    </Modal>
                </div>
            </Modal>

            
        </AuthenticatedLayout>
    );
}
