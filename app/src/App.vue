<script setup lang="ts">
import { RouterView } from "vue-router"
import HeaderBar from "./components/HeaderBar.vue"
import { useActiveGameStore } from "./stores/activeGame"
import { onMounted } from "vue"
import { useUserStore } from "./stores/user"
import { useVotesStore } from "./stores/votes"

const activeGameStore = useActiveGameStore()
const userStore = useUserStore()
const votesStore = useVotesStore()

onMounted(() => {
  activeGameStore.getActiveGame()
  userStore.getUser()

  if (activeGameStore.activeGame && !activeGameStore.activeGame.isVoteComplete) {
    votesStore.getVote()
  }
})

activeGameStore.$subscribe((mutation, state) => {
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
