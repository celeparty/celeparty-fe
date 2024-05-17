import Image from "next/image"
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

interface iItemProduct {
    id?: number
    title: string
    image_url: string
    price?: number | string
    rate?: string
    sold?: string
    location?: string
    url: string
}

export default function ItemProduct(props: iItemProduct) {
    return (
        <div className="p-2 w-1/5">
            <Link href={props.url} className=" rounded-lg shadow-md flex flex-col justify-between h-full p-3">
                <div>
                    <div className="relative w-[100px] h-[100px] mx-auto text-center my-3">
                        <Image src={props.image_url ? props.image_url : "/images/noimage.png"} fill alt="image"
                        />
                    </div>
                    <h4 className="text-center text-sm">{props.title}</h4>
                    <div className="text-c-orange  text-center text-[12px] font-bold">{props.price}</div>
                </div>
                <div>
                    <div className="flex items-center gap-1 text-[10px] font-medium mt-2 text-c-gray-text2"><FaStar className="text-[#FDD835]" />{props.rate} | Terjual {props.sold}</div>
                    <div className="flex gap-1 items-center text-[10px] mt-2  text-c-gray-text2">
                        <FaLocationDot /> {props.location}
                    </div>
                </div>
            </Link>
        </div>
    )
}
