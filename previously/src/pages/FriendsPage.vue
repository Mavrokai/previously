<template>
  <q-page class="bg-grey-1">
    <div v-if="!authStore.isAuthenticated" class="text-center q-pa-xl">
      <q-card class="login-card" elevated>
        <q-card-section class="text-center q-pa-xl">
          <q-icon name="people" size="4rem" color="primary" class="q-mb-lg" />
          <div class="text-h5 text-weight-bold q-mb-md">Connexion requise</div>
          <div class="text-body1 text-grey-7 q-mb-lg">
            Vous devez être connecté pour accéder à la gestion des amis
          </div>
          <q-btn color="primary" size="lg" @click="authStore.initiateOAuthLogin" class="q-px-xl">
            Se connecter avec BetaSeries
          </q-btn>
        </q-card-section>
      </q-card>
    </div>

    <div v-else class="q-pa-xl">
      <div class="text-center q-mb-xl">
        <q-icon name="people" size="4rem" color="primary" class="q-mb-md" />
        <div class="text-h3 text-weight-bold text-primary q-mb-sm">Amis</div>
        <div class="text-subtitle1 text-grey-7">Gérez vos amis BetaSeries</div>
      </div>

      <div class="row justify-center q-mb-xl">
        <div class="col-12 col-md-8 col-lg-6">
          <q-input
            v-model="searchQuery"
            placeholder="Rechercher des membres BetaSeries..."
            outlined
            rounded
            clearable
            @update:model-value="onSearch"
            @clear="onClearSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
          </q-input>
        </div>
      </div>

      <div v-if="!searchQuery && defaultUsers.length > 0" class="q-mt-xl">
        <div class="row q-gutter-md justify-center">
          <div
            v-for="member in defaultUsers"
            :key="member.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2"
          >
            <q-card class="member-card" elevated>
              <q-card-section class="text-center">
                <q-avatar size="80px" class="q-mb-md" color="primary" text-color="white">
                  <img
                    v-if="member.avatar"
                    :src="member.avatar"
                    :alt="member.login || 'Utilisateur'"
                  />
                  <span v-else-if="member.login" class="text-h4">{{
                    member.login.charAt(0).toUpperCase()
                  }}</span>
                  <span v-else class="text-h4">U</span>
                </q-avatar>
                <div class="text-h6 text-weight-bold q-mb-sm">
                  {{ member.login || `Utilisateur ${member.id}` }}
                </div>
                <div class="text-caption text-grey-6">
                  <div class="q-mb-xs">
                    <q-icon name="star" size="0.8rem" color="primary" class="q-mr-xs" />
                    {{ member.xp || 0 }} XP
                  </div>
                  <div v-if="member.stats" class="q-mb-xs">
                    <q-icon name="tv" size="0.8rem" color="primary" class="q-mr-xs" />
                    {{ member.stats.shows || 0 }} séries
                  </div>
                  <div v-if="member.stats" class="q-mb-xs">
                    <q-icon name="movie" size="0.8rem" color="primary" class="q-mr-xs" />
                    {{ member.stats.movies || 0 }} films
                  </div>
                  <div v-if="member.stats">
                    <q-icon name="play_circle" size="0.8rem" color="primary" class="q-mr-xs" />
                    {{ member.stats.episodes || 0 }} épisodes
                  </div>
                </div>
              </q-card-section>
              <q-card-actions class="justify-center">
                <q-btn
                  v-if="!member.in_account && !pendingFriends.has(member.id)"
                  color="primary"
                  icon="person_add"
                  label="Ajouter"
                  @click="addFriend(member.id)"
                  :loading="friendsStore.isLoading"
                  size="sm"
                />
                <q-btn
                  v-else-if="!member.in_account && pendingFriends.has(member.id)"
                  color="orange"
                  icon="hourglass_empty"
                  label="En cours..."
                  disabled
                  size="sm"
                />
                <q-btn
                  v-else
                  color="negative"
                  icon="person_remove"
                  label="Supprimer"
                  @click="removeFriend(member.id)"
                  :loading="friendsStore.isLoading"
                  size="sm"
                  outline
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <div v-if="hasMoreDefault && !isLoadingDefault" class="text-center q-mt-xl">
          <q-btn
            label="Voir plus"
            color="primary"
            outline
            @click="loadMoreDefaultUsers"
            :loading="isLoadingDefault"
          />
        </div>

        <div v-if="isLoadingDefault" class="text-center q-mt-md">
          <q-spinner-dots size="2rem" color="primary" />
          <div class="text-body2 text-grey-7 q-mt-sm">Chargement...</div>
        </div>
      </div>

      <div
        v-if="
          showSearchResults && friendsStore.searchResults && friendsStore.searchResults.length > 0
        "
        class="q-mt-xl"
      >
        <div class="text-h5 text-weight-bold text-center q-mb-lg">Résultats de recherche</div>
        <div class="row q-gutter-md justify-center">
          <div
            v-for="member in friendsStore.searchResults"
            :key="member.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2"
          >
            <q-card class="member-card" elevated>
              <q-card-section class="text-center">
                <q-avatar size="80px" class="q-mb-md" color="primary" text-color="white">
                  <img
                    v-if="member.avatar"
                    :src="member.avatar"
                    :alt="member.login || 'Utilisateur'"
                  />
                  <span v-else-if="member.login" class="text-h4">{{
                    member.login.charAt(0).toUpperCase()
                  }}</span>
                  <span v-else class="text-h4">U</span>
                </q-avatar>
                <div class="text-h6 text-weight-bold q-mb-sm">
                  {{ member.login || `Utilisateur ${member.id}` }}
                </div>
                <div class="text-caption text-grey-6">
                  <div class="q-mb-xs">
                    <q-icon name="star" size="0.8rem" color="primary" class="q-mr-xs" />
                    {{ member.xp || 0 }} XP
                  </div>
                  <div v-if="member.stats" class="q-mb-xs">
                    <q-icon name="tv" size="0.8rem" color="primary" class="q-mr-xs" />
                    {{ member.stats.shows || 0 }} séries
                  </div>
                  <div v-if="member.stats" class="q-mb-xs">
                    <q-icon name="movie" size="0.8rem" color="primary" class="q-mr-xs" />
                    {{ member.stats.movies || 0 }} films
                  </div>
                  <div v-if="member.stats">
                    <q-icon name="play_circle" size="0.8rem" color="primary" class="q-mr-xs" />
                    {{ member.stats.episodes || 0 }} épisodes
                  </div>
                </div>
              </q-card-section>
              <q-card-actions class="justify-center">
                <q-btn
                  v-if="!member.in_account && !pendingFriends.has(member.id)"
                  color="primary"
                  icon="person_add"
                  label="Ajouter"
                  @click="addFriend(member.id)"
                  :loading="friendsStore.isLoading"
                  size="sm"
                />
                <q-btn
                  v-else-if="!member.in_account && pendingFriends.has(member.id)"
                  color="orange"
                  icon="hourglass_empty"
                  label="En cours..."
                  disabled
                  size="sm"
                />
                <q-btn
                  v-else
                  color="negative"
                  icon="person_remove"
                  label="Supprimer"
                  @click="removeFriend(member.id)"
                  :loading="friendsStore.isLoading"
                  size="sm"
                  outline
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>

      <div v-if="friendsStore.error" class="q-mt-md">
        <q-banner class="bg-negative text-white" rounded>
          <template v-slot:avatar>
            <q-icon name="error" color="white" />
          </template>
          {{ friendsStore.error }}
          <template v-slot:action>
            <q-btn flat label="Fermer" @click="friendsStore.clearError" />
          </template>
        </q-banner>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth-store';
