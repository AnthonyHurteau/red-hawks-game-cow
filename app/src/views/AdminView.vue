<script setup lang="ts">
import AdminPassword from "@/components/AdminPassword.vue"
import AppLoading from "@/components/AppLoading.vue"
import AdminGameVote from "@/components/AdminGameVote.vue"
import { useUserStore } from "@/stores/user"
import { useGamesStore } from "@/stores/game"

const gameStore = useGamesStore()
const userStore = useUserStore()
</script>

<template>
  <main class="min-h-full flex flex-col">
    <div class="flex justify-center items-center py-10">
      <h1 class="text-4xl text-muted-color">Administration</h1>
    </div>
    <AppLoading v-if="userStore.loading" />
    <div
      v-else-if="!userStore.loading"
      class="flex justify-center items-center"
    >
      <AdminPassword v-if="!userStore.isAdmin" />
      <div class="flex flex-col">
        <AdminGameVote v-if="userStore.isAdmin && gameStore.activeGame" />
        <div
          v-if="userStore.isAdmin && (!gameStore.activeGame || gameStore.activeGame.isVoteComplete)"
          class="flex flex-col gap-4"
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
    </div>
  </main>
</template>
