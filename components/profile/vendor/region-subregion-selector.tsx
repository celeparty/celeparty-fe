import React, { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import _ from "lodash";
import { iSelectOption } from "@/lib/interfaces/iCommon";
import { axiosRegion } from "@/lib/services";
import { SelectInput } from "@/components/form-components/SelectInput";

interface RegionSubregionSelectorProps {
  index: number;
  provinceOptions: iSelectOption[];
}

const RegionSubregionSelector: React.FC<RegionSubregionSelectorProps> = ({
  index,
  provinceOptions,
}) => {
  const { control, watch, setValue } = useFormContext();
  const [subregionOptions, setSubregionOptions] = useState<iSelectOption[]>([]);

  const regionValue = watch(`serviceLocation.${index}.region`);

  // useEffect(() => {
  //   const fetchSubregion = async () => {
  //     if (!regionValue) return;
  //     try {
  //       const response = await axiosRegion("GET", "kabupaten", regionValue);
  //       setSubregionOptions(
  //         (response?.value || []).map((item: any) => ({
  //           label: item.name,
  //           value: item.id,
  //         }))
  //       );
  //       setValue(`serviceLocation.${index}.subregion`, "");
  //     } catch (error) {
  //       console.error("Error fetching subregions:", error);
  //     }
  //   };

  //   fetchSubregion();
  // }, [regionValue]);

  useEffect(() => {
    console.log(regionValue);
  }, [provinceOptions]);

  return (
    <div className="flex gap-2 w-full">
      <div className="w-[50%] mb-2">
        <Controller
          name={`serviceLocation.${index}.region`}
          control={control}
          render={({ field }) => (
            <SelectInput
              label="Provinsi"
              onChange={field.onChange}
              value={field.value}
              options={provinceOptions}
            />
          )}
        />
      </div>

      <div className="w-[50%] mb-2">
        <Controller
          name={`serviceLocation.${index}.subregion`}
          control={control}
          render={({ field }) => (
            <SelectInput
              label="Kabupaten"
              onChange={field.onChange}
              value={field.value}
              options={subregionOptions}
            />
          )}
        />
      </div>
    </div>
  );
};

export default RegionSubregionSelector;
