<script setup lang="ts">
import AppLoading from "@/components/AppLoading.vue"
import { useVotesStore } from "@/stores/votes"
import { computed, onMounted, ref } from "vue"
import type { Vote } from "../../../common/models/vote"
import { basis, type BasisKey } from "@/utils/dynamicTailwindClasses"
import { useGamesStore } from "@/stores/game"
import type { IGroupedVotes } from "@/models/groupedVotes"

const gameStore = useGamesStore()
const votesStore = useVotesStore()

onMounted(() => {
  votesStore.getVotes()
})

const groupedVotes = computed(() => {
  const votes = votesStore.votes
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
    Math.max(Math.round((votes.length / votesStore.votes.length) * 12), 1),
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
    class="flex flex-wrap justify-center items-center gap-10 overflow-auto h-[calc(100vh-200px)] pb-10"
  >
    <TransitionGroup
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
            'flex h-12 items-center justify-around rounded-border border-2 border-primary shadow-xl transition duration-1000 ease-in-out text-xs',
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
      class="flex w-full justify-center"
      v-if="votesStore.loading"
    >
      <AppLoading />
    </div>
    <div
      class="flex w-full justify-center"
      v-if="!votesStore.loading && !gameStore.activeGame?.isVoteComplete"
    >
      <AppButton
        type="button"
        rounded
        outlined
        raised
        class="bg-highlight"
        label="Tester le vote"
        @click="votesStore.mockVotes(gameStore.activeGame?.players!)"
      />
    </div>

    <div
      class="flex w-full justify-center"
      v-if="!votesStore.loading && !gameStore.activeGame?.isVoteComplete"
    >
      <AppButton
        type="button"
        rounded
        outlined
        raised
        class="bg-highlight"
        label="Fermer le vote"
        @click="gameStore.manageActiveGameVote(true)"
      />
    </div>

    <div
      class="flex w-full justify-center"
      v-if="!votesStore.loading && gameStore.activeGame?.isVoteComplete"
    >
      <AppButton
        type="button"
        rounded
        outlined
        raised
        class="bg-highlight"
        label="Réouvrir le vote"
        @click="gameStore.manageActiveGameVote(false)"
      />
    </div>
    <div
      class="flex w-full justify-center"
      v-if="!votesStore.loading && gameStore.activeGame?.isVoteComplete"
    >
      <AppButton
        type="button"
        rounded
        outlined
        raised
        class="bg-highlight"
        label="Nouveau vote"
        @click="gameStore.createActiveGame()"
      />
    </div>
  </div>
</template>
