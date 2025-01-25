<script setup lang="ts">
import AppLoading from "@/components/AppLoading.vue"
import PlayerList from "../components/PlayerList.vue"
import VoteTitle from "@/components/VoteTitle.vue"
import WinningCows from "@/components/WinningCows.vue"
import { useGamesStore } from "@/stores/game"

const gameStore = useGamesStore()
</script>

<template>
  <div class="grid rid-flow-col grid-rows-10 h-full">
    <div class="row-span-2">
      <VoteTitle />
    </div>
    <div class="row-span-8 flex justify-center items-center h-full">
      <AppLoading v-if="gameStore.loading" />
      <div
        v-else-if="!gameStore.activeGame"
        class="flex justify-center items-center grow"
      >
        <h1
          class="text-2xl font-bold font-mono -skew-x-6 skew-y-6 bg-highlight shadow-lg w-60 -translate-x-2 pl-10"
        >
          Aucun vote n'a été activé!
        </h1>
      </div>
      <PlayerList v-else-if="!gameStore.activeGame.isVoteComplete" />
      <WinningCows v-else-if="gameStore.activeGame.isVoteComplete" />
    </div>
  </div>
</template>
