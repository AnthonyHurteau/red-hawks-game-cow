<script setup lang="ts">
import { RouterView } from "vue-router"
import HeaderBar from "./components/HeaderBar.vue"
</script>

<template>
  <div class="bg-surface-900 h-screen">
    <HeaderBar />

    <RouterView />
  </div>
</template>

<style scoped></style>
