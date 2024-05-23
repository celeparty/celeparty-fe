import Link from "next/link";

const Registration = () => {
  return (
    <div>
      <h1 className="mb-4">Registrasi</h1>
      <div className="[&_input]:text-black flex flex-col gap-4 [&_input]:rounded-lg [&_input]:box-border [&_input]:p-2 [&_input]:font-light [&_input]:font-hind [&_input]:text-[14px]">
        <input type="text" placeholder="Nama Lengkap" />
        <input type="text" placeholder="Email" />
        <input type="text" placeholder="No Telpon" />
        <input type="password" placeholder="Kata Sandi" />
        <input type="password" placeholder="Ulangin Kata Sandi" />
      </div>
      <div className="mt-16 flex justify-center">
        <div className="flex flex-col gap-2 justify-center">
          <button className="w-[172px] h-[42px] text-center text-white rounded-full bg-c-green">
            Register
          </button>
          <p className="font-hind font-semibold text-[12px]">
            Sudah punya akun?{" "}
            <Link href={"/signin"} className="text-c-orange">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const SignUp = () => {
  return (
    <div className="my-10 w-[973px] h-[745px] bg-c-blue rounded-lg mx-auto text-white">
      <div className="w-[260px] mx-auto py-14">
        <Registration />
      </div>
    </div>
  );
};

export default SignUp;
