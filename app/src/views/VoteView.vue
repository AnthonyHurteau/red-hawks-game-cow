<script setup lang="ts">
import { usePlayersStore } from "@/stores/players"
import PlayerList from "../components/PlayerList.vue"
import { onMounted } from "vue"

const counterStore = usePlayersStore()

onMounted(() => {
  counterStore.getPlayers()
})
</script>

<template>
  <main>
    <h1 class="text-3xl font-bold text-center">Vote</h1>
    <p class="text-center">Vote for your favorite player</p>
    <PlayerList />
  </main>
</template>
