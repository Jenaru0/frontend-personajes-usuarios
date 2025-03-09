<script setup lang="ts">
import { useDisplay } from "vuetify";
const { mobile } = useDisplay();
const drawer = useState("drawer");

// Usa el mismo useAuth en toda la aplicación
const { user, logout } = useAuth();

const logOut = async () => {
  await logout();
};
</script>

<template>
  <v-app-bar>
    <v-btn
      variant="text"
      icon="mdi-menu"
      @click.stop="drawer = !drawer"
    ></v-btn>
    <v-spacer></v-spacer>

    <!-- Menú de usuario -->
    <v-menu rounded :close-on-content-click="false" v-if="user">
      <template v-slot:activator="{ props }">
        <v-list
          v-if="!mobile"
          class="hidden-sm-and-down"
          v-bind="props"
          style="cursor: pointer"
        >
          <v-list-item :title="user.nombre" :subtitle="user.correo">
          </v-list-item>
        </v-list>
        <v-btn v-if="mobile" icon v-bind="props">
          <v-avatar color="brown" size="default">
            <span class="text-h5">{{ user.nombre.charAt(0) }}</span>
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-card-text>
          <div class="mx-auto text-center">
            <v-avatar color="brown">
              <span class="text-h5">{{ user.nombre.charAt(0) }}</span>
            </v-avatar>
            <h3>{{ user.nombre }}</h3>
            <p class="text-caption mt-1">
              {{ user.correo }}
            </p>
            <v-divider class="my-3"></v-divider>
            <v-btn
              block
              rounded
              variant="elevated"
              color="error"
              @click="logOut()"
            >
              Salir
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>
