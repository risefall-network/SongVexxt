import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Cyberpunk colors
        'cyber-dark': 'hsl(var(--cyber-dark))',
        'cyber-purple': 'hsl(var(--cyber-purple))',
        'cyber-purple-light': 'hsl(var(--cyber-purple-light))',
        'cyber-blue': 'hsl(var(--cyber-blue))',
        'cyber-blue-light': 'hsl(var(--cyber-blue-light))',
        'neon-blue': 'hsl(var(--neon-blue))',
        'neon-cyan': 'hsl(var(--neon-cyan))',
        'neon-purple': 'hsl(var(--neon-purple))',
        'neon-pink': 'hsl(var(--neon-pink))',
        'neon-gold': 'hsl(var(--neon-gold))',
      },
      fontFamily: {
        cyber: ['var(--font-cyber)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
      },
      boxShadow: {
        'neon-blue': '0 0 20px hsl(var(--neon-blue) / 0.5)',
        'neon-purple': '0 0 20px hsl(var(--neon-purple) / 0.5)',
        'neon-cyan': '0 0 20px hsl(var(--neon-cyan) / 0.5)',
        'cyber-glow': '0 0 30px hsl(var(--neon-blue) / 0.3)',
        'inner-glow': 'inset 0 0 20px hsl(var(--neon-blue) / 0.1)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "pulse-neon": {
          from: { boxShadow: '0 0 20px hsl(var(--neon-blue) / 0.3)' },
          to: { boxShadow: '0 0 30px hsl(var(--neon-blue) / 0.7)' },
        },
        "glow": {
          from: { textShadow: '0 0 10px hsl(var(--neon-blue) / 0.5)' },
          to: { textShadow: '0 0 20px hsl(var(--neon-blue) / 0.8)' },
        },
        "slide-up": {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        "fade-in": {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-neon": "pulse-neon 2s ease-in-out infinite alternate",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
