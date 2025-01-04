/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: 'class', // Используем классовый метод
	content: [
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',
		'./app/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
			colors: {
				blue: {
					500: '#3b82f6',
					600: '#2563eb',
				},
				green: {
					500: '#10b981',
					600: '#059669',
				},
				red: {
					500: '#ef4444',
					600: '#dc2626',
				},
				purple: {
					500: '#8b5cf6',
					600: '#7c3aed',
				},
			},
		},
	},
	plugins: [],
};
