import Button from '@/Components/Button';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function Login({ status, canResetPassword }) {

    const { t, i18n } = useTranslation(); 
    const year = new Date().getFullYear();

    const { data, setData, post, processing, errors, reset } = useForm({
        uid: '',
        password: '',
        remember: false,
    });

    const submit = async (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className='w-full flex flex-row min-h-screen '>
                <div className='w-full p-3 flex justify-center items-center'>
                    <img src="assets/images/login-container.jpg" alt="" className='max-h-[95vh] rounded-lg'  />
                </div>

                <form onSubmit={submit} className='w-full p-4'>
                    <div className='w-full flex justify-center items-center h-full'>
                        <div className='flex flex-col gap-8 max-w-[328px] w-full'>
                            <div className='flex flex-col gap-2'>
                                <div>
                                    <img src="assets/images/logo-50x43.png" alt="" />
                                </div>
                                <div className='flex flex-col justify-start'>
                                    <div className='text-neutral-900 text-xxl font-bold'>{t('welcome_back')}</div>
                                    <div className='text-neutral-400 text-sm'>{t('provide_your_user_id_password')}</div>
                                </div>
                            </div>
                            <div className='flex flex-col gap-2'>
                                <div className='flex flex-col gap-1'>
                                    <InputLabel value={t('user_id')} />
                                    <TextInput 
                                        id="uid"
                                        type="text"
                                        name="uid"
                                        value={data.uid}
                                        className="mt-1 block w-full"
                                        autoComplete="uid"
                                        isFocused={true}
                                        onChange={(e) => setData('uid', e.target.value)}
                                    />
                                    <div>
                                        <InputError message={errors.uid} />
                                    </div>
                                </div>
                                <div className='flex flex-col gap-1'>
                                    <InputLabel value={t('passcode')} />
                                    <TextInput 
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <div>
                                        <InputError message={errors.password} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Button size='md' className='w-full flex justify-center'>
                                    {t('login')}
                                </Button>
                            </div>
                            <div className='text-neutral-300 text-xss text-center'>
                                © {year} Current Tech Industries Sdn. Bhd.
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
