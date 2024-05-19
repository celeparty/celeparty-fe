import React from 'react'
import Image from "next/image"
import Link from "next/link"
import { IoIosSearch } from "react-icons/io";
import { MdOutlineShoppingCart } from "react-icons/md";
import { MdOutlineNotifications } from "react-icons/md";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
export default function TopHeader() {
    return (
        <div className="relative bg-[#F0F3F7] px-4 ">
            <div className="wrapper-main flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="text-sm ">Download Celeparty App</div>
                    <Link href="/"><Image src="/images/appstore.png" width={123} height={41} alt="app store" /></Link>
                    <Link href="/"><Image src="/images/playstore.png" width={123} height={43} alt="play store" /></Link>
                </div>
                <ul className="flex items-center gap-7 text-sm ">
                    <li><Link href="/">Tentang Celeparty</Link></li>
                    <li><Link href="/">Mitra Celeparty</Link></li>
                    <li><Link href="/blog">Blog</Link></li>
                    <li><Link href="/">Hubungi Kami</Link></li>
                </ul>
            </div>
        </div>
    )
}
