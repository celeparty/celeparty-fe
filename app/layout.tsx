import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SessionWrapper from "@/components/SessionWrapper";
import TopHeader from "@/components/TopHeader";
import { Toaster } from "@/components/ui/toaster";
import { Inter, Quicksand } from "next/font/google";
import Script from "next/script";
import "@/public/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const quick = Quicksand({
	subsets: ["latin"],
	weight: ["500", "600", "700"],
	display: "swap",
	variable: "--font-quicksand",
});

export const metadata = {
	title: {
		default: "Celeparty",
		template: "%s | Celeparty", // semua halaman pakai format ini
	},
	description: "Event and ticketing providers",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const isProduction = process.env.PRODUCTION_MODE === "true";
	const midtransUrl = isProduction
		? "https://app.midtrans.com/snap/snap.js"
		: "https://app.sandbox.midtrans.com/snap/snap.js";
	return (
		<SessionWrapper>
			<html lang="en">
				<Script src={midtransUrl} data-client-key={process.env.NEXT_PUBLIC_CLIENT_KEY}></Script>
				<body className={`${inter.variable} ${quick.variable} font-inter`} suppressHydrationWarning={true}>
					<TopHeader />
					<Header />
					{children}
					<Footer />
					<Toaster />
				</body>
			</html>
		</SessionWrapper>
	);
}
