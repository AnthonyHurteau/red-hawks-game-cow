<script setup lang="ts">
import { RouterView } from "vue-router"
import HeaderBar from "./components/HeaderBar.vue"
import { onMounted } from "vue"
import { useUserStore } from "./stores/user"
import { useVotesStore } from "./stores/votes"
import { useGamesStore } from "./stores/game"

const gameStore = useGamesStore()
const userStore = useUserStore()
const votesStore = useVotesStore()

onMounted(() => {
  gameStore.getActiveGame()
  userStore.getUser()

  if (gameStore.activeGame && !gameStore.activeGame.isVoteComplete) {
    votesStore.getVote()
  }
})

gameStore.$subscribe((mutation, state) => {
  if (state.activeGame && !state.activeGame.isVoteComplete) {
    votesStore.getVote()
  }
})
</script>

<template>
  <HeaderBar />

  <div class="h-[calc(100vh-80px)]">
    <RouterView />
  </div>
</template>
