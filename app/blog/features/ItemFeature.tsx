import React from 'react'
import Image from "next/image"
import Link from "next/link"

export default function ItemFeature() {
    return (
        <div className="w-full lg:w-6/12 px-5 pb-5">
            <div className="flex gap-3">
                <div className="relative fill-current w-[150px] h-[150px] overflow-hidden">
                    <Image
                        src="/images/dummy2.jpg"
                        fill
                        alt="image"
                        style={{ objectFit: "cover" }}
                    />
                </div>
                <div className="flex flex-col gap-3 flex-1">
                    <Link href="/" className="text-black">Cara Membuat Kartu Undangan Ulang Tahun yang Menarik</Link>
                    <div className="text-[14px]">16 October 2023</div>
                </div>
            </div>
        </div>
    )
}
