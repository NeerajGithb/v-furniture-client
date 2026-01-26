'use client';

import { useState } from 'react';
import { FaCheckCircle, FaLock } from 'react-icons/fa';

export const FooterNewsletter = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const validateEmail = (email: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setStatus('error');
            return;
        }

        setStatus('success');
        setEmail('');

        setTimeout(() => setStatus('idle'), 3000);
    };

    return (
        <div className="space-y-4">
            {/* Newsletter */}
            <div>
                <h3 className="text-xs font-semibold text-black dark:text-white mb-2 uppercase tracking-wider">
                    Stay Updated
                </h3>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                    Subscribe to receive exclusive offers and updates
                </p>

                <form onSubmit={handleSubmit} className="space-y-2">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                       text-xs text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500
                       focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent
                       transition-all"
                    />

                    <button
                        type="submit"
                        className="w-full bg-black dark:bg-white text-white dark:text-black px-3 py-2
                       text-xs font-semibold
                       hover:bg-gray-900 dark:hover:bg-gray-100 transition-all active:scale-95"
                    >
                        Subscribe
                    </button>
                </form>

                {status === 'success' && (
                    <p className="text-green-600 dark:text-green-400 text-xs mt-2">
                        ✓ Successfully subscribed!
                    </p>
                )}

                {status === 'error' && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                        Please enter a valid email address.
                    </p>
                )}
            </div>

            {/* Payment Methods */}
            <div>
                <h4 className="text-xs font-semibold text-black dark:text-white mb-2 uppercase tracking-wider">
                    Payment Methods
                </h4>

                <div className="flex gap-2 flex-wrap">
                    {['VISA', 'MC', 'AMEX', 'PayPal'].map(method => (
                        <div
                            key={method}
                            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                         px-2 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
                        >
                            {method}
                        </div>
                    ))}
                </div>
            </div>

            {/* Trust Badges */}
            <div className="flex gap-3 pt-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <FaCheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                    <span>Secure Checkout</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                    <FaLock className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                    <span>SSL Protected</span>
                </div>
            </div>
        </div>
    );
};