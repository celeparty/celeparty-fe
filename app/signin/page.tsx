import Image from "next/image";
import Link from "next/link";

const Login = () => {
  return (
    <div className="mt-8">
      <h1 className="font-hind font-semibold text-[24px]">Login</h1>
      <div className="mt-2 flex flex-col gap-4 [&_input]:text-black [&_input]:rounded-lg [&_input]:box-border [&_input]:p-2 [&_input]:font-light [&_input]:font-hind [&_input]:text-[14px]">
        <input type="text" placeholder="Alamat Email" />
        <input type="password" placeholder="Kata Sandi" />
      </div>
      <div className="flex justify-end mt-2">
        <Link
          href={"/"}
          className="font-hind font-semibold text-[12px] text-c-orange"
        >
          Lupa Kata Sandi?
        </Link>
      </div>
      <div className="mt-4">
        <div className="font-hind font-normal text-[10px] flex items-center justify-center gap-2">
          <div className="w-[43px] h-[2px] bg-white"></div>
          OR
          <div className="w-[43px] h-[2px] bg-white"></div>
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-8">
        <Link href={"/"}>
          <Image
            src={"/images/geogle.png"}
            width={30}
            height={30}
            alt="Geogle Image"
          />
        </Link>
        <Link href={"/"}>
          <Image
            src={"/images/phone.png"}
            width={41}
            height={35}
            alt="Phone Image"
          />
        </Link>
      </div>
      <div className="mt-7 flex justify-center">
        <div className="flex flex-col gap-2 justify-center">
          <button className="w-[172px] h-[42px] text-center text-white rounded-full bg-c-green">
            Login
          </button>
          <p className="font-hind font-semibold text-[12px]">
            Belum punya akun?{" "}
            <Link href={"/signup"} className="text-c-orange">
              Registrasi
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const SignIn = () => {
  return (
    <div className="my-10 w-[973px] h-[745px] bg-c-blue rounded-lg mx-auto text-white">
      <div className="w-[260px] mx-auto py-8">
        <div>
          <div className="flex justify-center">
            <Image
              src={"/images/cake-color.png"}
              width={111}
              height={80}
              alt="Cake Color.."
            />
          </div>
          <h1 className="font-lato font-semibold text-[26px] leading-[30px] text-center mt-4">
            CELEPARTY
          </h1>
          <Login />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
