"use client"
import Image from "next/image"
import Link from "next/link"
import React from 'react'

export default function MainBlog() {
    return (
        <div className="flex gap-5">
            <div className="relative flex-1">
                <div className="relative fill-current">
                    <Image src="/images/dummy.jpg" fill alt="image"
                        object-fit="cover"
                    />
                </div>
                <Link href="/">Cara Membuat Kartu Undangan Ulang Tahun yang Menarik</Link>
            </div>
            <div className="relative flex-1">dua</div>
        </div>
    )
}
