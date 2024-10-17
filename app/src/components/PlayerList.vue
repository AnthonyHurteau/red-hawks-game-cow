<script setup lang="ts">
import { usePlayersStore } from "@/stores/players"
import { ref } from "vue"
import CowIcon from "./CowIcon.vue"

const playerStore = usePlayersStore()
const selectedPlayer = ref()
</script>

<template>
  <AppListbox
    v-model="selectedPlayer"
    :options="playerStore.players"
    optionLabel="id"
    scrollHeight="100%"
    class="w-full bg-transparent border-0"
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
        <div v-if="slotProps.selected" class="basis-2/12"><CowIcon /></div>
        <div v-else class="basis-2/12"></div>
      </div>
    </template>
  </AppListbox>
</template>
