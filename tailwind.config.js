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
			padding: "2rem",
			screens: {
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
				"c-gray": "#929292",
				"c-gray-text": "#787878",
				"c-gray-text2": "#ADADAD",
				"c-green": "#CBD002",
				"c-blue": "#3E2882",
				"c-orange": "#DA7E01",
			},
			fontFamily: {
				lato: ["Lato", "sans-serif"],
				hind: ["Hind", "sans-serif"],
				kdam: ["Kdam Thmor Pro", "sans-serif"],
				inter: ["var(--font-inter)"],
				quick: ["var(--font-quicksand)"],
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};
