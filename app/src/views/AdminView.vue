<script setup lang="ts">
import AdminPassword from "@/components/AdminPassword.vue"
import AppLoading from "@/components/AppLoading.vue"
import AdminGameVote from "@/components/AdminGameVote.vue"
import AdminControlFooter from "@/components/AdminControlFooter.vue"
import { useUserStore } from "@/stores/user"

const userStore = useUserStore()
</script>

<template>
  <div class="grid rid-flow-col grid-rows-10 h-full">
    <div class="row-span-1 flex justify-center items-center">
      <h1
        class="text-2xl text-muted-color font-bold font-mono skew-x-12 skew-y-3 bg-emphasis shadow-lg w-80 -translate-x-2 pl-10"
      >
        Administration
      </h1>
    </div>
    <div class="row-span-8 flex justify-center items-center">
      <AppLoading v-if="userStore.loading" />
      <AdminPassword v-if="!userStore.loading && userStore.user?.type !== 'admin'" />
      <AdminGameVote v-if="!userStore.loading && userStore.user?.type === 'admin'" />
    </div>
    <div class="row-span-1">
      <AdminControlFooter v-if="userStore.user?.type === 'admin'" />
    </div>
  </div>
</template>
