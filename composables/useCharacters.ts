import { ref, computed } from "vue";

export interface LocalCharacter {
  id: number;
  name: string;
  description: string;
  image?: string;
  isLocal?: boolean;
  apiId?: number;
  // Campos adicionales (datos de la API)
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
const DELETED_KEY = "deletedCharacters";

const localCharacters = ref<LocalCharacter[]>([]);
const apiCharacters = ref<RickCharacter[]>([]);
const deletedCharacters = ref<number[]>([]);

function loadLocalCharacters() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY);
    localCharacters.value = stored ? JSON.parse(stored) : [];
  }
}

function saveLocalCharacters() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(localCharacters.value));
}

function loadDeletedCharacters() {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(DELETED_KEY);
    deletedCharacters.value = stored ? JSON.parse(stored) : [];
  }
}

function saveDeletedCharacters() {
  localStorage.setItem(DELETED_KEY, JSON.stringify(deletedCharacters.value));
}

// Genera IDs negativos para personajes locales creados directamente
function generateLocalId(): number {
  const localOnly = localCharacters.value.filter((c) => c.apiId === undefined);
  if (localOnly.length === 0) return -1;
  const minId = Math.min(...localOnly.map((c) => c.id));
  return minId - 1;
}

export function useCharacters() {
  if (process.client) {
    loadLocalCharacters();
    loadDeletedCharacters();
  }

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
    // Mapeamos las ediciones locales de personajes de la API
    const localEdits = new Map<number, LocalCharacter>();
    localCharacters.value.forEach((c) => {
      if (c.apiId !== undefined) {
        localEdits.set(c.apiId, { ...c, isLocal: true });
      }
    });

    // Fusionamos personajes de la API con sus ediciones locales
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
          apiId: undefined,
          status: apiChar.status,
          species: apiChar.species,
          gender: apiChar.gender,
          origin: apiChar.origin?.name,
          location: apiChar.location?.name,
        };
      }
    });

    // Personajes locales creados desde cero
    const localNew = localCharacters.value.filter((c) => c.apiId === undefined);
    // Filtramos los personajes de la API marcados como borrados
    const filteredMergedApi = mergedApi.filter(
      (char) => !deletedCharacters.value.includes(char.id)
    );

    return [...localNew, ...filteredMergedApi];
  });

  function createCharacter(data: Partial<LocalCharacter>) {
    const newChar: LocalCharacter = {
      id: generateLocalId(),
      name: data.name || "Sin nombre",
      description: data.description || "",
      image:
        data.image || "https://via.placeholder.com/200?text=Local+Character",
      isLocal: true,
      status: data.status,
      species: data.species,
      gender: data.gender,
      origin: data.origin,
      location: data.location,
    };
    localCharacters.value.unshift(newChar);
    saveLocalCharacters();
  }

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
          isLocal: true,
          name: updatedData.name || "Sin nombre",
          description: updatedData.description || "",
          image:
            updatedData.image ||
            "https://via.placeholder.com/200?text=API+Edited",
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
    // Si es un personaje local (creado), se elimina directamente
    const localIndex = localCharacters.value.findIndex((c) => c.id === id);
    if (localIndex !== -1) {
      localCharacters.value.splice(localIndex, 1);
      saveLocalCharacters();
    } else {
      // Si es un personaje de la API, lo marcamos como borrado
      if (!deletedCharacters.value.includes(id)) {
        deletedCharacters.value.push(id);
        saveDeletedCharacters();
      }
    }
  }

  return {
    allCharacters,
    createCharacter,
    updateCharacter,
    deleteCharacter,
  };
}
