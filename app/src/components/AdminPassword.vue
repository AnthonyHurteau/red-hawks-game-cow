<script setup lang="ts">
import { useUserStore } from "@/stores/user"

const usersStore = useUserStore()
</script>

<template>
  <AppPassword
    v-model="value"
    :feedback="false"
    toggleMask
    inputId="pw"
  />
  <label for="pw">Mot de passse</label>
</template>
