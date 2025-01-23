<script setup lang="ts">
import CowIcon from "./CowIcon.vue"
import { useVotesStore } from "@/stores/votes"
import { computed } from "vue"
import type { Player } from "../../../common/models/player"
import { useGamesStore } from "@/stores/game"

const gameStore = useGamesStore()
const votesStore = useVotesStore()

const selectedPlayer = computed({
  get() {
    if (gameStore.activeGame && votesStore.vote) {
      const vote = votesStore.vote
      const players = gameStore.activeGame.players
      return players.find((player) => player.id === vote.playerId) || null
    }
    return null
  },
  set(value: Player | null) {
    votesStore.setVote(value ? value.id : null)
  }
})
</script>

<template>
  <AppListbox
    v-model="selectedPlayer"
    :options="gameStore.activeGame?.players"
    optionLabel="id"
    scrollHeight="calc(95vh - 210px)"
    class="w-full bg-transparent border-0 px-5"
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
        <div
          v-if="slotProps.selected"
          class="basis-2/12"
        >
          <CowIcon cowType="vote" />
        </div>
        <div
          v-else
          class="basis-2/12"
        ></div>
      </div>
    </template>
  </AppListbox>
</template>
