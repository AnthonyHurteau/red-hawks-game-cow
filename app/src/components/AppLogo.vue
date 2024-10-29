<script setup lang="ts">
const { size = 80 } = defineProps<{
  size?: number
}>()
</script>

<template>
  <img
    alt="Red Hawks logo"
    class="rounded-border"
    src="@/assets/logo.jpg"
    :width="size"
    :height="size"
  />
</template>
