<script setup lang="ts">
import AdminPassword from "@/components/AdminPassword.vue"
import AppLoading from "@/components/AppLoading.vue"
import AdminGameVote from "@/components/AdminGameVote.vue"
import AdminControlFooter from "@/components/AdminControlFooter.vue"
import { useUserStore } from "@/stores/user"
import { useGamesStore } from "@/stores/game"

const gameStore = useGamesStore()
const userStore = useUserStore()
</script>

<template>
  <main class="grid rid-flow-col grid-rows-3">
    <div class="grid grid-cols-3">
      <h1 class="text-2xl text-muted-color">Administration</h1>
    </div>
  </main>
  <!-- <main class="min-h-full flex flex-col">
    <div class="flex justify-center items-center py-4">
      <h1 class="text-2xl text-muted-color">Administration</h1>
    </div>
    <AppLoading v-if="userStore.loading || gameStore.loading" />
    <div
      v-else-if="!userStore.loading"
      class="flex justify-center items-center"
    >
      <AdminPassword v-if="userStore.user?.type !== 'admin'" />
      <div class="flex flex-col">
        <AdminGameVote v-if="userStore.user?.type === 'admin' && gameStore.activeGame" />
        <div
          v-if="
            userStore.user?.type === 'admin' &&
            (!gameStore.activeGame || gameStore.activeGame.isVoteComplete)
          "
          class="flex flex-col gap-4"
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
        <AdminControlFooter />
      </div>
    </div>
  </main> -->
</template>
