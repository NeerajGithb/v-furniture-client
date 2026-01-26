'use client';

import Image from 'next/image';
import { useCategories } from '@/hooks/useProductData';
import { FooterNav } from './FooterNav';
import { FooterNewsletter } from './FooterNewsletter';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import {
    HiOutlineLocationMarker,
    HiOutlinePhone,
    HiOutlineMail,
} from 'react-icons/hi';

const SOCIAL_LINKS = [
    { name: 'Instagram', href: '#', icon: FaInstagram },
    { name: 'Facebook', href: '#', icon: FaFacebook },
    { name: 'Twitter', href: '#', icon: FaTwitter },
];

const Footer = () => {
    const { data: categoriesData, isLoading: loading } = useCategories();
    const categories = categoriesData || [];
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-50 dark:bg-[#0f1419] border-t border-gray-200 dark:border-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Main Content */}
                <div className="py-8 lg:py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
                        {/* Brand */}
                        <div className="lg:col-span-1">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="mb-3"
                            />

                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                Crafting exceptional furniture for discerning homes since 1985.
                            </p>

                            {/* Contact Info */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <HiOutlineLocationMarker className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                    <span>123 Furniture Ave, NY 10001</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <HiOutlinePhone className="w-3.5 h-3.5 shrink-0" />
                                    <span>+1 (555) 123-4567</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <HiOutlineMail className="w-3.5 h-3.5 shrink-0" />
                                    <span>hello@furniture.com</span>
                                </div>
                            </div>

                            {/* Social Icons */}
                            <div className="flex gap-2">
                                {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
                                    <a
                                        key={name}
                                        href={href}
                                        aria-label={name}
                                        className="w-8 h-8 flex items-center justify-center
                               bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700
                               text-gray-700 dark:text-gray-300
                               hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white
                               transition-all"
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="lg:col-span-2">
                            <FooterNav categories={categories} loading={loading} />
                        </div>

                        {/* Newsletter */}
                        <div className="lg:col-span-1">
                            <FooterNewsletter />
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 dark:border-gray-800 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center lg:text-left">
                            © {currentYear} Premium Furniture. All rights reserved.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            {['Privacy', 'Terms', 'Accessibility'].map((item) => (
                                <a
                                    key={item}
                                    href="#"
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;