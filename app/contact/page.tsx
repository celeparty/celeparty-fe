import Image from "next/image";
import Link from "next/link";

const TopContactPage = () => {
  return (
    <div className="bg-[url('/images/contact.png')] w-full h-screen bg-no-repeat bg-cover relative">
      <div className="wrapper py-16">
        <div className="flex lg:block justify-center">
          <div className="flex gap-2">
            <p className="text-white">CELEPARTY</p>
            <div>
              <Image
                src={"/images/img-in-contact.png"}
                width={12}
                height={32}
                alt="Img in Contact.."
              />
            </div>
          </div>
        </div>
        <div className="flex lg:flex-row flex-col justify-between mt-4 lg:mt-0">
          <div>
            <h1 className="font-quick font-semibold text-[40px] lg:text-[56px] lg:text-start text-center leading-[70px] text-white">
              LET’S HEAR <br /> FROM YOU
            </h1>
          </div>
          <div>
            <PhoneContact />
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-2 lg:pt-20">
        <Link href={"/"}>
          <Image
            src={"/images/wa-item.png"}
            width={307}
            height={94}
            alt="Wa Image"
          />
        </Link>
      </div>
    </div>
  );
};

const BottomContactPage = () => {
  return (
    <div className="bg-c-blue">
      <div className="wrapper flex justify-center py-20">
        <p className="text-center text-white px-4 lg:px-0 font-quick font-normal lg:font-semibold text-[18px] lg:text-[16px] leading-[20px]">
          "Kami memahami betapa pentingnya setiap momen spesial dalam hidupmu.{" "}
          <br />
          Itulah alasan mengapa Celeparty hadir untuk mewujudkannya."
        </p>
      </div>
    </div>
  );
};

const PhoneContact = () => {
  return (
    <div className="">
      <div className="font-quick font-bold [&_p]:font-semibold [&_p]:text-[20px] text-[26px] leading-[32px] text-white flex flex-col gap-4">
        <div className="text-center lg:text-start">
          <h1>Mobile Number</h1>
          <p>+6285721705354</p>
        </div>
        <div className="text-center lg:text-start">
          <h1>Office Address</h1>
          <p>
            jl. Martasik No 10B <br />
            Cimahi, Jawa Barat, Indonesia
          </p>
        </div>
        <div className="text-center lg:text-start">
          <h1>E-mail Address</h1>
          <p>Celeparty.id@gmail.com</p>
        </div>
      </div>
    </div>
  );
};

const ContactPage = () => {
  return (
    <div>
      <TopContactPage />
      <BottomContactPage />
    </div>
  );
};

export default ContactPage;
