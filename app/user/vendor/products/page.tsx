"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import ItemProduct from "@/components/product/ItemProduct";
import { axiosUser, getDataToken } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import { useUser } from "@/lib/store/user";
import axios from "axios";
import { useLocalStorage } from "@/lib/hook/useLocalStorage";
interface iItemStatus {
	status: string;
	value: number | string;
	color: string;
}

function ItemStatus({ status, value, color }: iItemStatus): JSX.Element {
	return (
		<div
			className={`py-3 px-5 text-center rounded-lg text-white min-w-[160px]`}
			style={{ backgroundColor: `${color}` }}
		>
			<h4>{status}</h4>
			<strong>{value}</strong>
		</div>
	);
}
export default function Products() {
	const { data: session, status } = useSession();
	const [myData, setMyData] = useState<any>([]);
	const {userMe}:any = useUser()
	const getData =()=> {
		axios.get(`${process.env.BASE_API}/api/products?populate=*&filters[users_permissions_user][documentId]=${userMe.user.documentId}`, {
			headers: {
				Authorization: `Bearer ${userMe.jwt}`,
			},
		}).then ((res)=> {
			setMyData(res?.data?.data)
		})

	}
	useEffect(() => {
		if (status === "authenticated" && userMe?.user?.documentId ) {
			getData();
		}
	}, [status, session, userMe]);

	const dataContent = myData;

	const deleteProducts = () => {
		console.log("deleteProducts")
	}

	const editProducts = () => {
		console.log("editProducts")
	}

	console.log(dataContent)
	
	return (
		<div>
			<Box className="mt-0">
				<div className="flex flex-wrap -mx-2">
					{dataContent.length >0 ? dataContent?.map((item: any) => {
						return (
								<ItemProduct
									url={`/products/${item.documentId}`}
									key={item.id}
									title={item.title}
									image_url={item.main_image ? process.env.BASE_API + item.main_image.url : "/images/noimage.png"}
									price={item.main_price ? formatRupiah(item.main_price) : formatRupiah(0)}
									rate={item.rate ? `${item.rate}` : "1"}
									sold={item.sold_count}
									location={item.region ? item.region : null}
									onDelete={deleteProducts}
									onEdit={editProducts}
								></ItemProduct>

						);
					}) : <div>Anda tidak memiliki produk</div>} 
				</div>
			</Box>
		</div>
	);
}
