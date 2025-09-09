import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Segmented } from 'antd';
import { useEffect, useState } from 'react';
import TableOrder from './Dashboard/TableOrder';
import NonTableOrder from './Dashboard/NonTableOrder';
import axios from 'axios';

export default function Dashboard() {

    const [tableType, setTableType] = useState('table_order');

    return (
        <AuthenticatedLayout>
            <Head title="Table" />

            <div className='flex flex-col w-full'>
                {/* header */}
                <div className='py-3 px-4 bg-white w-full'>
                    <Segmented 
                        options={[
                            { label: 'Table Order', value: 'table_order'},
                            { label: 'Non-table Order', value: 'non_table_order'},
                        ]}
                        onChange={(value) => setTableType(value)}
                        className='p-1 rounded-lg'
                    />
                </div>

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
            </div>
        </AuthenticatedLayout>
    );
}
