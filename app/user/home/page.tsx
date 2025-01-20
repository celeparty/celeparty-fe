"use client";

import Skeleton from "@/components/Skeleton";
import { useRouter } from "next/navigation";
import React, { useEffect } from 'react'

export default function Home() {
	const router = useRouter()
	useEffect(() => {
		router.push("/user/profile")
	},[])
	return (
		<Skeleton width="100%" height="150px" />
	)
}
