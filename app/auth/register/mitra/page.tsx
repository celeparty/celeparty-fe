import Basecontent from "@/components/Basecontent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Registration from "./RegMitraContent";

export default function RegisterMitraContent() {
	return (
		<Basecontent>
			<Registration />
		</Basecontent>
	);
}
