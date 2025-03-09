import { ref } from "vue";
import { useApi } from "./useApi";

// Interfaz para definir la estructura de un personaje
interface Personaje {
  id: string;
  nombre: string;
  foto: string;
  userId: string;
  usuario?: {
    id: string;
    nombre: string;
    correo: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Interfaz para la respuesta de la API
interface ApiResponse {
  message?: string;
  personaje?: Personaje;
  personajes?: Personaje[];
  error?: string;
  [key: string]: any;
}

export function useAdminPersonajes() {
  const { apiGet, apiPut, apiDelete, apiPost } = useApi();
  const allPersonajes = ref<Personaje[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Obtener todos los personajes (admin)
  const fetchAllPersonajes = async (): Promise<Personaje[]> => {
    isLoading.value = true;
    error.value = null;

    try {
      console.log("Obteniendo todos los personajes (ADMIN)");
      const { data, error: apiError } = await apiGet("/personajes/admin");

      if (apiError.value) {
        console.error("Error al obtener personajes (ADMIN):", apiError.value);
        error.value =
          apiError.value?.data?.message || "Error al cargar personajes";
        isLoading.value = false;
        return [];
      }

      console.log("Personajes obtenidos (ADMIN):", data.value);
      const responseData = data.value as ApiResponse;
      allPersonajes.value = responseData?.personajes || [];
      isLoading.value = false;
      return allPersonajes.value;
    } catch (e) {
      console.error("Error inesperado en fetchAllPersonajes:", e);
      error.value = "Error en la conexión";
      isLoading.value = false;
      return [];
    }
  };

  // Crear personaje como administrador
  const createPersonajeAdmin = async (personajeData: {
    nombre: string;
    foto: string;
    userId?: string;
  }): Promise<Personaje | null> => {
    try {
      const { data, error: apiError } = await apiPost(
        "/personajes/admin",
        personajeData
      );

      if (apiError.value) {
        const errorData = apiError.value.data as { message?: string };
        error.value = errorData?.message || "Error al crear personaje";
        return null;
      }

      // Actualizar en la lista local
      const responseData = data.value as ApiResponse;
      if (responseData?.personaje) {
        allPersonajes.value.unshift(responseData.personaje);
        return responseData.personaje;
      }

      return null;
    } catch (e) {
      console.error("Error en createPersonajeAdmin:", e);
      error.value = "Error al crear el personaje";
      return null;
    }
  };

  // Actualizar cualquier personaje (admin puede actualizar cualquiera)
  const updatePersonajeAdmin = async (
    id: string,
    personajeData: { nombre?: string; foto?: string }
  ): Promise<Personaje | null> => {
    try {
      const { data, error: apiError } = await apiPut(
        `/personajes/admin/${id}`,
        personajeData
      );

      if (apiError.value) {
        const errorData = apiError.value.data as { message?: string };
        error.value = errorData?.message || "Error al actualizar personaje";
        return null;
      }

      // Actualizar en la lista local
      const responseData = data.value as ApiResponse;
      if (responseData?.personaje) {
        const index = allPersonajes.value.findIndex((p) => p.id === id);
        if (index >= 0) {
          allPersonajes.value[index] = responseData.personaje;
        }
        return responseData.personaje;
      }

      return null;
    } catch (e) {
      console.error("Error en updatePersonajeAdmin:", e);
      error.value = "Error al actualizar el personaje";
      return null;
    }
  };

  // Eliminar cualquier personaje (admin puede eliminar cualquiera)
  const deletePersonajeAdmin = async (id: string): Promise<boolean> => {
    try {
      const { error: apiError } = await apiDelete(`/personajes/admin/${id}`);

      if (apiError.value) {
        const errorData = apiError.value.data as { message?: string };
        error.value = errorData?.message || "Error al eliminar personaje";
        return false;
      }

      // Actualizar la lista local
      allPersonajes.value = allPersonajes.value.filter((p) => p.id !== id);
      return true;
    } catch (e) {
      console.error("Error en deletePersonajeAdmin:", e);
      error.value = "Error al eliminar el personaje";
      return false;
    }
  };

  return {
    allPersonajes,
    isLoading,
    error,
    fetchAllPersonajes,
    createPersonajeAdmin, // Nueva función
    updatePersonajeAdmin,
    deletePersonajeAdmin,
  };
}
