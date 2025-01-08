<script setup lang="ts">
import AppLoading from "@/components/AppLoading.vue"
import PlayerList from "../components/PlayerList.vue"
import VoteTitle from "@/components/VoteTitle.vue"
import { useActiveGameStore } from "@/stores/activeGame"

const activeGameStore = useActiveGameStore()
</script>

<template>
  <main class="min-h-full flex flex-col">
    <VoteTitle />
    <AppLoading v-if="activeGameStore.loading" />
    <div
      v-else-if="!activeGameStore.activeGame"
      class="flex justify-center items-center grow"
    >
      <h1 class="text-2xl">Aucun vote n'a été activé!</h1>
    </div>
    <PlayerList v-else />
  </main>
</template>
