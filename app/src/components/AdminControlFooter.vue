<script setup lang="ts">
import { useGamesStore } from "@/stores/game"
import { useVotesStore } from "@/stores/votes"

const ENV = import.meta.env.VITE_ENV

const gameStore = useGamesStore()
const votesStore = useVotesStore()
</script>

<template>
  <div class="h-full w-full bg-emphasis">
    <div
      v-if="!gameStore.activeGame?.isVoteComplete"
      class="flex h-full gap-2 p-2"
    >
      <AppButton
        v-if="ENV === 'dev'"
        type="button"
        raised
        class="bg-highlight flex-1 basis-0"
        label="Tester le vote"
        :disabled="votesStore.loading || gameStore.loading"
        @click="votesStore.mockVotes(gameStore.activeGame?.players!)"
      />
      <AppButton
        type="button"
        raised
        class="bg-highlight flex-1 basis-0"
        label="Fermer le vote"
        :disabled="gameStore.loading"
        @click="gameStore.manageActiveGameVote(true)"
      />
    </div>
    <div
      v-if="gameStore.activeGame?.isVoteComplete"
      class="flex h-full gap-2 p-2"
    >
      <AppButton
        type="button"
        raised
        class="bg-highlight flex-1 basis-0"
        label="Réouvrir le vote"
        :disabled="gameStore.loading"
        @click="gameStore.manageActiveGameVote(false)"
      />
      <AppButton
        type="button"
        raised
        class="bg-highlight flex-1 basis-0"
        label="Nouveau vote"
        :disabled="gameStore.loading"
        @click="gameStore.createActiveGame()"
      />
    </div>
  </div>
</template>
