// composables/useApi.ts
import { useFetch, useRuntimeConfig } from "#app";

export function useApi() {
  const token = useCookie("token");
  const baseURL = "http://localhost:3020";

  const getHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token.value) {
      headers["Authorization"] = `Bearer ${token.value}`;
    }

    return headers;
  };

  const apiGet = async (endpoint: string) => {
    try {
      console.log(`Ejecutando GET a: ${baseURL}${endpoint}`);
      const response = await useFetch(`${baseURL}${endpoint}`, {
        method: "GET",
        headers: getHeaders(),
      });

      // Verificar respuesta
      if (response.error.value) {
        console.error(`Error en GET ${endpoint}:`, response.error.value);
      }

      return response;
    } catch (error) {
      console.error(`Error en GET ${endpoint}:`, error);
      throw error;
    }
  };

  const apiPost = async (endpoint: string, body: any) => {
    try {
      console.log(`Ejecutando POST a: ${baseURL}${endpoint}`);
      const response = await useFetch(`${baseURL}${endpoint}`, {
        method: "POST",
        body,
        headers: getHeaders(),
      });

      if (response.error.value) {
        console.error(`Error en POST ${endpoint}:`, response.error.value);
      }

      return response;
    } catch (error) {
      console.error(`Error en POST ${endpoint}:`, error);
      throw error;
    }
  };

  const apiPut = async (endpoint: string, body: any) => {
    try {
      console.log(`Ejecutando PUT a: ${baseURL}${endpoint}`);
      const response = await useFetch(`${baseURL}${endpoint}`, {
        method: "PUT",
        body,
        headers: getHeaders(),
      });

      if (response.error.value) {
        console.error(`Error en PUT ${endpoint}:`, response.error.value);
      }

      return response;
    } catch (error) {
      console.error(`Error en PUT ${endpoint}:`, error);
      throw error;
    }
  };

  const apiDelete = async (endpoint: string) => {
    try {
      console.log(`Ejecutando DELETE a: ${baseURL}${endpoint}`);
      const response = await useFetch(`${baseURL}${endpoint}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (response.error.value) {
        console.error(`Error en DELETE ${endpoint}:`, response.error.value);
      }

      return response;
    } catch (error) {
      console.error(`Error en DELETE ${endpoint}:`, error);
      throw error;
    }
  };

  // Función para manejar refresh token
  const refreshUserToken = async () => {
    if (!refreshToken.value) return false;

    const { data, error } = await useFetch("/auth/refresh", {
      baseURL,
      method: "POST",
      body: { refreshToken: refreshToken.value },
    });

    if (error.value) return false;

    if (data.value?.token) {
      token.value = data.value.token;
      return true;
    }

    return false;
  };

  return {
    apiGet,
    apiPost,
    apiPut,
    apiDelete,
    refreshUserToken,
  };
}
