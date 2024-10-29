<script setup lang="ts">
import { ref } from "vue"
import CowIcon from "./CowIcon.vue"
import { useActiveGameStore } from "@/stores/activeGame"

const activeGameStore = useActiveGameStore()
const selectedPlayer = ref()
</script>

<template>
  <AppListbox
    v-model="selectedPlayer"
    :options="activeGameStore.activeGame?.players"
    optionLabel="id"
    scrollHeight="calc(95vh - 210px)"
    class="w-full bg-transparent border-0 px-5"
  >
    <template #option="slotProps">
      <div
        class="flex w-full h-12 items-center justify-around rounded-border border-2 border-primary shadow-xl"
      >
        <div class="basis-1/12">
          {{ slotProps.option.position }}
        </div>
        <div class="basis-8/12">
          {{ slotProps.option.firstName }} {{ slotProps.option.lastName }}
        </div>
        <div
          v-if="slotProps.selected"
          class="basis-2/12"
        >
          <CowIcon />
        </div>
        <div
          v-else
          class="basis-2/12"
        ></div>
      </div>
    </template>
  </AppListbox>
</template>
