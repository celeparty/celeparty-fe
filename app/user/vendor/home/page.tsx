"use client";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { getDataToken } from "@/lib/services";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useSession } from "next-auth/react";
import React from "react";

import Box from "@/components/Box";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface iItemStatus {
	status: string;
	value: number | string;
	color: string;
}

function ItemStatus({ status, value, color }: iItemStatus): JSX.Element {
	return (
		<div
			className={`py-3 px-5 text-center rounded-lg text-white min-w-[160px] text-sm sm:text-base`}
			style={{ backgroundColor: `${color}` }}
		>
			<h4 className="text-xs sm:text-sm">{status}</h4>
			<strong className="text-base sm:text-lg">{value}</strong>
		</div>
	);
}
export default function HomeMitra() {
	const session = useSession();
	const dataSession = session?.data as any;

	const getQuery = async () => {
		if (!dataSession?.user?.accessToken) {
			throw new Error("Access token is undefined");
		}
		return await getDataToken(`/transactions/vendor`, `${dataSession?.user?.accessToken}`);
	};
	const query = useQuery({
		queryKey: ["qMyOrder"],
		queryFn: getQuery,
		enabled: !!dataSession?.user?.accessToken,
	});

	if (query.isLoading) {
		return <Skeleton width="100%" height="150px" />;
	}
	if (query.isError) {
		return <ErrorNetwork style="mt-0" />;
	}
	const dataContent = query?.data?.data.data;
	return (
		<div>
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 justify-center items-center">
				<ItemStatus status="PENDING" value={1} color="#3E2882" />
				<ItemStatus status="PROCESS" value={1} color="#56C200" />
				<ItemStatus status="CANCEL" value={1} color="#F60E0E" />
				<ItemStatus status="INCOME" value="Rp. 1.000.000" color="#44CADC" />
			</div>
			<Box>
				<Table>
					<TableHeader className="bg-white">
						<TableRow>
							<TableHead className="w-[150px] text-xs sm:text-sm">ORDER DATE</TableHead>
							<TableHead className="text-xs sm:text-sm">ITEM</TableHead>
							<TableHead className="text-xs sm:text-sm">STATUS</TableHead>
							<TableHead className="text-xs sm:text-sm">TOTAL</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{dataContent?.map((item: any, i: number) => {
							return (
								<TableRow className={`${i % 2 === 0 ? "bg-slate-200" : "bg-white"}`} key={item.id}>
									<TableCell className="font-medium text-xs sm:text-sm">Tanggal Belom ada di api</TableCell>
									<TableCell className="text-xs sm:text-sm">{item.name}</TableCell>
									<TableCell className="text-xs sm:text-sm">{item.status}</TableCell>
									<TableCell className="text-xs sm:text-sm">{item.price}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Box>
		</div>
	);
}
