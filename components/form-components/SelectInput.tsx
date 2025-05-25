import { iSelectOption } from "@/lib/interfaces/iCommon";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface iSelectInputProps {
  label: string;
  options: iSelectOption[];
  onChange: (value: string) => void;
  value: string;
}

export const SelectInput: React.FC<iSelectInputProps> = ({
  label,
  options,
  onChange,
  value,
}) => {
  return (
    <>
      <Select onValueChange={(e) => onChange(e)} value={value ?? ""}>
        <SelectTrigger>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt, index) => (
            <React.Fragment key={index}>
              <SelectItem value={opt.value}>{opt.label}</SelectItem>
            </React.Fragment>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};
