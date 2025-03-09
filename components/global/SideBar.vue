<script setup lang="ts">
import { useDisplay } from "vuetify";
import type { Company } from "~/interfaces/Company.interface";
const { mobile } = useDisplay();
const { user, isAdmin } = useAuth();

// Usar useState para mantener el estado consistente en toda la aplicación
const drawer = useState("drawer", () => true);
const rail = useState("rail", () => false);

const company = useCookie<Company>("company");
company.value = {
  name: "UNDC",
  logo: "https://www.undc.edu.ar/wp-content/uploads/2020/03/logo-undc.png",
};

// Estructura del menú con las nuevas rutas
const menus = computed(() => [
  // Básico - Para todos
  {
    icon: "mdi-home",
    title: "Inicio",
    value: "inicio",
    to: "/inicio",
    view: true,
    toSub: null,
  },
  // API Rick and Morty - Para todos (inspiración)
  {
    icon: "mdi-television-classic",
    title: "API Rick And Morty",
    value: "api-personajes",
    to: "/characters",
    view: true,
    toSub: null,
  },
  // Mis Personajes - CRUD real para usuarios
  {
    icon: "mdi-account-group",
    title: "Mis Personajes",
    value: "mis-personajes",
    to: "/mis-personajes",
    view: true,
    toSub: null,
  },
  // Administración - Solo admins
  {
    icon: "mdi-shield-account",
    title: "Administración",
    value: "admin",
    to: "#",
    view: isAdmin(),
    toSub: [
      {
        title: "Gestión de Usuarios",
        value: "usuarios",
        to: "/admin/usuarios",
        view: isAdmin(),
        icon: "mdi-account-multiple-check",
      },
      {
        title: "Todos los Personajes",
        value: "todos-personajes",
        to: "/admin/personajes",
        view: isAdmin(),
        icon: "mdi-human-queue",
      },
    ],
  },
]);
</script>

<template>
  <v-navigation-drawer
    expand-on-hover
    v-model="drawer"
    :temporary="mobile"
    :rail="!mobile ? rail : false"
    theme="dark"
    :width="280"
    <!--
    Añadir
    esta
    propiedad
    para
    controlar
    el
    ancho
    --
  >
    >
    <!-- Logo -->
    <v-list-item
      class="d-flex align-center justify-center"
      prepend-avatar="https://upload.wikimedia.org/wikipedia/commons/5/59/UNDC_logo.jpg"
      nav
    >
    </v-list-item>

    <v-divider></v-divider>

    <!-- Menú principal -->
    <v-list nav>
      <div v-for="menu in menus" :key="menu.to">
        <!-- Elemento simple sin submenú -->
        <v-list-item
          v-if="!menu.toSub && menu.view"
          :to="menu.to"
          :prepend-icon="menu.icon"
          :title="menu.title"
          :value="menu.value"
        ></v-list-item>

        <!-- Elemento con submenú -->
        <template v-else-if="menu.view">
          <v-list-group :value="menu.value">
            <!-- Título del grupo -->
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                :prepend-icon="menu.icon"
                :title="menu.title"
                :value="menu.value"
              ></v-list-item>
            </template>

            <!-- Subelementos -->
            <v-list-item
              v-for="(subMenu, i) in menu.toSub"
              :key="i"
              v-show="subMenu.view"
              :to="subMenu.to"
              :prepend-icon="subMenu.icon"
              :title="subMenu.title"
              :value="subMenu.value"
            ></v-list-item>
          </v-list-group>
        </template>
      </div>
    </v-list>

    <!-- Sección de usuario -->
    <template v-slot:append>
      <div class="pa-2">
        <v-list-item v-if="user">
          <template v-slot:prepend>
            <v-avatar color="primary">
              {{ user.nombre?.charAt(0).toUpperCase() }}
            </v-avatar>
          </template>
          <v-list-item-title>{{ user.nombre }}</v-list-item-title>
          <v-list-item-subtitle>
            <v-chip size="x-small" :color="isAdmin() ? 'error' : 'primary'">
              {{ isAdmin() ? "ADMIN" : "USUARIO" }}
            </v-chip>
          </v-list-item-subtitle>
        </v-list-item>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
/* Añadir estos estilos para asegurar que los textos largos se muestren correctamente */
:deep(.v-list-item__title) {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  line-height: 1.2;
}

:deep(.v-list-item__content) {
  overflow: visible;
}

/* Opcional: aumentar ligeramente el espacio vertical para acomodar dos líneas si es necesario */
:deep(.v-list-item) {
  min-height: 44px;
}
</style>
