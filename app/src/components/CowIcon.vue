<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"

const props = defineProps<{
  cowType: "vote" | "win"
}>()

const getRandomInterval = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

let cowNumber: 1 | 2 = getRandomInterval(1, 2) as 1 | 2
let intervalId: number | undefined

const getCowImageUrl = (): string => {
  return new URL(`../assets/${props.cowType}-cow-${cowNumber}.png`, import.meta.url).href
}

const cowImage = ref(getCowImageUrl())

const startRandomInterval = () => {
  intervalId = setInterval(
    () => {
      cowNumber = cowNumber === 1 ? 2 : 1
      cowImage.value = getCowImageUrl()
      clearInterval(intervalId)
      startRandomInterval()
    },
    getRandomInterval(1000, 3000)
  )
}

onMounted(() => {
  startRandomInterval()
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="animate-fadein animate-once animate-duration-700">
    <img
      alt="Cow icon"
      :src="cowImage"
      width="50"
      height="50"
      class="animate-bounce pt-6"
    />
  </div>
</template>
