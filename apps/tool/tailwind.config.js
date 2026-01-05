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
                    cyan: '#0EC8FC',
                }
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #7C2AE8, #374FD9, #0EC8FC)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Poppins', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
