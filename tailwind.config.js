import { figmaTheme } from "./lib/tailwind-theme.js";

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./messages/**/*.{json,js,ts}",
    "node_modules/shadcn-ui/dist/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        ...figmaTheme.color,
        button: figmaTheme.button,
        field: figmaTheme.field,
        input: figmaTheme.input,
        card: figmaTheme.card,
        modal: figmaTheme.modal,
        drawer: figmaTheme.drawer,
        alert: figmaTheme.alert,
        badge: figmaTheme.badge,
        tab: figmaTheme.tab,
        chip: figmaTheme.chip,
        navbar: figmaTheme.navbar,
        seat: figmaTheme.seat,
        "status-pill": figmaTheme["status-pill"],
      },
      borderRadius: {
        'button-radius': figmaTheme.button.radius,
        'field-radius': figmaTheme.field.radius,
        'card-radius': figmaTheme.card.radius,
        'badge-radius': figmaTheme.badge.radius,
        'tab-radius': figmaTheme.tab.radius,
        'chip-filter-radius': figmaTheme.chip.filter.radius,
        'seat-radius': figmaTheme.seat.radius,
        'status-pill-radius': figmaTheme['status-pill'].radius,
      }
    },
  },
  plugins: [
  ],
}

export default config
