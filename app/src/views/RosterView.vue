<script setup lang="ts">
import AdminPassword from "@/components/AdminPassword.vue"
import AppLoading from "@/components/AppLoading.vue"
import { usePlayerStore, type PlayerInput } from "@/stores/player"
import { useUserStore } from "@/stores/user"
import type { IPlayer, Position } from "@common/models/player"
import { computed, ref, watch } from "vue"

const userStore = useUserStore()
const playerStore = usePlayerStore()

const isAdmin = computed(() => userStore.user?.type === "admin")

watch(
  isAdmin,
  (admin) => {
    if (admin) playerStore.getCorePlayers(true)
  },
  { immediate: true }
)

const positions: { label: string; value: Position }[] = [
  { label: "Attaquant (F)", value: "F" },
  { label: "Défenseur (D)", value: "D" },
  { label: "Gardien (G)", value: "G" }
]

const dialogVisible = ref(false)
const editing = ref<IPlayer | null>(null)
const form = ref<PlayerInput>({ firstName: "", lastName: "", position: "F" })
const formError = ref("")

const isFormValid = computed(
  () => form.value.firstName.trim().length > 0 && form.value.lastName.trim().length > 0
)

function openCreate() {
  editing.value = null
  form.value = { firstName: "", lastName: "", position: "F" }
  formError.value = ""
  dialogVisible.value = true
}

function openEdit(player: IPlayer) {
  editing.value = player
  form.value = {
    firstName: player.firstName,
    lastName: player.lastName,
    position: player.position
  }
  formError.value = ""
  dialogVisible.value = true
}

async function save() {
  if (!isFormValid.value) return
  const input: PlayerInput = {
    firstName: form.value.firstName.trim(),
    lastName: form.value.lastName.trim(),
    position: form.value.position
  }
  const ok = editing.value
    ? await playerStore.updatePlayer({ ...editing.value, ...input })
    : await playerStore.createPlayer(input)

  if (ok) {
    dialogVisible.value = false
  } else {
    formError.value = "Erreur lors de l'enregistrement du joueur."
  }
}

async function confirmDelete(player: IPlayer) {
  if (window.confirm(`Retirer ${player.firstName} ${player.lastName} de l'alignement?`)) {
    const ok = await playerStore.deletePlayer(player)
    if (!ok) window.alert("Erreur lors de la suppression du joueur.")
  }
}
</script>

<template>
  <div class="grid rid-flow-col grid-rows-10 h-full">
    <div class="row-span-1 flex justify-center items-center">
      <h1
        class="text-2xl text-muted-color font-bold font-mono skew-x-12 skew-y-3 bg-emphasis shadow-lg w-80 -translate-x-2 pl-10"
      >
        Alignement
      </h1>
    </div>
    <div class="row-span-8 flex justify-center items-start overflow-y-auto">
      <AdminPassword v-if="!isAdmin" />
      <AppLoading v-else-if="playerStore.loading && playerStore.corePlayers.length === 0" />
      <ul
        v-else
        class="list-none w-full px-5 m-0 flex flex-col gap-2"
      >
        <li
          v-if="playerStore.corePlayers.length === 0"
          class="text-center text-muted-color"
        >
          Aucun joueur dans l'alignement.
        </li>
        <li
          v-for="player in playerStore.corePlayers"
          :key="player.id"
          class="flex w-full h-12 items-center rounded-border border-2 border-primary shadow-md px-3"
        >
          <span class="basis-1/12">{{ player.position }}</span>
          <span class="flex-1">{{ player.firstName }} {{ player.lastName }}</span>
          <AppButton
            icon="pi pi-pencil"
            text
            rounded
            aria-label="Modifier"
            :disabled="playerStore.loading"
            @click="openEdit(player)"
          />
          <AppButton
            icon="pi pi-trash"
            text
            rounded
            severity="danger"
            aria-label="Supprimer"
            :disabled="playerStore.loading"
            @click="confirmDelete(player)"
          />
        </li>
      </ul>
    </div>
    <div class="row-span-1">
      <div
        v-if="isAdmin"
        class="h-full w-full bg-emphasis flex gap-2 p-2"
      >
        <AppButton
          type="button"
          raised
          class="bg-highlight flex-1 basis-0"
          icon="pi pi-plus"
          label="Ajouter un joueur"
          :disabled="playerStore.loading"
          @click="openCreate"
        />
      </div>
    </div>
  </div>

  <AppDialog
    v-model:visible="dialogVisible"
    modal
    :header="editing ? 'Modifier le joueur' : 'Ajouter un joueur'"
    class="w-11/12 max-w-md"
  >
    <form
      class="flex flex-col gap-6 pt-4"
      @submit.prevent="save"
    >
      <AppFloatLabel variant="on">
        <AppInputText
          id="firstName"
          v-model="form.firstName"
          maxlength="50"
          class="w-full"
        />
        <label for="firstName">Prénom</label>
      </AppFloatLabel>
      <AppFloatLabel variant="on">
        <AppInputText
          id="lastName"
          v-model="form.lastName"
          maxlength="50"
          class="w-full"
        />
        <label for="lastName">Nom</label>
      </AppFloatLabel>
      <AppFloatLabel variant="on">
        <AppSelect
          inputId="position"
          v-model="form.position"
          :options="positions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
        <label for="position">Position</label>
      </AppFloatLabel>
      <p
        v-if="formError"
        class="text-red-500 m-0"
      >
        {{ formError }}
      </p>
      <div class="flex justify-end gap-2">
        <AppButton
          type="button"
          label="Annuler"
          text
          @click="dialogVisible = false"
        />
        <AppButton
          type="submit"
          label="Enregistrer"
          :disabled="!isFormValid || playerStore.loading"
        />
      </div>
    </form>
  </AppDialog>
</template>
