"use client"
import React from 'react'
import Box from "@/components/Box"
import { ItemCategory, ItemInfo } from "./ItemCategory"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import ItemProduct from "@/components/product/ItemProduct"

export default function ProductContent() {
    return (
        <div className="flex justify-between items-start gap-7">
            <Box className="bg-c-blue text-white max-w-[280px]">
                <div className="relative mb-7 [&_h4]:mb-3">
                    <h4>Informasi Acara</h4>
                    <div className="flex flex-col gap-3">
                        <ItemInfo image="/images/date.svg">
                            <Input placeholder="Tanggal Acara" />
                        </ItemInfo>
                        <ItemInfo image="/images/group.svg">
                            <Input placeholder="Jumlah Tamu/ Pax" />
                        </ItemInfo>
                        <ItemInfo image="/images/location.svg">
                            <Input placeholder="Lokasi Acara" />
                        </ItemInfo>
                    </div>
                </div>
                <div className="relative mb-7 [&_h4]:mb-3">
                    <h4>Pilih Kategori Produk</h4>
                    <div className="flex flex-col gap-3">
                        <ItemInfo image="/images/food.svg">
                            <ItemCategory title="Makanan"
                                onClick={() => { console.log("Makanan") }}
                            />
                        </ItemInfo>
                        <ItemInfo image="/images/decoration.svg">
                            <ItemCategory title="Dekorasi"
                                onClick={() => { console.log("Dekorasi") }}
                            />
                        </ItemInfo>
                        <ItemInfo image="/images/cake.svg">
                            <ItemCategory title="Kue"
                                onClick={() => { console.log("Kue") }}
                            />
                        </ItemInfo>
                        <ItemInfo image="/images/hampers.svg">
                            <ItemCategory title="Hampers"
                                onClick={() => { console.log("Hampers") }}
                            />
                        </ItemInfo>
                        <ItemInfo image="/images/others.svg">
                            <ItemCategory title="Lainnya"
                                onClick={() => { console.log("lain nya") }}
                            />
                        </ItemInfo>
                    </div>
                </div>
            </Box>
            <div className="flex-1">
                <div className="w-auto inline-block">
                    <Box className="w-auto py-3">
                        <div className="flex  items-center gap-4">
                            <label className="mr-3">Urutkan</label>
                            <Button variant="outline">Terkait</Button>
                            <Button variant="outline">Terbaru</Button>
                            <Button variant="outline">Terlaris</Button>
                            <Button variant="outline" className="flex gap-1 items-center">Harga <IoIosArrowUp /></Button>
                            <div className="flex items-center gap-2">
                                Rp <Input placeholder="Harga Minimum" />
                            </div>
                            <div className="flex items-center gap-2">
                                Rp <Input placeholder="Harga Maximum" />
                            </div>
                        </div>
                    </Box>
                </div>
                <Box className="mt-3">
                    <div className="flex flex-wrap  -mx-2">
                        <ItemProduct
                            url="/"
                            key={1}
                            title="ProductName"
                            image_url="/images/pic.png"
                            price="200.000"
                            rate="4"
                            sold="10"
                            location={"unknown"}
                        />
                        <ItemProduct
                            url="/"
                            key={1}
                            title="ProductName"
                            image_url="/images/pic.png"
                            price="200.000"
                            rate="4"
                            sold="10"
                            location={"unknown"}
                        />
                        <ItemProduct
                            url="/"
                            key={1}
                            title="ProductName"
                            image_url="/images/pic.png"
                            price="200.000"
                            rate="4"
                            sold="10"
                            location={"unknown"}
                        />
                        <ItemProduct
                            url="/"
                            key={1}
                            title="ProductName"
                            image_url="/images/pic.png"
                            price="200.000"
                            rate="4"
                            sold="10"
                            location={"unknown"}
                        />
                    </div>
                </Box>
            </div>
        </div>

    )
}
