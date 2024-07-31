import { BiSolidError } from "react-icons/bi";

export default function ErrorNetwork(props: any) {
    return (
        <div className={`relative flex justify-center p-5 bg-gray-200 w-full  gap-1 items-center wrapper ${props.style ? props.style : "my-7"}`}><BiSolidError className="text-yellow-500" /> Error Network</div>
    )
}
