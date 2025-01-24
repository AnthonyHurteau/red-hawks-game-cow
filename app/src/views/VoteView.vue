<script setup lang="ts">
import AppLoading from "@/components/AppLoading.vue"
import PlayerList from "../components/PlayerList.vue"
import VoteTitle from "@/components/VoteTitle.vue"
import WinningCows from "@/components/WinningCows.vue"
import { useGamesStore } from "@/stores/game"

const gameStore = useGamesStore()
</script>

<template>
  <div class="min-h-full flex flex-col">
    <VoteTitle />
    <AppLoading v-if="gameStore.loading" />
    <div
      v-else-if="!gameStore.activeGame"
      class="flex justify-center items-center grow"
    >
      <h1 class="text-2xl">Aucun vote n'a été activé!</h1>
    </div>
    <PlayerList v-else-if="!gameStore.activeGame.isVoteComplete" />
    <WinningCows v-else-if="gameStore.activeGame.isVoteComplete" />
  </div>
</template>
