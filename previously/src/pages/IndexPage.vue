<template>
  <q-page class="bg-grey-1">
    <div class="q-pa-xl">
      <div class="row justify-center">
        <div class="col-12 col-md-8 col-lg-6">
          <div v-if="authStore.isAuthenticated" class="text-center">
            <UserProfile :user="authStore.user" @logout="authStore.logout" />
          </div>

          <div v-else class="text-center">
            <q-card class="login-card" elevated> </q-card>
          </div>

          <q-banner
            v-if="authStore.error"
            class="bg-negative text-white q-mt-md"
            rounded
            icon="error"
          >
            {{ authStore.error }}
          </q-banner>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

import UserProfile from '../components/UserProfile.vue';
import { useAuthStore } from '../stores/auth-store';

const authStore = useAuthStore();
const route = useRoute();

onMounted(async () => {
  await authStore.initializeAuth();

  const code = route.query.code as string;

  if (code) {
    try {
      await authStore.handleOAuthCallback(code);
    } catch (error) {
      console.error('Erreur lors de la gestion du callback OAuth:', error);
    }
  }
});
</script>

<style lang="scss" scoped>
.login-card {
  border-radius: 16px;
  background: white;
  max-width: 500px;
  margin: 0 auto;
}
</style>
