import Basecontent from "@/components/Basecontent";
import EventList from "@/components/EventList";
import MainBanner from "@/components/MainBanner";
import { ProductList } from "@/components/product/ProductList";

export const metadata = {
	title: "Beranda", // hasil akhir = "Beranda | Celeparty"
	description: "Temukan event seru dan sewa peralatan event terbaik di Celeparty.",
};

export default function Home() {
	return (
		<div className="relative wrapper py-8 lg:py-12">
			<Basecontent>
				<MainBanner />
				<div className="mt-8 lg:mt-12">
					<EventList />
				</div>
				<div className="mt-8 lg:mt-12">
					<ProductList title="Untuk Anda" queryKey="qProductHome" showAllBtn={true} boxStyle={true} />
				</div>
			</Basecontent>
		</div>
	);
}
