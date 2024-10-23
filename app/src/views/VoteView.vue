<script setup lang="ts">
import PlayerList from "../components/PlayerList.vue"
import { onMounted } from "vue"
import VoteTitle from "@/components/VoteTitle.vue"
import { useActiveGameStore } from "@/stores/activeGame"

const activeGameStore = useActiveGameStore()

onMounted(() => {
  activeGameStore.getActiveGame()
})
</script>

<template>
  <main>
    <VoteTitle />
    <div
      v-if="activeGameStore.activeGame?.players.length === 0"
      class="h-[calc(100vh-210px)] flex justify-center items-center"
    >
      <AppProgressSpinner />
    </div>
    <PlayerList v-else />
  </main>
</template>
