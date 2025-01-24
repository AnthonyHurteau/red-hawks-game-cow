<script setup lang="ts">
import { computed, ref, type ComputedRef, type Ref } from "vue"
import { RouterLink } from "vue-router"
import AppLogo from "./AppLogo.vue"
import { ROUTE_NAMES } from "@/router"
import { useUserStore } from "@/stores/user"

interface NavItem {
  title: string
  icon: string
  routeName: ROUTE_NAMES
  adminOnly: boolean
}

const visible = ref(false)
const navItems: Ref<NavItem[]> = ref([
  {
    title: "Vote",
    icon: "pi pi-check-circle",
    routeName: ROUTE_NAMES.VOTE,
    adminOnly: false
  },
  {
    title: "Administration",
    icon: "pi pi-cog",
    routeName: ROUTE_NAMES.ADMIN,
    adminOnly: true
  }
])

const userStore = useUserStore()

const filteredNavItems: ComputedRef<NavItem[]> = computed(() => {
  return navItems.value.filter((item) => {
    return !item.adminOnly || userStore.user?.type === "admin"
  })
})
</script>

<template>
  <AppButton
    icon="pi pi-bars"
    rounded
    @click="visible = true"
  />
  <div class="card flex justify-center">
    <AppDrawer
      v-model:visible="visible"
      position="right"
    >
      <template #container="{ closeCallback }">
        <div class="flex flex-col h-full">
          <div class="flex items-center justify-between px-6 py-4 shrink-0 h-24">
            <div class="inline-flex items-center gap-2 h-full">
              <AppLogo />
            </div>
            <span>
              <AppButton
                type="button"
                @click="closeCallback"
                icon="pi pi-times"
                rounded
              />
            </span>
          </div>
          <div class="px-4">
            <i class="pi pi-compass pr-2 text-muted-color"></i>
            <span class="text-lg text-muted-color">Navigation</span>
          </div>
          <ul class="list-none p-4 m-0 overflow-hidden">
            <li
              class="py-2"
              v-for="(item, index) in filteredNavItems"
              :key="index"
            >
              <RouterLink
                :to="{ name: item.routeName }"
                class="flex items-center cursor-pointer p-4 rounded-border border-2 border-primary shadow-xl text-surface-700 hover:bg-surface-100 dark:text-surface-0 dark:hover:bg-surface-800 duration-150 transition-colors p-ripple"
                @click="closeCallback"
              >
                <i :class="[item.icon, 'pr-2']"></i>
                <span class="font-medium">{{ item.title }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </template>
    </AppDrawer>
  </div>
</template>
