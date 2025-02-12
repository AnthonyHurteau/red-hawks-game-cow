<script setup lang="ts">
import { RouterView } from "vue-router"
import HeaderBar from "./components/HeaderBar.vue"
import { onMounted } from "vue"
import { useGameStore } from "./stores/game"
import { useUserStore } from "./stores/user"
import { useVoteStore } from "./stores/vote"

const gameStore = useGameStore()
const userStore = useUserStore()
const voteStore = useVoteStore()

onMounted(async () => {
  await userStore.getUser()
})

userStore.$subscribe(async (mutation, state) => {
  if (state.user) {
    await gameStore.getActiveGame()
  }
})

gameStore.$subscribe(async (mutation, state) => {
  if (state.activeGame && !state.activeGame.isVoteComplete) {
    await voteStore.getVote()
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
