import Image from "next/image";

const IconLowerAbout = () => {
  return (
    <div className="py-28 flex justify-center">
      <div>
        <Image
          src={"/images/icon-about.png"}
          width={956}
          height={134}
          alt="IconLowerAbout.."
        />
      </div>
    </div>
  );
};

const LowerAbout = () => {
  return (
    <div className="bg-c-blue px-4 lg:px-0">
      <div className="wrapper py-20">
        <div className="text-white flex flex-col lg:flex-row gap-4 lg:gap-0 justify-between">
          <h1 className="font-quick font-semibold text-[50px] leading-[62px]">
            APA ITU <br /> CELEPARTY?
          </h1>
          <p className="font-quick font-semibold text-[20px] leading-[30px] text-start lg:text-end">
            Sebuah platform untuk membantu kamu merencanakan <br /> acara
            impianmu dengan mudah, dengan beragam produk <br /> dan layanan yang
            berkualitas, dengan alur yang mudah <br /> untuk membantu kamu
            merencanakan acara dengan cepat..
          </p>
        </div>
        <div className="lg:block hidden">
          <IconLowerAbout />
        </div>
        <div className="flex justify-center text-white">
          <p className="text-center pt-20 lg:pt-0 font-quick font-bold text-[16px] leading-[20px]">
            "Kami memahami betapa pentingnya setiap momen spesial dalam hidupmu.{" "}
            <br /> Itulah alasan mengapa Celeparty hadir untuk mewujudkannya."
          </p>
        </div>
      </div>
    </div>
  );
};

const MainAbout = () => {
  return (
    <div className="wrapper font-quick font-semibold text-[56px] leading-[70px] text-white">
      BUAT MOMEN <br /> BERKESAN DENGAN <br /> CELEPARTY
    </div>
  );
};

const AboutPage = () => {
  return (
    <div>
      <div className="bg-[url('/images/about.png')] w-[500px] h-[600px] lg:w-[1300px] lg:h-[600px] bg-no-repeat bg-cover lg:bg-cover">
        {/* <h1 className="text-white text-center pt-20">About Us</h1> */}
        <div className="lg:pt-48 pt-32 px-4 lg:px-0">
          <MainAbout />
        </div>
      </div>
      <LowerAbout />
    </div>
  );
};

export default AboutPage;
