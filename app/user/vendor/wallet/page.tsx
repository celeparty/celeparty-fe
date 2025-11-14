"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { BankAccountDetails } from "@/components/profile/vendor/BankAccountDetails";
import { Button } from "@/components/ui/button";
import { useBalanceStore } from "@/hooks/use-balance";
import { iMerchantProfile } from "@/lib/interfaces/iMerchant";
import { axiosUser } from "@/lib/services";
import { formatNumberWithDots } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Wallet() {
	const { data: session, status } = useSession();
	const [mainData, setMainData] = useState<iMerchantProfile>({} as iMerchantProfile);
	const { activeBalance, refundBalance, setActiveBalance, setRefundBalance } = useBalanceStore();
	const router = useRouter();

	const getQuery = async () => {
		if (!session?.jwt) {
			throw new Error("Access token is undefined");
		} else {
			return await axiosUser("GET", "/api/users/me", `${session && session?.jwt}`);
		}
	};

	const query = useQuery({
		queryKey: ["qUserProfile"],
		queryFn: getQuery,
		staleTime: 5000,
		enabled: !!session?.jwt,
		retry: 3,
	});

	useEffect(() => {
		if (query.isSuccess) {
			setMainData(query.data);
		}
	}, [query.isSuccess, query.data]);

	useEffect(() => {
		if (!mainData) return;

		const { saldo_active, saldo_refund } = mainData;
		setActiveBalance(saldo_active);
		setRefundBalance(saldo_refund);
	}, [mainData]);

	if (query.isLoading) {
		return <Skeleton width="100%" height="150px" />;
	}

	if (query.isError) {
		return <ErrorNetwork style="mt-0" />;
	}

	const dataContent: iMerchantProfile = query?.data;

	return (
		<div>
			<Box className="lg:mt-7 mt-2">
				<div className="relative pl-[50px]">
					<Image
						src="/images/icon-wallet-2.svg"
						width={35}
						height={35}
						alt="wallet"
						className="absolute left-0 top-0"
					/>
					<div className=" text-c-gray-text2 w-[300px] lg:w-auto p-3 lg:p-0">
						<div className="flex flex-row gap-2 justify-between">
							<div className="l-side">
								<h5 className="text-black text-[14px] lg:text-[16px] lg:font-normal font-bold">
									Total Saldo Aktif
								</h5>
								<div className="font-bold text-[14px] lg:text-2xl text-c-green">
									Rp.
									{activeBalance && activeBalance !== "0" ? formatNumberWithDots(activeBalance) : 0}
								</div>
								<div className="mt-7">
									<div className="flex gap-5">
										<div className="l-side">
											<div className="text-[14px] lg:text-[16px] font-bold text-black">
												Saldo Penghasilan
											</div>
											<div className="text-[14px] lg:text-[16px] font-bold text-black">
												Processing Refund
											</div>
										</div>
										<div className="r-side">
											<div className="text-[14px] lg:text-[16px] text-c-green">
												Rp.
												{formatNumberWithDots(
													activeBalance && activeBalance !== "0" ? activeBalance : 0,
												)}
											</div>
											<div className="text-[14px] lg:text-[16px] text-c-green">
												Rp.
												{formatNumberWithDots(
													refundBalance && refundBalance !== "0" ? refundBalance : "0",
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="r-side">
								<div className="btn-wrapper mt-2">
									<Button variant={"green"} onClick={() => router.push("/user/vendor/withdraw")}>
										Tarik Saldo
									</Button>
								</div>
							</div>
						</div>
						<div className="mt-7">
							<BankAccountDetails
								accountName={dataContent?.accountName}
								accountNumber={dataContent?.accountNumber}
								bankName={dataContent?.bankName}
							></BankAccountDetails>
						</div>
						<Link
							href="/user/vendor/profile"
							className="border border-solid border-black text-[14px] lg:text-[16px] py-3 px-10 rounded-xl mt-7 inline-block text-black hover:bg-c-gray hover:text-white w-full lg:w-auto text-center lg:text-start font-extrabold lg:font-normal"
						>
							Edit Rekening
						</Link>
					</div>
				</div>
			</Box>
		</div>
	);
}
