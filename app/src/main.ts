import "./assets/main.css"

import { createApp } from "vue"
import { createPinia } from "pinia"
import PrimeVue from "primevue/config"
import Listbox from "primevue/listbox"

import App from "./App.vue"
import router from "./router"
import { AppTheme } from "./theme"
import ProgressSpinner from "primevue/progressspinner"
import Drawer from "primevue/drawer"
import Button from "primevue/button"

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
      cssLayer: {
        name: "primevue",
        order: "tailwind-base, primevue, tailwind-utilities"
      }
    }
  }
})
app.component("AppButton", Button)
app.component("AppListbox", Listbox)
app.component("AppProgressSpinner", ProgressSpinner)
app.component("AppDrawer", Drawer)

app.mount("#app")
