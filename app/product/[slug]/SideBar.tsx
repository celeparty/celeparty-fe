"use client"
import { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

export default function SideBar() {
    const [value, setValue] = useState(0)
    return (
        <div className="p-5 shadow-lg rounded-lg border-solid border-[1px]  border-gray-100">
            <h4>Atur Jumlah dan Catatan</h4>
            <div className="relative mt-5">
                <label className="mb-1 block">Jumlah</label>
                <div className=" border-solid w-auto inline-block border-[1px] rounded-lg border-c-gray">
                    <div className="flex items-center gap-2">
                        <div className="cursor-pointer p-3 hover:text-green-300"
                            onClick={() => {
                                value > 0 && setValue(value - 1)
                            }}
                        ><FaMinus />
                        </div>
                        <div>{value}</div>
                        <div className="cursor-pointer p-3 hover:text-green-300"
                            onClick={() => {
                                value < 1000 && setValue(value + 1)
                            }}><FaPlus />
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative mt-5">
                <div>Minimal Order : 1  </div>
                <div>Waktu Pemesanan : 2 Hari  </div>

                <label className="mb-1 block text-black mt-3">Tambah Catatan</label>
                <textarea className="w-full h-[100px] border-solid border-[1px] rounded-lg border-c-gray" />
            </div>
            <div className="text-center mx-auto max-w-[150px]">
                <input type="submit" value="+ Kerajang" className="bg-c-green mt-5 text-white py-3 w-full rounded-lg" />
            </div>
        </div>

    )
}
