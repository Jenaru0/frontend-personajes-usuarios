import { ref } from "vue";
import { useApi } from "./useApi";

// Interfaz para definir la estructura de un personaje
interface Personaje {
  id: string;
  nombre: string;
  foto: string;
  userId: string;
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

export function usePersonajes() {
  const { apiGet, apiPost, apiPut, apiDelete } = useApi();
  const personajes = ref<Personaje[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Listar personajes
  const fetchPersonajes = async (): Promise<Personaje[]> => {
    isLoading.value = true;
    error.value = null;

    try {
      console.log("Obteniendo mis personajes");
      const { data, error: apiError } = await apiGet("/personajes/list");

      if (apiError.value) {
        console.error("Error al obtener personajes:", apiError.value);
        error.value =
          apiError.value?.data?.message || "Error al cargar personajes";
        isLoading.value = false;
        return [];
      }

      console.log("Personajes obtenidos:", data.value);
      const responseData = data.value as ApiResponse;
      personajes.value = responseData?.personajes || [];
      isLoading.value = false;
      return personajes.value;
    } catch (e) {
      console.error("Error inesperado:", e);
      error.value = "Error en la conexión";
      isLoading.value = false;
      return [];
    }
  };

  // Obtener un personaje
  const getPersonaje = async (id: string): Promise<Personaje | null> => {
    try {
      const { data, error: apiError } = await apiGet(`/personajes/only/${id}`);

      if (apiError.value) {
        error.value =
          apiError.value?.data?.message || "Error al obtener el personaje";
        return null;
      }

      const responseData = data.value as ApiResponse;
      return responseData?.personaje || null;
    } catch (e) {
      console.error("Error en getPersonaje:", e);
      error.value = "Error al obtener el personaje";
      return null;
    }
  };

  // Crear un personaje
  const createPersonaje = async (personajeData: {
    nombre: string;
    foto: string;
  }): Promise<Personaje | null> => {
    try {
      const { data, error: apiError } = await apiPost(
        "/personajes",
        personajeData
      );

      if (apiError.value) {
        // Extraer mensaje de error específico del backend
        let errorMessage = "Error al crear el personaje";
        if (apiError.value.data) {
          // Si hay un mensaje de error específico en la respuesta
          if (apiError.value.data.error) {
            errorMessage = apiError.value.data.error;
          } else if (
            apiError.value.data.errors &&
            apiError.value.data.errors.length > 0
          ) {
            errorMessage = apiError.value.data.errors[0].msg;
          }
        }
        error.value = errorMessage;
        return null;
      }

      // El resto del código igual
      const responseData = data.value as ApiResponse;
      if (responseData?.personaje) {
        personajes.value.push(responseData.personaje);
        return responseData.personaje;
      }

      return null;
    } catch (e) {
      console.error("Error en createPersonaje:", e);
      error.value = "Error al crear el personaje";
      return null;
    }
  };

  // Actualizar un personaje
  const updatePersonaje = async (
    id: string,
    personajeData: { nombre?: string; foto?: string }
  ): Promise<Personaje | null> => {
    try {
      const { data, error: apiError } = await apiPut(
        `/personajes/${id}`,
        personajeData
      );

      if (apiError.value) {
        // Extraer mensaje de error específico del backend
        let errorMessage = "Error al actualizar el personaje";
        if (apiError.value.data) {
          if (apiError.value.data.error) {
            errorMessage = apiError.value.data.error;
          } else if (
            apiError.value.data.errors &&
            apiError.value.data.errors.length > 0
          ) {
            errorMessage = apiError.value.data.errors[0].msg;
          }
        }
        error.value = errorMessage;
        return null;
      }

      // El resto del código permanece igual...
      const responseData = data.value as ApiResponse;
      if (responseData?.personaje) {
        const index = personajes.value.findIndex((p) => p.id === id);
        if (index >= 0) {
          personajes.value[index] = responseData.personaje;
        }
        return responseData.personaje;
      }

      return null;
    } catch (e) {
      console.error("Error en updatePersonaje:", e);
      error.value = "Error al actualizar el personaje";
      return null;
    }
  };

  // Eliminar un personaje
  const deletePersonaje = async (id: string): Promise<boolean> => {
    try {
      const { data, error: apiError } = await apiDelete(`/personajes/${id}`);

      if (apiError.value) {
        error.value =
          apiError.value?.data?.message || "Error al eliminar el personaje";
        return false;
      }

      // Eliminar de la lista local
      personajes.value = personajes.value.filter((p) => p.id !== id);
      return true;
    } catch (e) {
      console.error("Error en deletePersonaje:", e);
      error.value = "Error al eliminar el personaje";
      return false;
    }
  };

  return {
    personajes,
    isLoading,
    error,
    fetchPersonajes,
    getPersonaje,
    createPersonaje,
    updatePersonaje,
    deletePersonaje,
  };
}
