import { iSelectOption } from "@/lib/interfaces/iCommon";
import { MapPin } from "lucide-react";
import { SelectInput } from "../form-components/SelectInput";

interface iLocationFilterBarProps {
  setSelectedLocation: (value: string) => void;
  selectedLocation: string;
  options: iSelectOption[];
}
export const LocationFilterBar: React.FC<iLocationFilterBarProps> = ({
  selectedLocation,
  options,
  setSelectedLocation,
}) => {
  return (
    <>
      <div className="flex items-center">
        <div className="w-[35px]">
          <MapPin />
        </div>
        <SelectInput
          options={options}
          label="Pilih Lokasi Acara"
          onChange={(value) => {
            if (value) {
              setSelectedLocation(value);
            }
          }}
          value={selectedLocation}
        ></SelectInput>
      </div>
    </>
  );
};
