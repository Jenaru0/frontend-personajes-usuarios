// composables/useUsuarios.ts
import { ref } from "vue";
import { useApi } from "./useApi";
import type { FetchError } from "ofetch";

// Definir interfaces para tipar correctamente los datos
interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: "ADMIN" | "REGULAR";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Mejorar el tipo de respuesta API para manejar correctamente las propiedades opcionales
interface ApiResponse {
  message?: string;
  usuario?: Usuario;
  usuarios?: Usuario[];
  error?: string;
  [key: string]: any;
}

interface CreateUserResponse {
  success: boolean;
  usuario?: Usuario;
  error?: string;
}

// Tipo para el error de una operación API
type ApiErrorType = FetchError<{
  error?: string;
  errors?: Array<{ msg: string }>;
}>;

export function useUsuarios() {
  const { apiGet, apiPost, apiPut, apiDelete } = useApi();
  const usuarios = ref<Usuario[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Listar usuarios
  const fetchUsuarios = async (): Promise<Usuario[]> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data, error: apiError } = await apiGet("/usuarios");

      if (apiError.value) {
        const errorData = apiError.value.data as { error?: string };
        error.value = errorData?.error || "Error al cargar usuarios";
        return [];
      }

      // Usar type assertion para indicar a TypeScript el tipo correcto
      const responseData = data.value as ApiResponse;
      usuarios.value = responseData?.usuarios || [];
      return usuarios.value;
    } catch (e) {
      console.error("Error en fetchUsuarios:", e);
      error.value = "Error de conexión";
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // Crear usuario (admin)
  const createUsuario = async (userData: {
    nombre: string;
    correo: string;
    contraseña: string;
    rol?: "ADMIN" | "REGULAR"; // Añadir rol como opcional
    isActive?: boolean; // Añadir isActive como opcional
  }): Promise<CreateUserResponse> => {
    try {
      // Preparar datos incluyendo rol e isActive si están presentes
      const allowedData: any = {
        nombre: userData.nombre,
        correo: userData.correo,
        contraseña: userData.contraseña,
      };

      // Solo incluir estos campos si se proporcionan
      if (userData.rol) allowedData.rol = userData.rol;
      if (userData.isActive !== undefined)
        allowedData.isActive = userData.isActive;

      // Usar la ruta de administrador si se envían campos de administrador
      const endpoint =
        userData.rol || userData.isActive !== undefined
          ? "/auth/register/admin"
          : "/auth/register";

      const { data, error: apiError } = await apiPost(endpoint, allowedData);

      if (apiError.value) {
        // Extraer mensaje de error específico de forma segura
        const errorData = apiError.value.data as {
          error?: string;
          errors?: Array<{ msg: string }>;
        };

        const errorMessage =
          errorData?.error ||
          errorData?.errors?.[0]?.msg ||
          "Error al crear el usuario";

        error.value = errorMessage;
        return { success: false, error: errorMessage };
      }

      // Usar type assertion para el tipo de respuesta
      const responseData = data.value as ApiResponse;
      if (responseData?.usuario) {
        usuarios.value.push(responseData.usuario);
        return { success: true, usuario: responseData.usuario };
      }

      return { success: false, error: "Error inesperado" };
    } catch (e) {
      const errorMsg = "Error de conexión al intentar crear el usuario";
      console.error(errorMsg, e);
      error.value = errorMsg;
      return { success: false, error: errorMsg };
    }
  };

  // Actualizar un usuario
  const updateUsuario = async (
    id: string,
    userData: Partial<Usuario>
  ): Promise<Usuario | null> => {
    try {
      const { data, error: apiError } = await apiPut(
        `/usuarios/${id}`,
        userData
      );

      if (apiError.value) {
        const errorData = apiError.value.data as { error?: string };
        error.value = errorData?.error || "Error al actualizar usuario";
        return null;
      }

      // Usar type assertion para el tipo de respuesta
      const responseData = data.value as ApiResponse;

      // Actualizar la lista local de forma segura
      if (responseData?.usuario) {
        const index = usuarios.value.findIndex((u) => u.id === id);
        if (index >= 0) {
          usuarios.value[index] = responseData.usuario;
        }
        return responseData.usuario;
      }

      return null;
    } catch (e) {
      console.error("Error en updateUsuario:", e);
      error.value = "Error de conexión";
      return null;
    }
  };

  // Eliminar un usuario (soft delete)
  const deleteUsuario = async (id: string): Promise<boolean> => {
    try {
      const { data, error: apiError } = await apiDelete(`/usuarios/${id}`);

      if (apiError.value) {
        const errorData = apiError.value.data as { error?: string };
        error.value = errorData?.error || "Error al eliminar usuario";
        return false;
      }

      // Usar type assertion para el tipo de respuesta
      const responseData = data.value as ApiResponse;

      // Actualizar la lista local de forma segura
      if (responseData?.usuario) {
        const index = usuarios.value.findIndex((u) => u.id === id);
        if (index >= 0) {
          usuarios.value[index] = responseData.usuario; // Actualizado con isActive=false
        }
      }

      return true;
    } catch (e) {
      console.error("Error en deleteUsuario:", e);
      error.value = "Error de conexión";
      return false;
    }
  };

  return {
    usuarios,
    isLoading,
    error,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
  };
}
