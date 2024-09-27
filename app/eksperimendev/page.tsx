"use client";

import { useState } from "react";
import { HiOutlineMenu } from "react-icons/hi";
import { IoClose } from "react-icons/io5";

const Test = () => {
	const [data, setData] = useState(false);
	const [icons, setIcons] = useState(false);
	const [showIcon, setShowIcon] = useState(false);

	const handleButton = () => {
		setData(!data);
		setIcons(!icons);
	};
	return (
		<div className={`wrapper h-screen flex justify-center items-center`}>
			<div className={``}>
				<h1>PAGE TEST FOR BRANCH DEV</h1>
				<button className="text-center w-full mt-8" onClick={() => handleButton()}>
					{icons ? <IoClose /> : <HiOutlineMenu />}
				</button>
				{data ? <p className="mt-4">I am show because data it's true</p> : null}
			</div>
		</div>
	);
};

export default Test;
