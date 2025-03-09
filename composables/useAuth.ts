// composables/useAuth.ts
export function useAuth() {
  // Usar useState para mantener el estado del usuario en toda la aplicación
  const user = useState<any>("user", () => {
    // Inicializar desde la cookie si existe
    const userCookie = useCookie("user").value;
    return userCookie || null;
  });

  const token = useState<string | null>(
    "token",
    () => useCookie("token").value
  );
  const refreshToken = useState<string | null>(
    "refreshToken",
    () => useCookie("refreshToken").value
  );

  const { apiPost } = useApi();

  const login = async (correo: string, contraseña: string) => {
    try {
      const { data, error } = await apiPost("/auth/login", {
        correo,
        contraseña,
      });

      if (error.value) return { success: false, error: error.value };

      if (data.value) {
        // Guardar datos de sesión en el estado y en cookies
        token.value = data.value.token;
        refreshToken.value = data.value.refreshToken;
        user.value = data.value.usuario;

        // Guardar también en cookies para persistencia
        const tokenCookie = useCookie("token");
        const refreshTokenCookie = useCookie("refreshToken");
        const userCookie = useCookie("user");

        tokenCookie.value = data.value.token;
        refreshTokenCookie.value = data.value.refreshToken;
        userCookie.value = data.value.usuario;

        return { success: true, user: data.value.usuario };
      }

      return { success: false, error: "Error desconocido" };
    } catch (e) {
      console.error("Error en login:", e);
      return { success: false, error: "Error de conexión" };
    }
  };

  const logout = () => {
    // Limpiar estado
    user.value = null;
    token.value = null;
    refreshToken.value = null;

    // Limpiar cookies
    const tokenCookie = useCookie("token");
    const refreshTokenCookie = useCookie("refreshToken");
    const userCookie = useCookie("user");

    tokenCookie.value = null;
    refreshTokenCookie.value = null;
    userCookie.value = null;

    navigateTo("/");
  };

  // Función más robusta para verificar rol de administrador
  const isAdmin = () => {
    return user.value && user.value.rol === "ADMIN";
  };

  return {
    user,
    token,
    login,
    logout,
    isAdmin,
  };
}
