import Box from "@/components/Box"
import { getData } from "@/lib/services"
import Image from "next/image"
import React from 'react'
import { FaStar, FaRegStar } from "react-icons/fa";
import parse from "html-react-parser";
import { FcHighPriority } from "react-icons/fc";
import SideBar from "./SideBar";

export default async function ProductDetail({ params }: { params: { slug: string } }) {
    const dataProduct = await getData(`/products/${params.slug}`)
    const dataContent = dataProduct ? dataProduct?.data.data : null
    return (
        <div className="relative wrapper-big py-7">
            <Box>
                {
                    dataContent ?
                        <div className="relative flex justify-between gap-11 [&_h4]:mb-2 [&_h4]:text-[18px] [&_h4]:font-medium">
                            <div className="flex gap-9 justify-between items-start">
                                <div className="relative imageproduct min-w-[350px] w-[350px] h-[350px]">
                                    {
                                        dataContent?.photos?.map((item: any) => {
                                            return (
                                                <div key={item.id} className="relative min-w-[350px] w-[350px] h-[350px]">
                                                    <Image src={item.image_url ? item.image_url : "/images/no-image.png"} alt="" fill style={{ objectFit: "cover" }} />
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                <div className="relative gap-1 ">
                                    <h5 className="font-hint text-sm mb-2 font-medium text-c-gray-text2">{dataContent?.category_name ? dataContent?.category_name : "Kategory Tidak Tersedia"}</h5>
                                    <h1 className="text-[26px] font-hind font-bold">{dataContent?.name ? dataContent.name : "Produk Tidak Tersedia"} </h1>
                                    <h4 className="text-[20px] text-c-orange font-bold">{dataContent?.default_variant_price}</h4>
                                    <div className="flex gap-1 items-center">
                                        <div className="rate flex gap-">
                                            <FaStar />
                                        </div>
                                        <div>{dataContent?.average_rating}</div>
                                    </div>
                                    <div className="relative text-[18px] mt-5">
                                        <h4>Varian</h4>
                                        <div className="variant flex flex-wrap gap-2 ">
                                            {
                                                dataContent?.variants?.map((variant: any) => {
                                                    return (
                                                        <div key={variant.id} className="bg-white border-[#000000] border-solid border-[1px] rounded-[10px] px-2 py-[2px] text-[14px]">{variant?.name}</div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                    <div className="mt-5 text-[12px]">
                                        <h4>Deskripsi</h4>
                                        {
                                            dataContent?.verify_desc ? parse(`${dataContent?.verify_desc}`) : <>Deskripsi Tidak Tersedia</>
                                        }
                                    </div>
                                    <div className="mt-5 text-[12px]">
                                        <h4>Ulasan Produk</h4>
                                        <div className="relative">
                                            Ulasan
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="right min-w-[275px] sticky top-0 ">
                                <SideBar />
                            </div>
                        </div>
                        : <div className="flex justify-center gap-1 items-center text-2xl py-20"><FcHighPriority /> Produk tidak tersedia</div>
                }
            </Box>
        </div>
    )
}
