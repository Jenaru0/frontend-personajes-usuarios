<script lang="ts" setup>
import { VListItemSubtitle } from "vuetify/components";

export interface Character {
  info: Info;
  results: Result[];
}

export interface Info {
  count: number;
  pages: number;
  next: string;
  prev: null;
}

export interface Result {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: Location;
  location: Location;
  image: string;
  episode: string[];
  url: string;
  created: Date;
}

definePageMeta({
  middleware: ["auth"], // Y 'admin' para páginas administrativas
});

const { data } = await useFetch<Character>(
  "https://rickandmortyapi.com/api/character"
);
</script>
<template>
  <v-container fluid>
    <div>
      <v-row>
        <v-col v-for="item in data?.results" :key="item.id">
          <v-card class="mx-auto" max-width="344">
            <v-img height="200px" :src="item.image" cover></v-img>

            <v-card-title>
              {{ item.name }}
            </v-card-title>

            <v-card-subtitle> 1,000 miles of wonder </v-card-subtitle>

            <v-card-actions>
              <v-btn color="orange-lighten-2" text="Explore"></v-btn>

              <v-spacer></v-spacer>

              <!-- <v-btn :icon="show ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="show = !show"></v-btn> -->
            </v-card-actions>

            <v-expand-transition>
              <div v-show="false">
                <v-divider></v-divider>

                <v-card-text>
                  I'm a thing. But, like most politicians, he promised more than
                  he could deliver. You won't have time for sleeping, soldier,
                  not with all the bed making you'll be doing. Then we'll go
                  with that data file! Hey, you add a one and two zeros to that
                  or we walk! You're going to do his laundry? I've got to find a
                  way to escape.
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>
    </div>
    <!-- {{ data?.results }} -->

    <v-btn>Hello</v-btn>

    <VBtn>Hola</VBtn>
  </v-container>
</template>
