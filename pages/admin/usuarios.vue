<template>
  <v-container>
    <h1 class="mb-6">Gestión de Usuarios</h1>

    <v-row class="mb-4">
      <v-col class="text-right">
        <v-btn
          color="primary"
          @click="openCreateModal"
          prepend-icon="mdi-account-plus"
        >
          Crear Usuario
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

    <!-- Tabla de usuarios con búsqueda -->
    <v-card v-else class="elevation-3">
      <v-card-title>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar usuario"
          single-line
          hide-details
          density="compact"
          variant="outlined"
          class="mb-2"
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="usuarios"
        :items-per-page="10"
        :search="search"
        class="elevation-0"
      >
        <template v-slot:item.rol="{ item }">
          <v-chip
            :color="item.rol === 'ADMIN' ? 'red' : 'primary'"
            size="small"
          >
            {{ item.rol }}
          </v-chip>
        </template>

        <template v-slot:item.isActive="{ item }">
          <v-chip :color="item.isActive ? 'success' : 'error'" size="small">
            {{ item.isActive ? "Activo" : "Inactivo" }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-tooltip text="Editar">
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                variant="text"
                color="primary"
                size="small"
                v-bind="props"
                @click="openEditModal(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip :text="item.isActive ? 'Desactivar' : 'Activar'">
            <template v-slot:activator="{ props }">
              <v-btn
                icon
                variant="text"
                :color="item.isActive ? 'error' : 'success'"
                size="small"
                v-bind="props"
                @click="toggleUserStatus(item)"
              >
                <v-icon>{{
                  item.isActive ? "mdi-account-cancel" : "mdi-account-check"
                }}</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <!-- Modal para crear/editar usuario -->
    <v-dialog v-model="dialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="text-h5 bg-primary text-white">
          {{ editMode ? "Editar Usuario" : "Crear Usuario" }}
          <v-spacer></v-spacer>
          <v-btn icon variant="text" @click="closeDialog" color="white">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form ref="formRef" @submit.prevent="saveUsuario">
            <v-text-field
              v-model="form.nombre"
              label="Nombre"
              required
              :rules="[
                (v) => !!v || 'El nombre es requerido',
                (v) =>
                  (v && v.length >= 3) ||
                  'El nombre debe tener al menos 3 caracteres',
              ]"
              variant="outlined"
              class="mb-2"
            ></v-text-field>

            <v-text-field
              v-model="form.correo"
              label="Correo electrónico"
              type="email"
              required
              :rules="[
                (v) => !!v || 'El correo es requerido',
                (v) => /.+@.+\..+/.test(v) || 'El correo debe ser válido',
              ]"
              variant="outlined"
              class="mb-2"
            ></v-text-field>

            <v-text-field
              v-model="form.contraseña"
              label="Contraseña"
              type="password"
              :required="!editMode"
              :rules="passwordRules"
              :hint="
                editMode
                  ? 'Deje en blanco para mantener la contraseña actual'
                  : 'Mínimo 6 caracteres, incluir al menos un número'
              "
              persistent-hint
              variant="outlined"
              class="mb-2"
            ></v-text-field>

            <v-select
              v-model="form.rol"
              label="Rol"
              :items="[
                { title: 'Administrador', value: 'ADMIN' },
                { title: 'Usuario Regular', value: 'REGULAR' },
              ]"
              item-title="title"
              item-value="value"
              required
              variant="outlined"
              class="mb-2"
            ></v-select>

            <v-switch
              v-model="form.isActive"
              color="success"
              :label="form.isActive ? 'Usuario activo' : 'Usuario inactivo'"
              inset
              class="mb-2"
            ></v-switch>

            <v-card-actions class="px-0">
              <v-spacer></v-spacer>
              <v-btn
                type="submit"
                color="primary"
                :loading="isSubmitting"
                :disabled="isSubmitting"
              >
                <v-icon start>{{
                  editMode ? "mdi-content-save" : "mdi-account-plus"
                }}</v-icon>
                {{ editMode ? "Guardar cambios" : "Crear usuario" }}
              </v-btn>
              <v-btn
                variant="outlined"
                @click="closeDialog"
                :disabled="isSubmitting"
              >
                Cancelar
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmación para cambio de estado -->
    <v-dialog v-model="confirmDialog" max-width="450">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon
            :color="userToToggle?.isActive ? 'error' : 'success'"
            class="mr-2"
          >
            {{
              userToToggle?.isActive
                ? "mdi-account-cancel"
                : "mdi-account-check"
            }}
          </v-icon>
          {{ userToToggle?.isActive ? "Desactivar" : "Activar" }} usuario
        </v-card-title>

        <v-card-text>
          ¿Está seguro que desea
          {{ userToToggle?.isActive ? "desactivar" : "activar" }} a
          <strong>{{ userToToggle?.nombre }}</strong
          >?
          <div class="text-caption mt-2" v-if="userToToggle?.isActive">
            El usuario no podrá iniciar sesión mientras esté desactivado.
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="confirmDialog = false" variant="text">Cancelar</v-btn>
          <v-btn
            :color="userToToggle?.isActive ? 'error' : 'success'"
            @click="confirmToggleStatus"
            :loading="isSubmitting"
          >
            Confirmar
          </v-btn>
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
import { useUsuarios } from "@/composables/useUsuarios";

// Definir la página como protegida para administradores
definePageMeta({
  middleware: ["auth", "admin"],
});

// Interfaces para tipado fuerte
interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: "ADMIN" | "REGULAR";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UserForm {
  nombre: string;
  correo: string;
  contraseña: string;
  rol: "ADMIN" | "REGULAR";
  isActive: boolean;
}

