import { defineStore } from "pinia";

// Define un tipo para el usuario
interface User {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  isActive?: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    token: "",
    isAuthenticated: false,
  }),

  getters: {
    isAdmin: (state) => state.user?.rol === "ADMIN",
    isActive: (state) => state.user?.isActive === true,
  },

  actions: {
    setUser(user: User) {
      this.user = user;
      this.isAuthenticated = !!user;
    },

    setToken(token: string) {
      this.token = token;
    },

    logout() {
      this.user = null;
      this.token = "";
      this.isAuthenticated = false;

      // Limpiar cookies también
      if (process.client) {
        const tokenCookie = useCookie("token");
        const refreshTokenCookie = useCookie("refreshToken");
        const userCookie = useCookie("user");

        tokenCookie.value = null;
        refreshTokenCookie.value = null;
        userCookie.value = null;
      }
    },

    // Método para inicializar el estado desde cookies/localStorage
    initAuth() {
      if (process.client) {
        const token = useCookie("token").value;
        const user = useCookie("user").value;

        if (token && user) {
          this.token = token;
          this.user = user;
          this.isAuthenticated = true;
        }
      }
    },
  },
});
