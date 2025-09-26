import ApplicationLogo from '@/Components/ApplicationLogo';
import Button from '@/Components/Button';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GuestLayout({ children }) {
    const [onBoarding, setIsOnBoarding] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 1000); // 1 seconds
    
        return () => clearTimeout(timer); // cleanup
    }, []);

    return (
        <div className="flex min-h-screen items-center bg-white sm:justify-center sm:pt-0">
            
            <AnimatePresence>
                {onBoarding && (
                    <motion.div
                        key="onboarding"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 120, damping: 20 }}
                            className="flex flex-col gap-10 items-center justify-center overflow-hidden rounded-2xl bg-white p-8 shadow-xl sm:mx-auto sm:w-full sm:max-w-3xl"
                        >
                            <img src="assets/images/n2u-onboarding.png" alt="Onboarding" className="w-full" />

                            <div className="flex flex-col items-center gap-7 text-center">
                                <div>
                                    <div className="text-neutral-900 text-2xl font-bold">From Order to Payment, Seamlessly</div>
                                    <div className="text-neutral-400 text-sm">Place orders, accept payments, and track transactions—all in one flow.</div>
                                </div>
                                <Button 
                                    size="md" 
                                    className="max-w-80 w-full flex justify-center" 
                                    onClick={() => setIsOnBoarding(false)}
                                >
                                    Get Started
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {
                !isLoading ? (
                    <div className="w-full overflow-hidden min-h-screen">
                        {children}
                    </div>
                ) : (
                    <></>
                )
            }
        </div>
    );
}