// Headers para la tabla de usuarios
const headers = [
  { title: "Nombre", key: "nombre", sortable: true },
  { title: "Correo", key: "correo", sortable: true },
  { title: "Rol", key: "rol", sortable: true },
  { title: "Estado", key: "isActive", sortable: true },
  {
    title: "Acciones",
    key: "actions",
    sortable: false,
    align: "center" as const,
  },
];

// Importar composable para gestión de usuarios
const {
  usuarios,
  isLoading,
  error,
  fetchUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} = useUsuarios();

// Estado local
const dialog = ref(false);
const confirmDialog = ref(false);
const editMode = ref(false);
const search = ref("");
const currentId = ref("");
const formRef = ref();
const isSubmitting = ref(false);
const userToToggle = ref<Usuario | null>(null);

// Estado reactivo del formulario
const form = reactive<UserForm>({
  nombre: "",
  correo: "",
  contraseña: "",
  rol: "REGULAR",
  isActive: true,
});

// Estado para notificaciones
const snackbar = reactive({
  show: false,
  text: "",
  color: "success",
});

// Reglas de validación para contraseña condicionadas según el modo
const passwordRules = computed(() => {
  if (editMode.value) {
    return [
      (v) =>
        !v || v.length >= 6 || "La contraseña debe tener al menos 6 caracteres",
      (v) =>
        !v || /\d/.test(v) || "La contraseña debe incluir al menos un número",
    ];
  } else {
    return [
      (v) => !!v || "La contraseña es requerida",
      (v) => v.length >= 6 || "La contraseña debe tener al menos 6 caracteres",
      (v) => /\d/.test(v) || "La contraseña debe incluir al menos un número",
    ];
  }
});

// Cargar datos al iniciar
onMounted(async () => {
  try {
    await fetchUsuarios();
  } catch (e) {
    showSnackbar("Error al cargar usuarios", "error");
    console.error("Error cargando usuarios:", e);
  }
});

// Abrir modal para crear usuario
function openCreateModal() {
  editMode.value = false;
  resetForm();
  dialog.value = true;
}

// Abrir modal para editar usuario
function openEditModal(usuario: Usuario) {
  editMode.value = true;
  currentId.value = usuario.id;

  // Copiar datos del usuario al formulario
  form.nombre = usuario.nombre;
  form.correo = usuario.correo;
  form.contraseña = ""; // No enviamos la contraseña en edición
  form.rol = usuario.rol;
  form.isActive = usuario.isActive;

  dialog.value = true;
}

// Cerrar el diálogo y resetear el formulario
function closeDialog() {
  dialog.value = false;
  // Pequeño delay para que la animación se vea bien
  setTimeout(resetForm, 300);
}

// Resetear formulario
function resetForm() {
  if (formRef.value) {
    formRef.value.resetValidation();
  }

  form.nombre = "";
  form.correo = "";
  form.contraseña = "";
  form.rol = "REGULAR";
  form.isActive = true;
  currentId.value = "";
}

// Guardar usuario (crear o actualizar)
async function saveUsuario() {
  // Validar formulario
  if (!formRef.value.validate()) return;

  try {
    isSubmitting.value = true;

    if (editMode.value) {
      // EDICIÓN: Preparar datos, eliminando contraseña si está vacía
      const userData = { ...form };
      if (!userData.contraseña) {
        delete userData.contraseña;
      }

      // Enviar actualización
      const updatedUser = await updateUsuario(currentId.value, userData);

      if (updatedUser) {
        showSnackbar(`Usuario ${updatedUser.nombre} actualizado correctamente`);
        dialog.value = false;
      } else {
        showSnackbar("No se pudo actualizar el usuario", "error");
      }
    } else {
      // CREACIÓN: Los administradores pueden crear usuarios con cualquier rol
      const result = await createUsuario({
        nombre: form.nombre,
        correo: form.correo,
        contraseña: form.contraseña,
        rol: form.rol,
        isActive: form.isActive,
      });

      if (result.success) {
        showSnackbar(`Usuario ${result.usuario?.nombre} creado correctamente`);
        dialog.value = false;

        // Refrescar lista para asegurar que tenemos los datos actualizados
        await fetchUsuarios();
      } else {
        showSnackbar(result.error || "Error al crear usuario", "error");
      }
    }
  } catch (e) {
    console.error("Error en operación:", e);
    showSnackbar(
      "Error en la operación. Verifique la consola para más detalles.",
      "error"
    );
  } finally {
    isSubmitting.value = false;
  }
}

// Mostrar diálogo para confirmar cambio de estado
function toggleUserStatus(usuario: Usuario) {
  userToToggle.value = usuario;
  confirmDialog.value = true;
}

// Confirmar y ejecutar cambio de estado
async function confirmToggleStatus() {
  if (!userToToggle.value) return;

  try {
    isSubmitting.value = true;

    const result = await updateUsuario(userToToggle.value.id, {
      isActive: !userToToggle.value.isActive,
    });

    if (result) {
      const statusText = result.isActive ? "activado" : "desactivado";
      showSnackbar(`Usuario ${result.nombre} ${statusText} correctamente`);

      // Cerrar diálogo
      confirmDialog.value = false;
      userToToggle.value = null;
    } else {
      showSnackbar("Error al cambiar estado del usuario", "error");
    }
  } catch (e) {
    console.error("Error cambiando estado:", e);
    showSnackbar("Error al cambiar estado del usuario", "error");
  } finally {
    isSubmitting.value = false;
  }
}

// Función para mostrar notificaciones
function showSnackbar(text: string, color: string = "success") {
  snackbar.text = text;
  snackbar.color = color;
  snackbar.show = true;
}
</script>
