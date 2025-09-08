<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-primary">
      <q-toolbar>
        <q-btn flat no-caps class="text-primary text-weight-bold text-h6" to="/">
          Previously
        </q-btn>

        <q-space />

        <div class="row q-gutter-sm">
          <q-btn flat label="Séries" icon="tv" to="/series" class="text-primary" />
          <q-btn flat label="Films" icon="movie" to="/movies" class="text-primary" />
        </div>

        <q-space />

        <div>
          <q-btn-dropdown v-if="authStore.isAuthenticated" flat no-caps class="text-primary">
            <template v-slot:label>
              <q-avatar size="32px" color="primary">
                <img
                  v-if="authStore.user?.avatar"
                  :src="authStore.user.avatar"
                  :alt="authStore.user.login"
                />
                <q-icon v-else name="person" size="20px" color="white" />
              </q-avatar>
            </template>

            <q-list>
              <q-item clickable v-close-popup @click="goToProfile">
                <q-item-section avatar>
                  <q-icon name="person" color="primary" />
                </q-item-section>
                <q-item-section>Profil</q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="authStore.logout">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>Déconnexion</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn
            v-else
            label="Connexion"
            color="primary"
            icon="login"
            unelevated
            @click="goToLogin"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth-store';

const router = useRouter();
const authStore = useAuthStore();

const goToProfile = () => {
  void router.push('/profile');
};

const goToLogin = () => {
  authStore.initiateOAuthLogin();
};
</script>
