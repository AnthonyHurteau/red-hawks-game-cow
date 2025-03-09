import { getItem, setItem } from "@/services/localStorage"
import { defineStore } from "pinia"
import { ref } from "vue"

const DARK_MODE_KEY = "rhgc-dark"

export const useConfigStore = defineStore("config", () => {
  const isDarkMode = ref<boolean>(false)

  function getInitialTheme() {
    const storageDarkMode = getItem<boolean>(DARK_MODE_KEY)

    if (storageDarkMode !== null) {
      isDarkMode.value = storageDarkMode
      document.documentElement.classList.toggle(DARK_MODE_KEY, isDarkMode.value)
    }
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    document.documentElement.classList.toggle(DARK_MODE_KEY)
    setItem(DARK_MODE_KEY, isDarkMode.value)
  }

  return {
    isDarkMode,
    getInitialTheme,
    toggleDarkMode
  }
})
