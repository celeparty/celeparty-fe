"use client"
import Image from "next/image"
import Link from "next/link"
import React from 'react'

export default function MainBlog() {
    return (
        <div className="flex gap-3">
            <div className="relative flex-1">
                <div className="relative w-full h-[400px] overflow-hidden">
                    <div className="relative fill-current w-full h-[400px]">
                        <Image
                            src="/images/dummy.jpg"
                            fill
                            alt="image"
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                    <div className="absolute bottom-0 left-0 p-5 text-white bg-[linear-gradient(0deg,rgba(0,0,0,0.75)_6.82%,rgba(0,0,0,0.00)_90.44%)] w-full text-[20px]">
                        <Link href="/">Cara Membuat Kartu Undangan Ulang Tahun yang Menarik </Link>
                    </div>
                </div>
            </div>
            <div className="relative flex-1 flex-row justify-between  gap-3 overflow-hidden">
                <div className="relative w-full bg-red-200 mb-3">
                    <div className="relative overflow-hidden">
                        <div className="relative fill-current w-full aspect-auto min-h-[194px]">
                            <Image
                                src="/images/dummy.jpg"
                                fill
                                alt="image"
                                style={{ objectFit: "cover" }}
                            />
                        </div>
                        <div className="absolute bottom-0 left-0 p-5 text-white bg-[linear-gradient(0deg,rgba(0,0,0,0.75)_6.82%,rgba(0,0,0,0.00)_90.44%)] w-full text-[20px]">
                            <Link href="/">Cara Membuat Kartu Undangan Ulang Tahun yang Menarik </Link>
                        </div>
                    </div>
                </div>
                <div className="relative w-full  ">
                    <div className="flex gap-3">
                        <div className="relative overflow-hidden w-full">
                            <div className="relative fill-current w-full h-[194px]">
                                <Image
                                    src="/images/dummy.jpg"
                                    fill
                                    alt="image"
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 p-5 text-white bg-[linear-gradient(0deg,rgba(0,0,0,0.75)_6.82%,rgba(0,0,0,0.00)_90.44%)] w-full text-[14px]">
                                <Link href="/">Cara Membuat Kartu Undangan Ulang Tahun yang Menarik </Link>
                            </div>
                        </div>
                        <div className="relative overflow-hidden w-full">
                            <div className="relative fill-current w-full h-[190px]">
                                <Image
                                    src="/images/dummy.jpg"
                                    fill
                                    alt="image"
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 p-5 text-white bg-[linear-gradient(0deg,rgba(0,0,0,0.75)_6.82%,rgba(0,0,0,0.00)_90.44%)] w-full text-[14px]">
                                <Link href="/">Cara Membuat Kartu Undangan Ulang Tahun yang Menarik </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
