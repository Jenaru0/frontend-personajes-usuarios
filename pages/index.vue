<script setup lang="ts">
definePageMeta({
  layout: "auth",
});
import type { Login } from "@/interfaces/Login.Interface";
const apiURL = useCookie("apiURL");
const userLogin = useCookie<Login>("user");
const email = ref("");
const password = ref("");
const loadingLogin = ref(false);
const SingUp = () => {
  navigateTo("/inicio");
};
const { ruleEmail, rulePassLen, ruleRequired } = useFormRules();
const decodeToken = ref();
const msgAlert = ref("");
const onClickLogin = async () => {
  loadingLogin.value = true;
  if (!email.value || !password.value) {
    msgAlert.value = "Llene los datos correctamente";
    loadingLogin.value = false;
    return;
  }
  // const { data: resLogin, pending: pendingLogin, error } = await useFetch<Login>(`${apiURL.value}/auth/login`,
  //   {
  //     method: "POST",
  //     body: {
  //       email: email.value,
  //       password: password.value,
  //     },
  //     headers: {
  //       // Authorization: `Bearer ${userCookie.value.token}`,
  //     },
  //   }
  // );
  // if (!resLogin.value?.status) {
  //   msgAlert.value = "Las credenciales proporcionadas no son correctos";
  //   loadingLogin.value = false;
  //   return;
  // }
  // userLogin.value = resLogin.value
  // loadingLogin.value = false;
  navigateTo("/inicio");
};

const decodeTokenBtn = async () => {
  const { data: tokenDec } = await useFetch<Login>(
    `${apiURL.value}/auth/refresh-token`,
    {
      method: "POST",
      body: {
        token: userLogin.value.token,
      },
      headers: {
        // Authorization: `Bearer ${userCookie.value.token}`,
      },
    }
  );
  decodeToken.value = tokenDec.value;
};
</script>

<template>
  <v-container fluid class="fill-height">
    <v-row no-gutters class="fill-height d-flex align-center justify-center">
      <v-col cols="12" md="6" lg="5" sm="6">
        <v-row no-gutters class="d-flex align-center justify-center">
          <v-col cols="12" md="6">
            <h1>Iniciar sesión</h1>
            <p class="text-medium-emphasis">Ingresa tus datos</p>

            <!-- <UtilsTextanimate></UtilsTextanimate> -->

            <!-- <VForm @submit.prevent="submit" class="mt-7"> -->
            <v-card></v-card>

            <div class="mt-1">
              <label class="label text-grey-darken-2" for="email">Email</label>
              <VTextField
                :rules="[ruleRequired, ruleEmail]"
                v-model="email"
                prepend-inner-icon="fluent:mail-24-regular"
                id="email"
                name="email"
                type="email"
                @keydown.enter="onClickLogin"
              />
            </div>
            <div class="mt-1">
              <label class="label text-grey-darken-2" for="password"
                >Contraseña</label
              >
              <VTextField
                :rules="[ruleRequired, rulePassLen]"
                v-model="password"
                prepend-inner-icon="fluent:password-20-regular"
                id="password"
                name="password"
                type="password"
                @keydown.enter="onClickLogin"
              />
            </div>
            <div class="my-2">
              <v-alert v-if="msgAlert" color="error">{{ msgAlert }}</v-alert>
            </div>
            <div class="mt-5">
              <!-- <VBtn type="submit" block min-height="44" class="gradient primary" to="/characters">Ingresar</VBtn> -->
              <v-btn
                @click="onClickLogin"
                :loading="loadingLogin"
                block
                min-height="44"
                class="gradient primary"
                >Ingresar</v-btn
              >
            </div>
            <!-- </VForm> -->
            <!-- <p class="text-body-2 mt-10">
              <NuxtLink to="/reset-password" class="font-weight-bold text-primary">¿Has olvidado tu contraseña?</NuxtLink>
            </p>
            <p class="text-body-2 mt-4">
              <span>¿No tienes una cuenta?
                <NuxtLink to="/signup" class="font-weight-bold text-primary">Registrate</NuxtLink>
              </span>
            </p> -->
            <!-- <v-btn block min-height="44" @click="decodeTokenBtn()" class="gradient primary">decodetoken</v-btn> -->
          </v-col>
        </v-row>
      </v-col>
      <VCol
        class="hidden-md-and-down fill-height d-flex align-center justify-center"
        md="6"
        lg="7"
      >
        <VImg src="public/fondo/fondo1.png" max-width="75%">
          <div class="text-center w-50 text-white mx-auto align-center">
            <!-- <h2 class="mb-4">Sistema de Gestión Empresarial</h2> -->
            <!-- <p>
              Ventas.
              Inventario.
            </p> -->
          </div>
        </VImg>
      </VCol>
    </v-row>
  </v-container>
</template>
