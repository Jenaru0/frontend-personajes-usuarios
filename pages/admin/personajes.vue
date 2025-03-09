<template>
  <v-container>
    <h1 class="mb-6">Gestión de Todos los Personajes</h1>

    <!-- Filtros y acciones -->
    <v-row class="mb-4" align="center">
      <v-col cols="12" sm="6" md="6">
        <v-text-field
          v-model="search"
          label="Buscar por nombre"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
          clearable
          @click:clear="search = ''"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="6" class="text-right">
        <v-btn color="primary" @click="openCreateModal">
          <v-icon start>mdi-plus</v-icon>
          Crear Personaje
        </v-btn>
      </v-col>
    </v-row>

    <!-- Estados de carga y error -->
    <v-row v-if="isLoading">
      <v-col cols="12" class="text-center">
        <v-progress-circular
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" dismissible>{{ error }}</v-alert>
      </v-col>
    </v-row>

    <!-- Tabla de personajes -->
    <v-card v-else-if="personajes.length > 0" class="elevation-3">
      <v-data-table
        :headers="headers"
        :items="filteredPersonajes"
        :items-per-page="10"
        class="elevation-0"
      >
        <template v-slot:item.foto="{ item }">
          <v-avatar size="40">
            <v-img
              :src="item.foto"
              :alt="item.nombre"
              @error="handleImageError"
            >
              <template v-slot:placeholder>
                <v-icon>mdi-image-off</v-icon>
              </template>
            </v-img>
          </v-avatar>
        </template>

        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            color="primary"
            size="small"
            @click="openEditModal(item)"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            color="error"
            size="small"
            @click="confirmDelete(item.id)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Sin personajes -->
    <v-row v-else>
      <v-col cols="12" class="text-center">
        <v-alert type="info">
          No hay personajes registrados. ¡Crea el primero!
        </v-alert>
      </v-col>
    </v-row>

    <!-- Modal para crear/editar personaje -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{
          editMode ? "Editar Personaje" : "Crear Personaje"
        }}</v-card-title>
        <v-card-text>
          <v-form ref="formRef" @submit.prevent="savePersonaje">
            <v-text-field
              v-model="form.nombre"
              label="Nombre"
              required
              :rules="nombreRules"
            ></v-text-field>

            <v-text-field
              v-model="form.foto"
              label="URL de la imagen"
              required
              :rules="fotoRules"
            ></v-text-field>

            <!-- Mostrar vista previa de imagen si hay URL -->
            <div v-if="form.foto" class="d-flex justify-center my-4">
              <v-img
                :src="form.foto"
                max-height="100"
                max-width="100"
                contain
                @error="previewError = true"
              >
                <template v-slot:placeholder>
                  <v-icon v-if="previewError" color="error" size="large"
                    >mdi-alert</v-icon
                  >
                  <v-progress-circular
                    v-else
                    color="grey-lighten-4"
                    indeterminate
                  ></v-progress-circular>
                </template>
              </v-img>
            </div>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                type="submit"
                color="primary"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              >
                <v-icon start>{{
                  editMode ? "mdi-content-save" : "mdi-plus-circle"
                }}</v-icon>
                {{ editMode ? "Guardar" : "Crear" }}
              </v-btn>
              <v-btn @click="dialog = false" variant="outlined">
                <v-icon start>mdi-cancel</v-icon>
                Cancelar
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon color="error" class="mr-2">mdi-delete-alert</v-icon>
          Confirmar eliminación
        </v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar este personaje? Esta acción no se
          puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="deletePersonaje"
            color="error"
            :loading="isDeleting"
            :disabled="isDeleting"
          >
            <v-icon start>mdi-delete</v-icon>
            Eliminar
          </v-btn>
          <v-btn @click="deleteDialog = false" variant="outlined"
            >Cancelar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para feedback -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useAdminPersonajes } from "@/composables/useAdminPersonajes";

// Definir la página como protegida
definePageMeta({
  middleware: ["auth", "admin"],
});

// Interfaces
interface Personaje {
  id: string;
  nombre: string;
  foto: string;
  userId: string;
  usuario?: {
    nombre: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface PersonajeForm {
  nombre: string;
  foto: string;
  userId?: string;
}

// Definición de headers para v-data-table
const headers = [
  { title: "Imagen", key: "foto", sortable: false },
  { title: "Nombre", key: "nombre", sortable: true },
  { title: "Usuario", key: "usuario.nombre", sortable: true },
  { title: "Fecha creación", key: "createdAt", sortable: true },
  {
    title: "Acciones",
    key: "actions",
    sortable: false,
    align: "center" as const,
  },
];

// Reglas de validación
const nombreRules = [
  (v: string) => !!v || "El nombre es requerido",
  (v: string) => v.length >= 2 || "El nombre debe tener al menos 2 caracteres",
];

const fotoRules = [(v: string) => !!v || "La URL de la imagen es requerida"];

// Estado para controlar feedback, carga y formulario
const formRef = ref();
const isSubmitting = ref(false);
const isDeleting = ref(false);
const previewError = ref(false);
const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
});

