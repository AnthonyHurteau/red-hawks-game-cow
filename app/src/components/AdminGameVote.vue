<script setup lang="ts">
import { useActiveGameStore } from "@/stores/activeGame"
import { useVotesStore } from "@/stores/votes"
import { computed, onMounted } from "vue"
import type { Vote } from "../../../common/models/vote"

interface GroupedVotes {
  [playerId: string]: Vote[]
}

const activeGameStore = useActiveGameStore()
const votesStore = useVotesStore()

onMounted(() => {
  votesStore.getVotes()
})

const groupedVotes = computed(() => {
  const votes = votesStore.votes
  const grouped = votes.reduce((accumulator: GroupedVotes, currentValue) => {
    if (!accumulator[currentValue.playerId]) {
      accumulator[currentValue.playerId] = []
    }
    accumulator[currentValue.playerId].push(currentValue)
    return accumulator
  }, {} as GroupedVotes)

  return grouped
})
</script>

<template>
  <div
    class="flex flex-wrap justify-center items-center gap-10 overflow-auto h-[calc(100vh-200px)] pb-10"
  >
    <div class="flex w-full">
      <ul>
        <li
          class="flex w-full h-12 items-center justify-around rounded-border border-2 border-primary shadow-xl"
          v-for="(vote, i) in groupedVotes"
          :key="i"
        >
          {{ vote[0].playerId }}
        </li>
      </ul>
    </div>

    <div class="flex w-full justify-center">
      <AppButton
        type="button"
        rounded
        outlined
        raised
        class="bg-highlight"
        label="Tester le vote"
        @click="votesStore.mockVotes()"
      />
    </div>

    <div class="flex w-full justify-center">
      <AppButton
        type="button"
        rounded
        outlined
        raised
        class="bg-highlight"
        label="Fermer le vote"
        @click="activeGameStore.closeActiveGameVote()"
      />
    </div>
  </div>
</template>
