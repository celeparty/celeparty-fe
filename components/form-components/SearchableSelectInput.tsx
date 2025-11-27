import React from "react";
import Select from "react-select";

interface iSearchableSelectInputProps {
	label: string;
	options: { label: string; value: string }[];
	onChange: (value: string) => void;
	value: string;
	placeholder?: string;
	required?: boolean;
	showLabel?: boolean;
}

export const SearchableSelectInput: React.FC<iSearchableSelectInputProps> = ({
	label,
	options,
	onChange,
	value,
	placeholder,
	required = false,
	showLabel = true,
}) => {
	const selectedOption = options.find((option) => option.value === value) || null;

	const customStyles = {
		control: (provided: any, state: any) => ({
			...provided,
			border: "1px solid #d1d5db",
			borderRadius: "0.375rem",
			padding: "0.125rem 0.75rem",
			fontSize: "0.875rem",
			lineHeight: "1.25rem",
			minHeight: "2.5rem",
			boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
			"&:hover": {
				borderColor: "#9ca3af",
			},
		}),
		menu: (provided: any) => ({
			...provided,
			borderRadius: "0.375rem",
			border: "1px solid #d1d5db",
			boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
		}),
		option: (provided: any, state: any) => ({
			...provided,
			backgroundColor: state.isSelected ? "#3b82f6" : state.isFocused ? "#eff6ff" : "white",
			color: state.isSelected ? "white" : "#374151",
			cursor: "pointer",
			"&:active": {
				backgroundColor: "#3b82f6",
				color: "white",
			},
		}),
	};

	return (
		<div className="mb-4">
			{showLabel && (
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{label}
					{required && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}
			<Select
				value={selectedOption}
				onChange={(selected) => onChange(selected?.value || "")}
				options={options}
				placeholder={placeholder || `Pilih ${label}`}
				isSearchable={true}
				styles={customStyles}
				className="w-full"
			/>
		</div>
	);
};
