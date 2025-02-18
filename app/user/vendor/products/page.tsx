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
import ModalEdit from "@/components/product/ModalEdit";

interface iItemStatus {
	status: string;
	value: number | string;
	color: string;
}

interface staticArgumentUpdateProduk {
	title: string,
	minimal_order: number
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
	const [selectProduct, setSelectProduct] = useState<any>(null)
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

	// const handleEdit = (product: any) => {
	// 	setSelectProduct(product)
	// 	setShowModalEdit(true)
	// }

	const handleUpdateProduct = async (productId: string, updatedData: {title: string, price: number}) => {
		try {
		  const res = await axios.put(`${process.env.BASE_API}/api/products/${productId}`, {
			data: updatedData
		  }, {
			headers: {
				Authorization: `Bearer ${process.env.KEY_API}`,
				"Content-Type": "application/json"
			}
		  });
		  console.log("Update Success:", res.data);
		} catch (err) {
		  console.error("Update Failed:", err);
		}
	  };
	return (
		<div>
			<Box className="mt-0">
				<div className="flex flex-wrap -mx-2">
					{dataContent.length > 0 ? dataContent?.map((item: any) => {
						return (
								<ItemProduct
									url={`/products/${item.documentId}`}
									documentId={item.documentId}
									key={item.id}
									title={item.title}
									image_url={item.main_image ? process.env.BASE_API + item.main_image.url : "/images/noimage.png"}
									price={item.main_price ? formatRupiah(item.main_price) : formatRupiah(0)}
									rate={item.rate ? `${item.rate}` : "1"}
									sold={item.sold_count}
									location={item.region ? item.region : null}
									onEdit={() => handleUpdateProduct}
									// onDelete={deleteProducts}
									// onEdit={editProducts}
								></ItemProduct>
						);
					}) : <div>Anda tidak memiliki produk</div>} 
				</div>
			</Box>
			{/* <button onClick={() => handleUpdateProduct("lgr2f6g5lo8k1k8z7wglw406", {
				title: "BOKIR NATION",
				minimal_order: 10
			})}>Edit Products</button> */}
			{/* {
				showModalEdit && selectProduct && ( <ModalEdit product={selectProduct} onClose={() => setShowModalEdit(false)}/> )
			} */}
		</div>
	);
}
