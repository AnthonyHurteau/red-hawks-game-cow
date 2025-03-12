import { defineConfig, Preset } from "@vite-pwa/assets-generator/config"

const minimal2023Preset: Preset = {
  transparent: {
    sizes: [64, 192, 512],
    favicons: [[48, "favicon.ico"]]
  },
  maskable: {
    sizes: [512]
  },
  apple: {
    sizes: [180]
  },
  png: {
    compressionLevel: 6,
    quality: 100
  }
}

export default defineConfig({
  headLinkOptions: {
    preset: "2023"
  },
  preset: minimal2023Preset,

  images: ["public/pwa-icon.png"]
})
