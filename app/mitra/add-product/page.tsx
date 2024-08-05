"use client"
import Box from "@/components/Box"

import { AiFillCustomerService } from "react-icons/ai";
import Link from "next/link";
import MainContentAddProduct from "./MainContent";



export default function ProfilePage() {

    return (
        <div>
            <Box className="mt-0">
                <div className="mt-7">
                    <MainContentAddProduct />
                </div>
            </Box>
            <Box>
                <div className="flex justify-center items-center">
                    <Link href="/" className="flex gap-2 items-center">
                        <AiFillCustomerService className="text-3xl" />
                        <strong>Bantuan Celeparty Care</strong>
                    </Link>
                </div>
            </Box>
        </div>
    )
}
