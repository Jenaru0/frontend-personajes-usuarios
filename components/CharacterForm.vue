<template>
  <v-form @submit.prevent="handleSubmit">
    <v-text-field
      v-model="localForm.name"
      label="Nombre"
      outlined
      clearable
      required
      prepend-icon="mdi-account"
    />
    <v-text-field
      v-model="localForm.description"
      label="Descripción"
      outlined
      clearable
      prepend-icon="mdi-note-text"
    />
    <v-text-field
      v-model="localForm.image"
      label="URL de Imagen"
      outlined
      clearable
      prepend-icon="mdi-image"
    />
    <!-- Campos adicionales -->
    <v-select
      v-model="localForm.status"
      :items="statusOptions"
      label="Estado"
      outlined
      clearable
      prepend-icon="mdi-alert-circle"
    />
    <v-text-field
      v-model="localForm.species"
      label="Especie"
      outlined
      clearable
      prepend-icon="mdi-flask"
    />
    <v-select
      v-model="localForm.gender"
      :items="genderOptions"
      label="Género"
      outlined
      clearable
      prepend-icon="mdi-gender-male-female"
    />
    <v-text-field
      v-model="localForm.origin"
      label="Origen"
      outlined
      clearable
      prepend-icon="mdi-earth"
    />
    <v-text-field
      v-model="localForm.location"
      label="Ubicación"
      outlined
      clearable
      prepend-icon="mdi-map-marker"
    />
    <v-card-actions class="mt-4">
      <v-spacer></v-spacer>
      <v-btn color="primary" type="submit">
        <v-icon left>mdi-content-save</v-icon>Guardar
      </v-btn>
      <v-btn variant="text" @click="handleCancel">
        <v-icon left>mdi-cancel</v-icon>Cancelar
      </v-btn>
    </v-card-actions>
  </v-form>
</template>

<script setup lang="ts">
import { reactive } from "vue";

interface CharacterFormData {
  name: string;
  description: string;
  image: string;
  status: string;
  species: string;
  gender: string;
  origin: string;
  location: string;
}

const props = defineProps<{
  initialData?: Partial<CharacterFormData>;
  mode: "create" | "edit";
}>();

const emit = defineEmits<{
  (e: "save", data: CharacterFormData): void;
  (e: "cancel"): void;
}>();

const statusOptions = ["Alive", "Dead", "unknown"];
const genderOptions = ["Female", "Male", "Genderless", "unknown"];

const localForm = reactive<CharacterFormData>({
  name: "",
  description: "",
  image: "",
  status: "",
  species: "",
  gender: "",
  origin: "",
  location: "",
});

// Si se proporcionan datos iniciales, se prellenan los campos
if (props.initialData) {
  Object.assign(localForm, props.initialData);
}

function handleSubmit() {
  if (localForm.name.trim()) {
    emit("save", { ...localForm });
  }
}

function handleCancel() {
  emit("cancel");
}
</script>

<style scoped>
/* Puedes agregar estilos personalizados */
</style>
