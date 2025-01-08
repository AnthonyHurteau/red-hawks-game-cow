<script setup lang="ts">
import { useUserStore } from "@/stores/user"
import { ref } from "vue"

const usersStore = useUserStore()
const password = ref("")
</script>

<template>
  <div class="flex flex-col gap-10">
    <AppFloatLabel variant="on">
      <AppPassword
        v-model="password"
        :feedback="false"
        toggleMask
        inputId="pw"
      />
      <label for="pw">Mot de passse</label>
    </AppFloatLabel>
    <AppButton
      type="button"
      rounded
      outlined
      raised
      class="bg-highlight"
      label="Connection"
      @click="usersStore.setAdmin(password)"
    />
  </div>
</template>
