/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx, js,jsx}",
		"./components/**/*.{ts,tsx, js, jsx}",
		"./app/**/*.{ts,tsx, js, jsx}",
		"./src/**/*.{ts,tsx, js, jsx}",
	],
	theme: {
		container: {
			center: true,
			padding: "1rem",
			screens: {
				sm: "640px",
				md: "768px",
				lg: "1024px",
				xl: "1280px",
				"2xl": "1400px",
			},
		},
		extend: {
			keyframes: {
				"accordion-down": {
					from: { height: 0 },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: 0 },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
			colors: {
				"c-black": "#000000",
				"c-gray": "#929292",
				"c-gray-text": "#787878",
				"c-gray-text2": "#ADADAD",
				"c-green": "#CBD002",
				"c-blue": "#3E2882",
				"c-orange": "#DA7E01",
				"c-red": "#d41f31",

				// Extended Color Palette
				"c-blue-light": "#5A3A9C",
				"c-blue-dark": "#2A1B5A",
				"c-orange-light": "#E6931A",
				"c-orange-dark": "#B85A00",
				"c-green-light": "#D4E300",
				"c-green-dark": "#A8B800",

				// Neutral Colors
				"c-gray-50": "#FAFAFA",
				"c-gray-100": "#F5F5F5",
				"c-gray-200": "#E5E5E5",
				"c-gray-300": "#D4D4D4",
				"c-gray-400": "#A3A3A3",
				"c-gray-500": "#737373",
				"c-gray-600": "#525252",
				"c-gray-700": "#404040",
				"c-gray-800": "#262626",
				"c-gray-900": "#171717",
			},
			fontFamily: {
				lato: ["Lato", "sans-serif"],
				hind: ["Hind", "sans-serif"],
				kdam: ["Kdam Thmor Pro", "sans-serif"],
				inter: ["var(--font-inter)"],
				quick: ["var(--font-quicksand)"],
			},
			fontSize: {
				// Consistent typography scale
				"xs": ["0.75rem", { lineHeight: "1rem" }],
				"sm": ["0.875rem", { lineHeight: "1.25rem" }],
				"base": ["1rem", { lineHeight: "1.5rem" }],
				"lg": ["1.125rem", { lineHeight: "1.75rem" }],
				"xl": ["1.25rem", { lineHeight: "1.75rem" }],
				"2xl": ["1.5rem", { lineHeight: "2rem" }],
				"3xl": ["1.875rem", { lineHeight: "2.25rem" }],
				"4xl": ["2.25rem", { lineHeight: "2.5rem" }],
				"5xl": ["3rem", { lineHeight: "1" }],
				"6xl": ["3.75rem", { lineHeight: "1" }],
			},
			spacing: {
				// Consistent spacing scale (4px increments)
				"18": "4.5rem",
				"22": "5.5rem",
				"26": "6.5rem",
				"30": "7.5rem",
				"34": "8.5rem",
				"38": "9.5rem",
				"42": "10.5rem",
				"46": "11.5rem",
				"50": "12.5rem",
				"54": "13.5rem",
				"58": "14.5rem",
				"62": "15.5rem",
				"66": "16.5rem",
				"70": "17.5rem",
				"74": "18.5rem",
				"78": "19.5rem",
				"82": "20.5rem",
				"86": "21.5rem",
				"90": "22.5rem",
				"94": "23.5rem",
				"98": "24.5rem",
				"102": "25.5rem",
			},
			borderRadius: {
				"4xl": "2rem",
			},
			boxShadow: {
				"soft": "0 2px 15px rgba(0, 0, 0, 0.08)",
				"medium": "0 4px 25px rgba(0, 0, 0, 0.12)",
				"strong": "0 8px 40px rgba(0, 0, 0, 0.16)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};
