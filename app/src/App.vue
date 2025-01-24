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
  <div class="grid grid-rows-10 h-screen">
    <header class="row-span-1">
      <HeaderBar />
    </header>

    <main class="row-span-9">
      <RouterView />
    </main>
  </div>
</template>
