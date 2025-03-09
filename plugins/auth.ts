// plugins/auth.ts
export default defineNuxtPlugin(async () => {
  const { user, token } = useAuth();
  // Recuperar usuario desde cookies si hay token pero no usuario
  if (token.value && !user.value) {
    const userCookie = useCookie("user").value;
    if (userCookie) {
      user.value = userCookie;
    }
  }
});
