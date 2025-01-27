<script setup lang="ts">
import { useGameStore } from "@/stores/game"
import { useVoteStore } from "@/stores/vote"

const ENV = import.meta.env.VITE_ENV

const gameStore = useGameStore()
const voteStore = useVoteStore()
</script>

<template>
  <div class="h-full w-full bg-emphasis">
    <div
      v-if="gameStore.activeGame && !gameStore.activeGame?.isVoteComplete"
      class="flex h-full gap-2 p-2"
    >
      <AppButton
        v-if="ENV === 'dev'"
        type="button"
        raised
        class="bg-highlight flex-1 basis-0"
        label="Tester le vote"
        :disabled="voteStore.loading || gameStore.loading"
        @click="voteStore.mockVotes(gameStore.activeGame?.players!)"
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
      v-if="!gameStore.activeGame || gameStore.activeGame?.isVoteComplete"
      class="flex h-full gap-2 p-2"
    >
      <AppButton
        v-if="gameStore.activeGame"
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
