<script setup lang="ts">
import { useGamesStore } from "@/stores/game"
import CowIcon from "./CowIcon.vue"
import { computed } from "vue"
import type { IGroupedVotes } from "@/models/groupedVotes"

const gameStore = useGamesStore()

const topPlayers = computed(() => {
  const votes = gameStore.activeGame!.votes
  const grouped = votes.reduce((accumulator, currentValue) => {
    if (!accumulator[currentValue.playerId]) {
      accumulator[currentValue.playerId] = []
    }
    accumulator[currentValue.playerId].push(currentValue)
    return accumulator
  }, {} as IGroupedVotes)

  return Object.entries(grouped)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
})

const getPlayerName = (playerId: string) => {
  const player = gameStore.getPlayerById(playerId)
  return `${player!.firstName} ${player!.lastName}`
}
</script>

<template>
  <div class="flex justify-center">
    <div class="flex flex-col items-center font-bold text-center font-mono skew-y-5 py-4 w-fit">
      <div class="flex-1"><CowIcon :cowType="topPlayers.length >= 1 ? 'win' : 'vote'" /></div>

      <div
        v-if="topPlayers.length === 0"
        class="flex-1 skew-y-3 bg-highlight-emphasis shadow-lg translate-x-2"
      >
        <h1 class="text-2xl tracking-wide">Personne n'a voté!</h1>
      </div>

      <div
        v-if="topPlayers.length >= 1"
        class="flex-1 skew-y-3 bg-highlight-emphasis shadow-lg animate-pulse translate-x-2"
      >
        <h1 class="text-2xl tracking-wide">&#8902; {{ getPlayerName(topPlayers[0][0]) }}</h1>
      </div>

      <div
        v-if="topPlayers.length >= 2"
        class="flex-1 skew-y-6 bg-highlight shadow-lg pr-4 mt-14"
      >
        <h2 class="text-l">&#8902;&#8902; {{ getPlayerName(topPlayers[1][0]) }}</h2>
      </div>

      <div
        v-if="topPlayers.length >= 3"
        class="flex-1 skew-y-8 bg-emphasis shadow-lg pl-8 mt-4 translate-x-1"
      >
        <h2 class="text-l">&#8902;&#8902;&#8902; {{ getPlayerName(topPlayers[2][0]) }}</h2>
      </div>
    </div>
  </div>
</template>
