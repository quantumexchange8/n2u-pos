import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen items-center bg-white sm:justify-center sm:pt-0">
            
            <div className="w-full overflow-hidden min-h-screen">
                {children}
            </div>

        </div>
    );
}
