/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    purple: '#7C2AE8',
                    midBlue: '#374FD9',
                    midBlueDark: '#2F42C7',
                    midBlueLight: '#7B8EF5',
                    cyan: '#0EC8FC',
                }
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #7C2AE8 0%, #374FD9 75%, #0EC8FC 100%)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Poppins', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
