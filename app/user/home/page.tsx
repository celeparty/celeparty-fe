"use client";

import Skeleton from "@/components/Skeleton";
import { useRouter } from "next/navigation";
import React, { useEffect } from 'react'
import { axiosUser } from "@/lib/services";
import {  useSession } from "next-auth/react";

export default function Home() {
	const router = useRouter()
	const { data: session, status } = useSession();
	
	useEffect(() => {
		if (status === "authenticated") {
			// Default behavior: check user role and redirect accordingly
			axiosUser("GET", "/api/users/me", `${session && session?.jwt}`).then((res) => {
				res?.role.type === "vendor" ? router.push("/user/vendor/profile") : router.push("/user/profile/bio")
			})
		}
	}, [status]);

	return (
		<Skeleton width="100%" height="150px" />
	)
}
