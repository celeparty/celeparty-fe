"use client";

import React from "react";

import Basecontent from "@/components/Basecontent";
import Box from "@/components/Box";
import { UserTransactionTable } from "@/components/profile/UserTransactionTable";
import { ProfileForm } from "@/components/profile/profile-form";
import { ProfileImageForm } from "@/components/profile/profile-image-form";

interface NotificationItem {
	title: string;
	description: string;
}

const NotificationItem: React.FC<NotificationItem> = ({ title, description }) => {
	return (
		<div className="">
			<h3 className="font-hind font-semibold text-[15px] lg:text-[12px] text-black leading-[20px]">{title}</h3>
			<p className="font-hind font-normal text-[13px] lg:text-[10px] leading-[15px] text-[#3C3C3C]">
				{description}
			</p>
		</div>
	);
};

const UserProfilePage = () => {
	return (
		<Box className="mt-0">
			<h1 className="text-[20px] lg:text-[16px] text-center lg:text-start my-4 leading-[26px] font-hind text-black font-semibold">
				Biodata Diri
			</h1>
			<div className="flex lg:flex-row flex-col lg:gap-24 gap-16">
				<div className="w-[300px] mx-auto lg:mx-0">
					<ProfileImageForm />
				</div>
				<div className="w-fit">
					<ProfileForm />
				</div>
			</div>
		</Box>
	);
};

export default UserProfilePage;
