import React from 'react'
import Registration from "./RegMitraContent"
import Basecontent from "@/components/Basecontent"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterMitraContent() {
    return (
        <Basecontent>
            <Registration/>
        </Basecontent>
    )
}