<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Gestión de Usuarios</span>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openUserModal()"
            >
              Nuevo Usuario
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="users"
              :loading="loading"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.actions="{ item }">
                <v-tooltip bottom>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      variant="text"
                      color="primary"
                      v-bind="props"
                      @click="openUserModal(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  <span>Editar</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      icon
                      variant="text"
                      color="error"
                      v-bind="props"
                      @click="confirmDelete(item)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                  <span>Eliminar</span>
                </v-tooltip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal para crear/editar usuario -->
    <v-dialog v-model="userDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form">
            <v-text-field
              v-model="editedUser.nombre"
              label="Nombre"
              :rules="[rules.required]"
            ></v-text-field>
            <v-text-field
              v-model="editedUser.correo"
              label="Correo electrónico"
              :rules="[rules.required, rules.email]"
            ></v-text-field>
            <v-select
              v-model="editedUser.rol"
              :items="['ADMIN', 'REGULAR']"
              label="Rol"
              :rules="[rules.required]"
            ></v-select>
            <v-text-field
              v-model="editedUser.contraseña"
              label="Contraseña"
              type="password"
              :rules="editMode ? [] : [rules.required]"
              hint="Deje en blanco para mantener la contraseña actual"
              persistent-hint
              v-if="editMode"
            ></v-text-field>
            <v-text-field
              v-model="editedUser.contraseña"
              label="Contraseña"
              type="password"
              :rules="[rules.required]"
              v-else
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeUserModal">
            Cancelar
          </v-btn>
          <v-btn color="blue-darken-1" variant="text" @click="saveUser">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de confirmación para eliminar -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Eliminar Usuario</span>
        </v-card-title>
        <v-card-text>
          ¿Está seguro de que desea eliminar este usuario?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn color="error" variant="text" @click="deleteUser">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "~/stores/auth";
import { useFormRules } from "~/composables/rules"; // Corrección: importar useFormRules en lugar de useRules

// Definir interfaz para los usuarios
interface User {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  contraseña?: string;
  isActive: boolean;
}

const authStore = useAuthStore(); // Corrección: usar authStore en lugar de loginStore
const rules = useFormRules(); // Corrección: usar useFormRules()

// Verificar si el usuario es administrador
if (!authStore.isAdmin) {
  navigateTo("/characters");
}

// Estado de la tabla de usuarios
const users = ref<User[]>([]);
const loading = ref(true);
const headers = [
  { title: "Nombre", key: "nombre" },
  { title: "Correo", key: "correo" },
  { title: "Rol", key: "rol" },
  {
    title: "Estado",
    key: "isActive",
    value: (item: User) => (item.isActive ? "Activo" : "Inactivo"),
  },
  { title: "Acciones", key: "actions", sortable: false },
];

// Estado del modal para crear/editar usuario
const userDialog = ref(false);
const editMode = ref(false);
const editedIndex = ref(-1);
const editedUser = ref<User>({
  id: "",
  nombre: "",
  correo: "",
  rol: "REGULAR",
  contraseña: "",
  isActive: true,
});
const defaultUser: User = {
  id: "",
  nombre: "",
  correo: "",
  rol: "REGULAR",
  contraseña: "",
  isActive: true,
};

// Estado del modal para eliminar usuario
const deleteDialog = ref(false);
const userToDelete = ref<User | null>(null);

// Título del formulario según modo (crear o editar)
const formTitle = computed(() => {
  return editMode.value ? "Editar Usuario" : "Nuevo Usuario";
});

// Cargar usuarios al montar el componente
onMounted(async () => {
  await fetchUsers();
});

// Obtener usuarios desde el backend
async function fetchUsers() {
  loading.value = true;
  try {
    const response = await fetch("http://localhost:3020/usuarios", {
      headers: {
        Authorization: `Bearer ${authStore.token}`, // Corrección: usar authStore
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener usuarios");
    }

    const data = await response.json();
    users.value = data.usuarios;
  } catch (error) {
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
}

// Abrir modal para crear o editar usuario
function openUserModal(user: User | null = null) {
  if (user) {
    editMode.value = true;
    editedIndex.value = users.value.indexOf(user);
    editedUser.value = { ...user, contraseña: "" }; // No enviamos la contraseña en la edición
  } else {
    editMode.value = false;
    editedUser.value = { ...defaultUser };
  }
  userDialog.value = true;
}

// Cerrar modal de usuario
function closeUserModal() {
  userDialog.value = false;
  editedUser.value = { ...defaultUser };
  editedIndex.value = -1;
}

// Guardar usuario (crear o actualizar)
async function saveUser() {
  try {
    if (editMode.value) {
      // Actualizar usuario existente
      const response = await fetch(
        `http://localhost:3020/usuarios/${editedUser.value.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authStore.token}`, // Corrección: usar authStore
          },
          body: JSON.stringify(editedUser.value),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar usuario");
      }

      const data = await response.json();
      if (editedIndex.value >= 0) {
        Object.assign(users.value[editedIndex.value], data.usuario);
      }
    } else {
      // Crear nuevo usuario
      const response = await fetch("http://localhost:3020/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`, // Corrección: usar authStore
        },
        body: JSON.stringify(editedUser.value),
      });

      if (!response.ok) {
        throw new Error("Error al crear usuario");
      }

      const data = await response.json();
      users.value.push(data.usuario);
    }

    closeUserModal();
  } catch (error) {
    console.error("Error:", error);
  }
}

// Confirmar eliminación de usuario
function confirmDelete(user: User) {
  userToDelete.value = user;
  deleteDialog.value = true;
}

// Eliminar usuario
async function deleteUser() {
  if (!userToDelete.value) return; // Corrección: verificar que userToDelete no sea null

  try {
    const response = await fetch(
      `http://localhost:3020/usuarios/${userToDelete.value.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authStore.token}`, // Corrección: usar authStore
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al eliminar usuario");
    }

    const index = users.value.indexOf(userToDelete.value);
    if (index >= 0) {
      users.value.splice(index, 1);
    }

    deleteDialog.value = false;
  } catch (error) {
    console.error("Error:", error);
  }
}
</script>
