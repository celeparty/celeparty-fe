"use client";

import Skeleton from "@/components/Skeleton";
import { useRouter } from "next/navigation";

import React, { useEffect } from "react";

export default function User() {
    const router = useRouter();

	useEffect(()=> {
		router.push("/user/home")
	},[])

	return <Skeleton width="100%" height="150px" />
}