import { useFriendsStore } from '../stores/friends-store';
import type { BetaSeriesMember } from '../services/betaseries-api';

const authStore = useAuthStore();
const friendsStore = useFriendsStore();

const searchQuery = ref('');
const showSearchResults = ref(false);
const defaultUsers = ref<BetaSeriesMember[]>([]);
const isLoadingDefault = ref(false);
const hasMoreDefault = ref(true);
const currentOffset = ref(0);
const pendingFriends = ref<Set<string>>(new Set());

let searchTimeout: NodeJS.Timeout | null = null;

const onSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    if (searchQuery.value.length < 2) {
      friendsStore.clearSearchResults();
      showSearchResults.value = false;
      if (defaultUsers.value.length === 0) {
        void loadDefaultUsers();
      }
      return;
    }

    void searchMembers();
  }, 300);
};

const onClearSearch = () => {
  searchQuery.value = '';
  friendsStore.clearSearchResults();
  showSearchResults.value = false;
  void loadDefaultUsers();
};

const loadDefaultUsers = async (offset = 0, append = false) => {
  try {
    isLoadingDefault.value = true;

    const response = await friendsStore.searchMembers('a%', offset, 9);

    if (append) {
      defaultUsers.value.push(...response);
    } else {
      defaultUsers.value = response;
    }

    hasMoreDefault.value = response.length === 9;
    currentOffset.value = offset;
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs par défaut:', error);
  } finally {
    isLoadingDefault.value = false;
  }
};

const loadMoreDefaultUsers = () => {
  void loadDefaultUsers(currentOffset.value + 9, true);
};

const searchMembers = async () => {
  if (searchQuery.value.length < 2) {
    friendsStore.clearSearchResults();
    showSearchResults.value = false;
    return;
  }

  try {
    const searchTerm = `%${searchQuery.value}%`;
    await friendsStore.searchMembers(searchTerm);
    showSearchResults.value = true;
  } catch (error) {
    console.error('Erreur lors de la recherche de membres:', error);
  }
};

const addFriend = async (memberId: string) => {
  pendingFriends.value.add(memberId);

  try {
    const success = await friendsStore.addFriend(memberId);
    if (success) {
      pendingFriends.value.delete(memberId);

      friendsStore.removeFromSearchResults(memberId);
      const defaultIndex = defaultUsers.value.findIndex((user) => user.id === memberId);
      if (defaultIndex !== -1) {
        defaultUsers.value.splice(defaultIndex, 1);
      }
    } else {
      pendingFriends.value.delete(memberId);
    }
  } catch (error) {
    pendingFriends.value.delete(memberId);
    console.error("Erreur lors de l'ajout d'ami:", error);
  }
};

const removeFriend = async (memberId: string) => {
  await friendsStore.removeFriend(memberId);
};

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await loadDefaultUsers();
  }
});
</script>

<style lang="scss" scoped>
.friend-card,
.member-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.friend-card:hover,
.member-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.login-card {
  max-width: 500px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
