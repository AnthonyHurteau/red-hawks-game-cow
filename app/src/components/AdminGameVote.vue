<script setup lang="ts">
import AppLoading from "@/components/AppLoading.vue"
import { useVoteStore } from "@/stores/vote"
import { computed, onMounted, ref } from "vue"
import type { Vote } from "../../../common/models/vote"
import { basis, type BasisKey } from "@/utils/dynamicTailwindClasses"
import { useGameStore } from "@/stores/game"
import type { IGroupedVotes } from "@/models/groupedVotes"

const gameStore = useGameStore()
const voteStore = useVoteStore()

voteStore.getVotes()

const groupedVotes = computed(() => {
  const votes = voteStore.votes
  const grouped = votes.reduce((accumulator, currentValue) => {
    if (!accumulator[currentValue.playerId]) {
      accumulator[currentValue.playerId] = []
    }
    accumulator[currentValue.playerId].push(currentValue)
    return accumulator
  }, {} as IGroupedVotes)

  return Object.entries(grouped).sort((a, b) => b[1].length - a[1].length)
})

const voteGraphBasis = computed(() => (votes: Vote[]) => {
  const nominator = Math.min(
    Math.max(Math.round((votes.length / voteStore.votes.length) * 12), 1),
    12
  ) as BasisKey
  return basis[nominator]
})

const getPlayerName = (playerId: string) => {
  const player = gameStore.getPlayerById(playerId)
  return `${player!.firstName} ${player!.lastName}`
}
</script>

<template>
  <div
    class="flex w-full justify-center"
    v-if="gameStore.loading"
  >
    <AppLoading />
  </div>
  <div
    v-else-if="gameStore.activeGame"
    class="flex flex-wrap w-full justify-center items-center gap-10 overflow-auto h-full pb-10"
  >
    <TransitionGroup
      v-if="groupedVotes.length > 0"
      tag="div"
      class="flex w-10/12 flex-wrap gap-2"
      move-class="transition duration-500 ease-in-out"
      enter-active="transition duration-500 ease-in-out"
      leave-active="transition duration-500 ease-in-out"
      enter-from="opacity-0 translate-x-1/4"
      leave-to="opacity-0 translate-x-1/4"
      leave-action="absolute"
    >
      <div
        v-for="([playerId, votes], index) in groupedVotes"
        :key="playerId"
        class="flex basis-full justify-start relative"
      >
        <div
          :class="[
            'flex h-12 items-center justify-around rounded-border border-2 border-primary bg-highlight shadow-xl transition duration-1000 ease-in-out text-xs',
            voteGraphBasis(votes)
          ]"
        >
          <div class="absolute inset-0 overflow-visible whitespace-nowrap pt-4 pl-2">
            {{ gameStore.activeGame?.isVoteComplete ? getPlayerName(playerId) : "" }}
          </div>
        </div>
      </div>
    </TransitionGroup>

    <div
      v-else
      class="flex w-full justify-center"
    >
      <h1
        class="text-2xl font-bold font-mono -skew-x-6 -skew-y-6 bg-highlight-emphasis shadow-lg w-40 -translate-x-2 pl-10"
      >
        Aucun Vote!
      </h1>
    </div>
  </div>
  <div
    v-else
    class="flex w-full justify-center"
  >
    <h1
      class="text-2xl font-bold font-mono -skew-x-6 -skew-y-6 bg-highlight-emphasis shadow-lg w-60 -translate-x-2 pl-10"
    >
      Aucun vote n'a été créé!
    </h1>
  </div>
</template>
