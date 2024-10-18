import { definePreset } from "@primevue/themes"
import Aura from "@primevue/themes/aura"

export const AppTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fba6a6",
      400: "#f77272",
      500: "#ee4545",
      600: "#da2828",
      700: "#b81d1d",
      800: "#981c1c",
      900: "#6e1a1a",
      950: "#450a0a"
    },
    colorScheme: {
      light: {
        primary: {
          color: "{primary.900}",
          inverseColor: "#ffffff",
          hoverColor: "{primary.700}",
          activeColor: "{primary.400}"
        },
        highlight: {
          background: "{zinc.950}",
          focusBackground: "{zinc.700}",
          color: "#ffffff",
          focusColor: "#ffffff"
        },
        content: {
          background: "{surface.0}",
          hoverBackground: "{surface.100}",
          borderColor: "{surface.200}",
          color: "{text.color}",
          hoverColor: "{text.hover.color}"
        },
        surface: {
          0: "#ffffff",
          50: "{zinc.50}",
          100: "{zinc.100}",
          200: "{zinc.200}",
          300: "{zinc.300}",
          400: "{zinc.400}",
          500: "{zinc.500}",
          600: "{zinc.600}",
          700: "{zinc.700}",
          800: "{zinc.800}",
          900: "{zinc.900}",
          950: "{zinc.950}"
        }
      },
      dark: {
        primary: {
          color: "{primary.900}",
          inverseColor: "#ffffff",
          hoverColor: "{primary.700}",
          activeColor: "{primary.400}"
        },
        highlight: {
          background: "color-mix(in srgb, {primary.950}, transparent 75%)",
          focusBackground: "color-mix(in srgb, {primary.400}, transparent 76%)",
          color: "rgba(255,255,255,.87)",
          focusColor: "rgba(255,255,255,.87)"
        },
        content: {
          background: "{surface.900}",
          hoverBackground: "{surface.800}",
          borderColor: "{primary.900}",
          color: "{text.color}",
          hoverColor: "{text.hover.color}"
        },
        surface: {
          0: "#ffffff",
          50: "{zinc.50}",
          100: "{zinc.100}",
          200: "{zinc.200}",
          300: "{zinc.300}",
          400: "{zinc.400}",
          500: "{zinc.500}",
          600: "{zinc.600}",
          700: "{zinc.700}",
          800: "{zinc.800}",
          900: "{zinc.900}",
          950: "{zinc.950}"
        }
      }
    }
  }
})
