import Basecontent from "@/components/Basecontent";
import EventList from "@/components/EventList";
import MainBanner from "@/components/MainBanner";
import { ProductList } from "@/components/product/ProductList";

export default function Home() {
  return (
    <div className="relative wrapper py-7">
      <Basecontent>
        <MainBanner />
        <EventList />
        <ProductList
          title="Untuk Anda"
          queryKey="qProductHome"
          showAllBtn={true}
          boxStyle={true}
        />
      </Basecontent>
    </div>
  );
}
