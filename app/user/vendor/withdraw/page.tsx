"use client";
import Box from "@/components/Box";
import ErrorNetwork from "@/components/ErrorNetwork";
import Skeleton from "@/components/Skeleton";
import { ItemInput } from "@/components/form-components/ItemInput";
import { BankAccountDetails } from "@/components/profile/vendor/BankAccountDetails";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { eAlertType } from "@/lib/enums/eAlert";
import { iMerchantProfile } from "@/lib/interfaces/iMerchant";
import { axiosUser } from "@/lib/services";
import { formatMoneyReq, formatNumberWithDots, sanitizeVendorData } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function Wallet() {
	const { data: session, status } = useSession();

	const { toast } = useToast();

	const [withdrawBalance, setWithDrawBalance] = useState<string>("");
	const [errorBalance, setErrorBalance] = useState<boolean>(false);

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

	const dataContent: iMerchantProfile = query?.data;

	const formMethods = useForm<iMerchantProfile>();

	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
		control,
		reset,
		setValue,
	} = formMethods;

	useEffect(() => {
		if (query.data && dataContent) {
			const { saldo_active, saldo_refund } = dataContent;
			const formattedDataContent: iMerchantProfile = {
				...dataContent,
				saldo_active: formatNumberWithDots(saldo_active),
				saldo_refund: formatNumberWithDots(saldo_refund),
			};
			formMethods.reset(formattedDataContent);
		}
	}, [query.data, reset]);

	if (query.isLoading) {
		return (
			<div className=" relative flex justify-center ">
				<Skeleton width="100%" height="150px" />
			</div>
		);
	}
	if (query.isError) {
		return <ErrorNetwork />;
	}

	const onSubmit = async (data: iMerchantProfile) => {
		const { saldo_active, saldo_refund } = dataContent;

		if (formatMoneyReq(withdrawBalance) > formatMoneyReq(saldo_active)) {
			setErrorBalance(true);
			return;
		} else {
			setErrorBalance(false);
		}

		const calculatedActiveBalance = formatMoneyReq(saldo_active) - formatMoneyReq(withdrawBalance);

		const calculatedRefundBalance = formatMoneyReq(saldo_refund) + formatMoneyReq(withdrawBalance);

		const reqData: iMerchantProfile = {
			...data,
			saldo_active: calculatedActiveBalance.toString(),
			saldo_refund: calculatedRefundBalance.toString(),
		};

		const sanitizedData = sanitizeVendorData(reqData);

		try {
			const response = await axiosUser(
				"PUT",
				`/api/users/${data.id}`,
				`${session && session?.jwt}`,
				sanitizedData,
			);

			if (response) {
				toast({
					title: "Sukses",
					description: "Permintaan anda akan segera diproses maksimal 2x24 jam.",
					className: eAlertType.SUCCESS,
				});
				setWithDrawBalance("");
			}
		} catch (error) {
			console.error(error);
			toast({
				title: "Gagal",
				description: "Permintaan Anda gagal di proses!",
				className: eAlertType.FAILED,
			});
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = e.target.value.replace(/\D/g, "");
		if (rawValue) {
			const formatted = rawValue === "" ? "" : formatNumberWithDots(rawValue);
			setWithDrawBalance(formatted);
		}
	};

	return (
		<>
			<Box className="lg:mt-7">
				<BankAccountDetails
					accountName={dataContent?.accountName}
					accountNumber={dataContent?.accountNumber}
					bankName={dataContent?.bankName}
				></BankAccountDetails>
				<h4 className="text-black text-[14px] lg:text-[17px] font-extrabold mt-4">Tarik Dana</h4>
				<form onSubmit={handleSubmit(onSubmit)}>
					<ItemInput label="Saldo Aktif">
						<p className="text-bold mb-0">
							Rp.
							{formatNumberWithDots(dataContent ? dataContent.saldo_active : 0)}
						</p>
					</ItemInput>
					<ItemInput label="Tarik Saldo">
						<input
							className="border border-[#ADADAD] rounded-md p-2 text-[14px] lg:text-[16px] w-full"
							onChange={handleChange}
							value={withdrawBalance || ""}
						/>
						{errorBalance && <p className="text-red-500 text-[10px] mt-2">Saldo tidak cukup</p>}
					</ItemInput>
					<div className="flex justify-end">
						<Button variant={"green"}>Tarik Saldo</Button>
					</div>
				</form>
			</Box>
		</>
	);
}
