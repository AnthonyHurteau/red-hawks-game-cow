import "./assets/main.css"

import { createApp } from "vue"
import { createPinia } from "pinia"
import PrimeVue from "primevue/config"
import Listbox from "primevue/listbox"

import App from "./App.vue"
import router from "./router"
import { AppTheme } from "./theme"

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
  // Default theme configuration
  theme: {
    preset: AppTheme,
    options: {
      prefix: "p",
      darkModeSelector: "system",
      cssLayer: false
    }
  }
})
app.component("AppListbox", Listbox)

app.mount("#app")
