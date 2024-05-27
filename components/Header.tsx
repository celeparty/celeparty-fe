"use client"
import Image from "next/image"
import Link from "next/link"
import React from 'react'
import { IoIosSearch } from "react-icons/io";
import { MdOutlineShoppingCart } from "react-icons/md";
import { MdOutlineNotifications } from "react-icons/md";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { useSession, signIn, signOut } from "next-auth/react";


export default function Header() {
    const { data: session, status } = useSession()
    console.log(session?.user)
    return (
        <div className="bg-white shadow-sm w-full px-4 py-4  z-10  sticky top-0">
            <div className="wrapper-main flex items-start justify-between gap-16">
                <div className="flex items-center justify-between">
                    <Link href="/"><Image src="/images/logo.svg" width={234} height={63} alt="logo" /></Link>
                </div>
                <div className="relative flex-1 max-w-[900px]">
                    <div className="w-full relative">
                        <IoIosSearch className="absolute left-5 text-3xl top-[50%] -translate-y-[50%]" />
                        <input type="text" placeholder="Cari di Celeparty" className="input border-c-gray border-solid border-[1px] rounded-lg pr-5 pl-[60px] py-3 bg-white w-full" />
                    </div>
                    <ul className="flex gap-6 justify-center pb-1 pt-2 text-sm ">
                        <li><Link href="/" className="hover:text-c-blue">Tiket</Link></li>
                        <li><Link href="/" className="hover:text-c-blue">Hampers</Link></li>
                        <li><Link href="/" className="hover:text-c-blue">Kue Ulang Tahun</Link></li>
                        <li><Link href="/" className="hover:text-c-blue">Makanan</Link></li>
                        <li><Link href="/" className="hover:text-c-blue">Dekorasi</Link></li>
                        <li><Link href="/" className="hover:text-c-blue">Sound System</Link></li>
                    </ul>
                </div>
                <div className="relative flex items-center text-3xl gap-4 text-c-gray-text font-semibold">
                    <div className="item">
                        <MdOutlineShoppingCart />
                    </div>
                    <div className="item">
                        <MdOutlineNotifications />
                    </div>
                    <div className="item">
                        <IoChatbubbleEllipsesOutline />
                    </div>

                    {
                        status === "authenticated" ? <div className="btnline cursor-pointer" onClick={() => signOut()}>Keluar</div> : <Link href="/login" className="btnline">Masuk</Link>
                    }
                    <Link href="/register" className="btn">Daftar</Link>
                </div>
            </div>
        </div>
    )
}
