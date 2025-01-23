<script setup lang="ts">
import { useRouter } from "vue-router"
import AppLogo from "./AppLogo.vue"
import NavDrawer from "./NavDrawer.vue"
import { ROUTE_NAMES } from "@/router"
import { ref } from "vue"

const router = useRouter()
const isPressing = ref(false)
const pressTimer = ref<number | null>(null)
const pressStartTime = ref<number>(0)

const handlePressStart = () => {
  isPressing.value = true
  pressStartTime.value = Date.now()

  pressTimer.value = setTimeout(() => {
    if (isPressing.value) {
      router.push({ name: ROUTE_NAMES.ADMIN })
    }
  }, 2000)
}

const handlePressEnd = () => {
  isPressing.value = false
  if (pressTimer.value) {
    clearTimeout(pressTimer.value)
    if (Date.now() - pressStartTime.value < 500) {
      router.push({ name: ROUTE_NAMES.VOTE })
    }
  }
}
</script>

<template>
  <header
    class="sticky top-0 w-full h-20 z-10 flex items-center justify-between bg-primary mb-3 shadow-lg"
  >
    <div class="px-2 flex items-center justify-start">
      <div
        :class="{ 'opacity-50': isPressing }"
        class="transition-opacity duration-300 ease-in-out"
        @mousedown="handlePressStart"
        @mouseup="handlePressEnd"
        @mouseleave="handlePressEnd"
        @touchstart="handlePressStart"
        @touchend="handlePressEnd"
        @contextmenu="($event) => $event.preventDefault()"
      >
        <AppLogo />
      </div>
    </div>
    <div class="flex pr-5">
      <NavDrawer />
    </div>
  </header>
</template>
