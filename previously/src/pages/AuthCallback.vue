<template>
  <q-page class="bg-grey-1 row items-center justify-center">
    <div class="text-center q-pa-xl">
      <q-card class="callback-card" elevated>
        <q-card-section class="text-center q-pa-xl">
          <q-spinner-dots size="4rem" color="primary" class="q-mb-lg" />
          <div class="text-h5 text-weight-bold q-mb-md">Authentification en cours...</div>
          <div class="text-body1 text-grey-7">
            Veuillez patienter pendant que nous finalisons votre connexion
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth-store';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

onMounted(async () => {
  const code = route.query.code as string;

  if (!code) {
    void router.push('/');
    return;
  }

  try {
    await authStore.handleOAuthCallback(code);

    void router.push('/');
  } catch (error) {
    console.error("Erreur lors de l'authentification:", error);

    void router.push('/');
  }
});
</script>

<style lang="scss" scoped>
.callback-card {
  border-radius: 16px;
  background: white;
  max-width: 400px;
  margin: 0 auto;
}
</style>
