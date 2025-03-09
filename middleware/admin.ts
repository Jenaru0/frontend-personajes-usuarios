export default defineNuxtRouteMiddleware(() => {
  const { user, isAdmin } = useAuth();

  // Verificación más segura para admin
  if (!user.value || user.value.rol !== "ADMIN") {
    return navigateTo("/inicio");
  }
});
