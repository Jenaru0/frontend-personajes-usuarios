export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth();

  // Si no hay usuario autenticado y no es la página de login, redirige al login
  if (!user.value && to.path !== "/") {
    return navigateTo("/");
  }
});
