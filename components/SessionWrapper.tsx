// mark as client component
"use client";
import { SessionProvider, useSession } from "next-auth/react";
import type React from "react";

const SessionWrapper = ({ children }: { children: React.ReactNode }) => {
	return <SessionProvider>{children}</SessionProvider>;
};

export default SessionWrapper;
