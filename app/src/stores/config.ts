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
    } else {
      const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
      isDarkMode.value = prefersDarkMode
    }

    setDocumentTheme()
  }

  function toggleDarkMode() {
    isDarkMode.value = !isDarkMode.value
    setItem(DARK_MODE_KEY, isDarkMode.value)
    setDocumentTheme()
  }

  const setDocumentTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add(DARK_MODE_KEY)
    } else {
      document.documentElement.classList.remove(DARK_MODE_KEY)
    }
  }

  return {
    isDarkMode,
    getInitialTheme,
    toggleDarkMode
  }
})
