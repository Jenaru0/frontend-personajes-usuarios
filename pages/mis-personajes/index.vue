<template>
  <v-container>
    <h1 class="mb-6">Mis Personajes</h1>

    <!-- Acciones -->
    <v-row class="mb-4">
      <v-col class="text-right">
        <v-btn color="primary" @click="openCreateModal" prepend-icon="mdi-plus">
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
        <v-alert type="error">{{ error }}</v-alert>
      </v-col>
    </v-row>

    <!-- Sin personajes -->
    <v-row v-else-if="personajes.length === 0">
      <v-col cols="12" class="text-center">
        <p>No tienes personajes creados. ¡Comienza creando uno nuevo!</p>
      </v-col>
    </v-row>

    <!-- Grid de personajes -->
    <v-row v-else>
      <v-col
        v-for="personaje in personajes"
        :key="personaje.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="mx-auto my-4">
          <v-img
            :src="personaje.foto"
            height="200px"
            cover
            @error="handleImageError"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height" align="center" justify="center">
                <v-icon size="large" color="grey">mdi-image-off</v-icon>
              </v-row>
            </template>
          </v-img>

          <v-card-title>{{ personaje.nombre }}</v-card-title>

          <v-card-actions>
            <v-btn color="error" @click="confirmDelete(personaje.id)">
              <v-icon left>mdi-delete</v-icon>Eliminar
            </v-btn>
            <v-btn color="primary" @click="openEditModal(personaje)">
              <v-icon left>mdi-pencil</v-icon>Editar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal para crear/editar -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{
          editMode ? "Editar Personaje" : "Crear Personaje"
        }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="savePersonaje" ref="formRef">
            <v-text-field
              v-model="form.nombre"
              label="Nombre"
              required
              :rules="[(v) => !!v || 'El nombre es requerido']"
            ></v-text-field>

            <v-text-field
              v-model="form.foto"
              label="URL de la imagen"
              required
              :rules="[(v) => !!v || 'La URL de la imagen es requerida']"
            ></v-text-field>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                type="submit"
                color="primary"
                :loading="isLoading"
                :disabled="isLoading"
              >
                Guardar
              </v-btn>
              <v-btn @click="dialog = false">Cancelar</v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirmar eliminación</v-card-title>
        <v-card-text
          >¿Estás seguro que deseas eliminar este personaje?</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="deletePersonaje"
            color="error"
            :loading="isLoading"
            :disabled="isLoading"
          >
            Eliminar
          </v-btn>
          <v-btn @click="deleteDialog = false" color="warning">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Añadir esto antes del cierre de v-container -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { usePersonajes } from "@/composables/usePersonajes";

// Agregar esta línea para definir formRef
const formRef = ref(null);

const {
  personajes,
  isLoading,
  error,
  fetchPersonajes,
  createPersonaje,
  updatePersonaje,
  deletePersonaje: removePersonaje,
} = usePersonajes();

// Estado local
const dialog = ref(false);
const deleteDialog = ref(false);
const editMode = ref(false);
const currentId = ref("");
const form = reactive({
  nombre: "",
  foto: "",
});

// Añadir el estado para el snackbar
const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
});

// Cargar datos al iniciar
onMounted(async () => {
  console.log("Montando componente mis-personajes");
  await fetchPersonajes();
});

// Abrir modal para crear
function openCreateModal() {
  editMode.value = false;
  form.nombre = "";
  form.foto = "";
  dialog.value = true;
}

// Abrir modal para editar
function openEditModal(personaje) {
  editMode.value = true;
  currentId.value = personaje.id;
  form.nombre = personaje.nombre;
  form.foto = personaje.foto;
  dialog.value = true;
}

// Guardar personaje
async function savePersonaje() {
  // Validar formulario
  if (!formRef.value.validate()) return;

  try {
    isLoading.value = true;

    // Eliminar la validación estricta de URL
    // que bloquea la creación del personaje

    if (editMode.value) {
      const result = await updatePersonaje(currentId.value, {
        nombre: form.nombre.trim(),
        foto: form.foto.trim(),
      });

      if (result) {
        showSnackbar("Personaje actualizado correctamente");
        dialog.value = false;
      } else {
        showSnackbar("Error al actualizar el personaje", "error");
      }
    } else {
      const result = await createPersonaje({
        nombre: form.nombre.trim(),
        foto: form.foto.trim(),
      });

      if (result) {
        showSnackbar("Personaje creado correctamente");
        dialog.value = false;
      } else {
        showSnackbar("Error al crear el personaje", "error");
      }
    }
  } catch (e) {
    console.error("Error al guardar:", e);
    showSnackbar(e.message || "Error al guardar el personaje", "error");
  } finally {
    isLoading.value = false;
  }
}

// Confirmar eliminación
function confirmDelete(id) {
  currentId.value = id;
  deleteDialog.value = true;
}

// Eliminar personaje
async function deletePersonaje() {
  try {
    isLoading.value = true;
    const success = await removePersonaje(currentId.value);

    if (success) {
      showSnackbar("Personaje eliminado correctamente");
    } else {
      showSnackbar("No se pudo eliminar el personaje", "error");
    }

    deleteDialog.value = false;
  } catch (e) {
    console.error("Error al eliminar:", e);
    showSnackbar("Error al eliminar el personaje", "error");
  } finally {
    isLoading.value = false;
  }
}

// Función para mostrar notificaciones
function showSnackbar(text, color = "success") {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
}

// Agregar este método al script
function handleImageError(event) {
  // Establecer una imagen de respaldo cuando falla la carga
  event.target.src =
    "https://media.istockphoto.com/id/2171382633/es/vector/icono-de-perfil-de-usuario-s%C3%ADmbolo-de-persona-an%C3%B3nima-gr%C3%A1fico-de-avatar-en-blanco.jpg?s=612x612&w=0&k=20&c=4R1fa1xdOWF2fXr6LSwe0L7O1ojy60Mcy0n624Z4qns=";
}
</script>
