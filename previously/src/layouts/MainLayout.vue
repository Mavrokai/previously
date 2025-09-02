<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-white text-primary">
      <q-toolbar>
        <q-toolbar-title class="text-primary text-weight-bold"> Previously </q-toolbar-title>

        <div class="q-ml-auto">
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
import { useAuthStore } from '../stores/auth-store';

const authStore = useAuthStore();

const goToProfile = () => {};

const goToLogin = () => {
  authStore.initiateOAuthLogin();
};
</script>
