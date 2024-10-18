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
    <div class="flex flex-col items-center font-bold text-center font-mono skew-x-12 py-4">
      <dev class="flex-1 skew-x-6 bg-highlight shadow-lg w-32 pr-4 -translate-x-16">
        <h2 class="text-xl">La</h2>
      </dev>
      <div class="flex-1 skew-y-3 bg-emphasis shadow-lg w-80">
        <h1 class="text-4xl tracking-wide">&#8902;&#8902;&#8902; VACHE &#8902;&#8902;&#8902;</h1>
      </div>
      <div class="flex-1 skew-x-6 bg-highlight-emphasis shadow-lg w-60 pl-8 translate-x-12">
        <h2 class="text-xl">du match</h2>
      </div>
    </div>
    <PlayerList />
  </main>
</template>
