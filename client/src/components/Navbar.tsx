import React, { useState, useEffect, useRef } from 'react';
import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import LOGO from "../../public/logo.png"

export default function Navbar() {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileMenuOpen]);
    return (
        <>
            <header className="py-3">
                <div className="max-w-7xl mx-auto px-4 xl:px-0">
                    <div
                        className="bg-white flex items-center justify-between gap-x-4 rounded-2xl py-2.5 pl-5 pr-2.5 shadow-[0_2px_10px_0px_rgba(0,0,0,0.15)] lg:rounded-[1.375rem]"
                    >
                        <div className="flex items-center gap-x-10">
                            <Link className="font-semibold flex justify-center items-center" to="/" title="Home">
                                <img  src={LOGO} className="h-6 w-6 text-primary-400" />&nbsp;
                                Greedoc
                            </Link>
                        </div>

                        <div className="flex items-center gap-x-10">
                            <div className="flex items-center gap-x-3 lg:gap-x-2">
                                <Link
                                    to="/doctor/login"
                                    title="Doctor Login"
                                    className="items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus:shadow-[0_0px_0px_2px_rgba(15,23,42,0.25),0_2px_10px_0px_rgba(0,0,0,0.05)] shadow-[0_2px_10px_0px_rgba(0,0,0,0.05)] border border-neutral-100 bg-white text-neutral-700 hover:border-neutral-200 hover:bg-neutral-100 disabled:border-green-900/5 disabled:bg-green-50/30 disabled:text-green-900/20 px-3 py-2 rounded-[0.625rem] hidden lg:flex"
                                >
                                    Doctor Login
                                </Link>
                                <Link
                                    to="/patient/login"
                                    title="Patient Login"
                                    className="items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus:shadow-[0_0px_0px_2px_rgba(15,23,42,0.25),0_2px_10px_0px_rgba(0,0,0,0.05)] shadow-[0_2px_10px_0px_rgba(0,0,0,0.05)] bg-green-900 text-white hover:bg-green-800 disabled:bg-green-900/30 disabled:text-green-50/70 px-3 py-2 rounded-[0.625rem] flex"
                                >
                                    Patient Login
                                </Link>
                                <button
                                    type="button"
                                    aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                                    className="lg:hidden"
                                    title={isMobileMenuOpen ? "Close menu" : "Open menu"}
                                    onClick={toggleMobileMenu}
                                >
                                    <svg
                                        className={`h-6 text-green-500 transition-transform duration-300 ${isMobileMenuOpen ? 'hidden' : 'block'}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-hidden="true"
                                        data-slot="icon"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M3 9a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9Zm0 6.75a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <svg
                                        className={`h-6 text-green-500 transition-transform duration-300 ${isMobileMenuOpen ? 'block' : 'hidden'}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-hidden="true"
                                        data-slot="icon"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <div className="lg:hidden relative">
                <div
                    ref={mobileMenuRef}
                    className={`absolute top-2 left-4 right-4 xl:left-0 xl:right-0 xl:max-w-7xl xl:mx-auto bg-white rounded-2xl shadow-[0_2px_10px_0px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 ease-out origin-top z-50 ${isMobileMenuOpen
                            ? 'transform scale-100 opacity-100 pointer-events-auto'
                            : 'transform scale-95 opacity-0 pointer-events-none'
                        }`}
                >
                    <nav className="p-4">
                        <div className="flex gap-2">
                            <Link
                                to="/doctor/login"
                                title="Doctor Login"
                                className="flex-1 text-center py-2 px-3 text-sm font-medium border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                            >
                                Doctor Login
                            </Link>
                            <Link
                                to="/patient/login"
                                title="Patient Login"
                                className="flex-1 text-center py-2 px-3 text-sm font-medium bg-green-900 text-white hover:bg-green-800 rounded-lg transition-colors"
                            >
                                Patient Login
                            </Link>
                        </div>
                    </nav>
                </div>
            </div></>
    )
}