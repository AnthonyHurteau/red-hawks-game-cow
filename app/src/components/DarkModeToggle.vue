<script setup lang="ts">
import { useConfigStore } from "@/stores/config"

const configStrore = useConfigStore()
const darkMode = "Mode sombre"
const lightMode = "Mode clair"
</script>

<template>
  <li
    class="flex items-center cursor-pointer p-4 rounded-border border-2 border-primary shadow-md text-surface-700 hover:bg-surface-100 dark:text-surface-0 dark:hover:bg-surface-800 duration-150 transition-colors p-ripple"
    @click="configStrore.toggleDarkMode()"
  >
    <i :class="[configStrore.isDarkMode ? 'pi pi-sun' : 'pi pi-moon', 'pr-2']"></i>
    <span class="font-medium">{{ configStrore.isDarkMode ? lightMode : darkMode }}</span>
  </li>
</template>
