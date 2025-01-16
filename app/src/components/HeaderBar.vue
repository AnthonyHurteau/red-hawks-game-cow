<script setup lang="ts">
import AppLogo from "./AppLogo.vue"
import NavDrawer from "./NavDrawer.vue"
</script>

<template>
  <header
    class="sticky top-0 w-full h-20 z-10 flex items-center justify-between bg-primary mb-3 shadow-lg"
  >
    <div class="px-2 flex items-center justify-start">
      <AppLogo />
    </div>
    <div class="flex pr-5">
      <NavDrawer />
    </div>
  </header>
</template>