// Estado para el modo del formulario
const editMode = ref(false);

// Composable para acceder a datos y operaciones de personajes
const {
  allPersonajes: personajes,
  isLoading,
  error,
  fetchAllPersonajes,
  createPersonajeAdmin,
  updatePersonajeAdmin,
  deletePersonajeAdmin,
} = useAdminPersonajes();

// Estado local
const search = ref("");
const dialog = ref(false);
const deleteDialog = ref(false);
const currentId = ref("");
const form = reactive<PersonajeForm>({
  nombre: "",
  foto: "",
});

// Filtrar personajes por búsqueda
const filteredPersonajes = computed(() => {
  if (!search.value) return personajes.value;

  const searchLower = search.value.toLowerCase();
  return personajes.value.filter((p) =>
    p.nombre.toLowerCase().includes(searchLower)
  );
});

// Cargar datos al iniciar
onMounted(async () => {
  try {
    await fetchAllPersonajes();
  } catch (e) {
    showSnackbar("Error al cargar personajes", "error");
    console.error("Error cargando personajes:", e);
  }
});

// Formatear fecha
function formatDate(dateString?: string): string {
  if (!dateString) return "Fecha desconocida";
  return new Date(dateString).toLocaleDateString();
}

// Manejar error de carga de imagen
function handleImageError(event: Event) {
  if (event.target instanceof HTMLImageElement) {
    event.target.src = "https://via.placeholder.com/40x40?text=Error";
  }
}

// Abrir modal para crear
function openCreateModal() {
  editMode.value = false;
  resetForm();
  dialog.value = true;
}

// Abrir modal para editar
function openEditModal(personaje: Personaje) {
  editMode.value = true;
  currentId.value = personaje.id;
  form.nombre = personaje.nombre;
  form.foto = personaje.foto;
  previewError.value = false;
  dialog.value = true;
}

// Resetear formulario
function resetForm() {
  if (formRef.value) {
    formRef.value.resetValidation();
  }
  form.nombre = "";
  form.foto = "";
  currentId.value = "";
  previewError.value = false;
}

// Guardar personaje (crear o editar)
async function savePersonaje() {
  if (!formRef.value.validate()) return;

  try {
    isSubmitting.value = true;

    const personajeData = {
      nombre: form.nombre.trim(),
      foto: form.foto.trim(),
    };

    let result;

    if (editMode.value) {
      result = await updatePersonajeAdmin(currentId.value, personajeData);

      if (result) {
        showSnackbar("Personaje actualizado correctamente");
        dialog.value = false;
      } else {
        showSnackbar("Error al actualizar el personaje", "error");
      }
    } else {
      result = await createPersonajeAdmin(personajeData);

      if (result) {
        showSnackbar("Personaje creado correctamente");
        dialog.value = false;
      } else {
        showSnackbar("Error al crear el personaje", "error");
      }
    }

    // Recargar datos para asegurar consistencia
    await fetchAllPersonajes();
  } catch (e) {
    showSnackbar("Error al guardar el personaje", "error");
    console.error("Error al guardar:", e);
  } finally {
    isSubmitting.value = false;
  }
}

// Confirmar eliminación
function confirmDelete(id: string) {
  currentId.value = id;
  deleteDialog.value = true;
}

// Eliminar personaje
async function deletePersonaje() {
  try {
    isDeleting.value = true;
    const success = await deletePersonajeAdmin(currentId.value);

    deleteDialog.value = false;

    if (success) {
      showSnackbar("Personaje eliminado correctamente");
      // Recargar datos para asegurar que tenemos la información actualizada
      await fetchAllPersonajes();
    } else {
      showSnackbar("Error al eliminar el personaje", "error");
    }
  } catch (e) {
    showSnackbar("Error al eliminar el personaje", "error");
    console.error("Error al eliminar:", e);
  } finally {
    isDeleting.value = false;
  }
}

// Función para mostrar notificaciones
function showSnackbar(text: string, color: string = "success") {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
}
</script>

<style scoped>
/* Estilos opcionales para mejorar la UI */
.v-data-table :deep(th) {
  font-weight: bold;
  background-color: #f5f5f5;
}

.v-data-table :deep(tbody tr:hover) {
  background-color: #f9f9f9;
}
</style>
