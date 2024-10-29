<script setup lang="ts">
import { useActiveGameStore } from "@/stores/activeGame"

const activeGameStore = useActiveGameStore()
</script>

<template>
  <main class="min-h-full flex flex-col">
    <div class="flex justify-center items-center pt-4">
      <h1 class="text-4xl text-muted-color">Administration</h1>
    </div>
    <div class="flex justify-center items-center grow">
      <AppButton
        v-if="!activeGameStore.activeGame || activeGameStore.activeGame.isVoteComplete"
        type="button"
        rounded
        outlined
        raised
        class="bg-highlight"
        label="Activer le vote"
        @click="activeGameStore.createActiveGame()"
      />
      <AppButton
        v-else-if="!activeGameStore.activeGame.isVoteComplete"
        type="button"
        rounded
        outlined
        raised
        class="bg-highlight"
        label="Fermer le vote"
        @click="activeGameStore.closeActiveGameVote()"
      />
    </div>
  </main>
</template>
