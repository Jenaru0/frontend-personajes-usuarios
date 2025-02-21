import { ref, computed } from "vue";

export interface LocalCharacter {
  id: number;
  name: string;
  description: string;
  image?: string;
  isLocal?: boolean;
  apiId?: number;
  // Propiedades adicionales para datos de la API
  status?: string;
  species?: string;
  gender?: string;
  origin?: string;
  location?: string;
}

export interface RickAndMortyAPI {
  info: {
    count: number;
    pages: number;
    next: string;
    prev: null | string;
  };
  results: RickCharacter[];
}

export interface RickCharacter {
  id: number;
  name: string;
  image: string;
  status: string;
  species: string;
  gender: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  [key: string]: any;
}

const STORAGE_KEY = "localCharacters";
const localCharacters = ref<LocalCharacter[]>([]);
const apiCharacters = ref<RickCharacter[]>([]);

function loadLocalCharacters() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    localCharacters.value = stored ? JSON.parse(stored) : [];
  }
}

function saveLocalCharacters() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(localCharacters.value));
}

// Genera IDs negativos para personajes locales creados directamente
function generateLocalId(): number {
  const localOnly = localCharacters.value.filter((c) => c.apiId === undefined);
  if (localOnly.length === 0) return -1;
  const minId = Math.min(...localOnly.map((c) => c.id));
  return minId - 1;
}

export function useCharacters() {
  // Cargar locales solo en cliente
  if (process.client) {
    loadLocalCharacters();
  }
  // Llamada a la API: se ejecuta tanto en SSR como en cliente
  fetchApiCharacters();

  async function fetchApiCharacters() {
    try {
      const { data, error } = await useFetch<RickAndMortyAPI>(
        "https://rickandmortyapi.com/api/character"
      );
      if (error.value) {
        console.error("Error al obtener personajes:", error.value);
      } else if (data.value) {
        apiCharacters.value = data.value.results;
      }
    } catch (err) {
      console.error("Error al obtener personajes de la API:", err);
    }
  }

  const allCharacters = computed<LocalCharacter[]>(() => {
    // Mapeamos los locales que son ediciones de personajes de la API (tienen apiId)
    const localEdits = new Map<number, LocalCharacter>();
    localCharacters.value.forEach((c) => {
      if (c.apiId !== undefined) {
        localEdits.set(c.apiId, { ...c, isLocal: true });
      }
    });

    // Para cada personaje de la API, se utiliza la copia local si existe
    const mergedApi = apiCharacters.value.map((apiChar) => {
      if (localEdits.has(apiChar.id)) {
        return localEdits.get(apiChar.id)!;
      } else {
        return {
          id: apiChar.id,
          name: apiChar.name,
          image: apiChar.image,
          description: "",
          isLocal: false,
          status: apiChar.status,
          species: apiChar.species,
          gender: apiChar.gender,
          origin: apiChar.origin.name,
          location: apiChar.location.name,
          apiId: undefined,
        } as LocalCharacter;
      }
    });

    // Se incluyen los personajes creados localmente (no derivados de la API)
    const localNew = localCharacters.value.filter((c) => c.apiId === undefined);

    return [...localNew, ...mergedApi];
  });

  function createCharacter(data: Partial<LocalCharacter>) {
    const newChar: LocalCharacter = {
      id: generateLocalId(),
      name: data.name || "Sin nombre",
      description: data.description || "",
      image:
        data.image ||
        "https://www.svgrepo.com/show/508699/landscape-placeholder.svg",
      isLocal: true,
    };
    localCharacters.value.unshift(newChar);
    saveLocalCharacters();
  }

  /**
   * Actualiza un personaje:
   * - Si ya existe en locales, se actualiza.
   * - Si es un personaje de la API (sin copia), se crea una copia local con apiId.
   */
  function updateCharacter(id: number, updatedData: Partial<LocalCharacter>) {
    const index = localCharacters.value.findIndex((c) => c.id === id);
    if (index !== -1) {
      localCharacters.value[index] = {
        ...localCharacters.value[index],
        ...updatedData,
      };
      saveLocalCharacters();
    } else {
      const localIndex = localCharacters.value.findIndex((c) => c.apiId === id);
      if (localIndex !== -1) {
        localCharacters.value[localIndex] = {
          ...localCharacters.value[localIndex],
          ...updatedData,
        };
      } else {
        const newCopy: LocalCharacter = {
          id: generateLocalId(),
          apiId: id,
          name: updatedData.name || "Sin nombre",
          description: updatedData.description || "",
          image:
            updatedData.image ||
            "https://via.placeholder.com/200?text=API+Edited",
          isLocal: true,
          status: updatedData.status,
          species: updatedData.species,
          gender: updatedData.gender,
          origin: updatedData.origin,
          location: updatedData.location,
        };
        localCharacters.value.unshift(newCopy);
      }
      saveLocalCharacters();
    }
  }

  function deleteCharacter(id: number) {
    localCharacters.value = localCharacters.value.filter((c) => {
      if (c.id === id) return false;
      if (c.apiId === id) return false;
      return true;
    });
    saveLocalCharacters();
  }

  return {
    allCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
  };
}
