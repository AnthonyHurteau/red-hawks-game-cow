<script setup lang="ts">
import AdminPassword from "@/components/AdminPassword.vue"
import AppLoading from "@/components/AppLoading.vue"
import AdminGameVote from "@/components/AdminGameVote.vue"
import { useActiveGameStore } from "@/stores/activeGame"
import { useUserStore } from "@/stores/user"

const activeGameStore = useActiveGameStore()
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
      <AppButton
        v-else-if="
          userStore.isAdmin &&
          (!activeGameStore.activeGame || activeGameStore.activeGame.isVoteComplete)
        "
        type="button"
        rounded
        outlined
        raised
        class="bg-highlight"
        label="Activer le vote"
        @click="activeGameStore.createActiveGame()"
      />
      <AdminGameVote
        v-else-if="
          userStore.isAdmin &&
          activeGameStore.activeGame &&
          !activeGameStore.activeGame.isVoteComplete
        "
      />
    </div>
  </main>
</template>
