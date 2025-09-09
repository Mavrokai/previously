<template>
  <q-page class="bg-grey-1">
    <div v-if="!authStore.isAuthenticated" class="text-center q-pa-xl">
      <q-card class="login-card" elevated>
        <q-card-section class="text-center q-pa-xl">
          <q-icon name="person" size="4rem" color="primary" class="q-mb-lg" />
          <div class="text-h5 text-weight-bold q-mb-md">Connexion requise</div>
          <div class="text-body1 text-grey-7 q-mb-lg">
            Vous devez être connecté pour accéder à votre profil
          </div>
          <q-btn color="primary" size="lg" @click="authStore.initiateOAuthLogin" class="q-px-xl">
            Se connecter avec BetaSeries
          </q-btn>
        </q-card-section>
      </q-card>
    </div>

    <div v-else class="profile-container">
      <div v-if="userBanner" class="profile-banner">
        <div class="banner-backdrop" :style="{ backgroundImage: `url(${userBanner})` }"></div>
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <div class="profile-header-content">
            <div class="profile-avatar-section">
              <q-avatar size="120px" class="profile-avatar">
                <img
                  v-if="authStore.user?.avatar"
                  :src="authStore.user.avatar"
                  :alt="authStore.user.login"
                />
                <q-icon v-else name="person" size="60px" color="white" />
              </q-avatar>
            </div>
            <div class="profile-info">
              <h1 class="profile-username">{{ authStore.user?.login }}</h1>
              <div v-if="authStore.user?.stats" class="profile-stats">
                <div class="stat-item">
                  <q-icon name="movie" color="white" class="q-mr-sm" />
                  <span class="stat-label">Films :</span>
                  <span class="stat-value">{{ authStore.user.stats.movies }}</span>
                </div>
                <div class="stat-item">
                  <q-icon name="tv" color="white" class="q-mr-sm" />
                  <span class="stat-label">Séries :</span>
                  <span class="stat-value">{{ authStore.user.stats.shows }}</span>
                </div>
                <div class="stat-item">
                  <q-icon name="favorite" color="white" class="q-mr-sm" />
                  <span class="stat-label">Favoris :</span>
                  <span class="stat-value">{{ favoriteMovies.length + favoriteShows.length }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="profile-header">
        <div class="profile-header-content">
          <div class="profile-avatar-section">
            <q-avatar size="120px" class="profile-avatar">
              <img
                v-if="authStore.user?.avatar"
                :src="authStore.user.avatar"
                :alt="authStore.user.login"
              />
              <q-icon v-else name="person" size="60px" color="white" />
            </q-avatar>
          </div>
          <div class="profile-info">
            <h1 class="profile-username">{{ authStore.user?.login }}</h1>
            <div v-if="authStore.user?.stats" class="profile-stats">
              <div class="stat-item">
                <q-icon name="movie" color="primary" class="q-mr-sm" />
                <span class="stat-label">Films :</span>
                <span class="stat-value">{{ authStore.user.stats.movies }}</span>
              </div>
              <div class="stat-item">
                <q-icon name="tv" color="primary" class="q-mr-sm" />
                <span class="stat-label">Séries :</span>
                <span class="stat-value">{{ authStore.user.stats.shows }}</span>
              </div>
              <div class="stat-item">
                <q-icon name="favorite" color="primary" class="q-mr-sm" />
                <span class="stat-label">Favoris :</span>
                <span class="stat-value">{{ favoriteMovies.length + favoriteShows.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="filters-section">
        <div class="filters-container">
          <div class="filter-group">
            <q-select
              v-model="selectedTab"
              :options="tabOptions"
              label="Type de contenu"
              outlined
              dense
              class="filter-select"
            />
          </div>
          <div class="filter-group">
            <q-select
              v-model="sortBy"
              :options="sortOptions"
              label="Trier par"
              outlined
              dense
              class="filter-select"
            />
          </div>
          <div class="filter-group">
            <q-btn
              color="primary"
              icon="refresh"
              label="Actualiser"
              @click="refreshData"
              :loading="isLoading"
              class="refresh-btn"
            />
          </div>
        </div>
      </div>

      <div v-if="errorMessage" class="error-banner">
        <q-banner class="bg-negative text-white" rounded>
          <template v-slot:avatar>
            <q-icon name="error" color="white" />
          </template>
          {{ errorMessage }}
          <template v-slot:action>
            <q-btn flat label="Réessayer" @click="refreshData" />
          </template>
        </q-banner>
      </div>

      <div class="content-section">
        <div v-if="currentTab === 'movies'" class="content-tab">
          <div class="section-header">
            <h2 class="section-title">
              <q-icon name="movie" class="q-mr-sm" />
              Films vus ({{ watchedMovies.length }})
            </h2>
          </div>

          <div v-if="isLoading" class="loading-container">
            <q-spinner-dots size="3rem" color="primary" />
            <div class="text-h6 text-grey-7 q-mt-md">Chargement des films...</div>
          </div>

          <div v-else-if="watchedMovies.length === 0" class="empty-state">
            <q-icon name="movie_creation" size="4rem" color="grey-5" class="q-mb-md" />
            <div class="text-h6 text-grey-7">Aucun film vu pour le moment</div>
            <div class="text-body2 text-grey-6">
              Commencez à regarder des films pour les voir apparaître ici
            </div>
          </div>

          <div v-else class="movies-grid">
            <div
              v-for="movie in watchedMovies"
              :key="movie.id"
              class="movie-card"
              @click="goToMovie(movie.id)"
            >
              <div class="movie-poster">
                <img
                  v-if="movie.poster"
                  :src="movie.poster || ''"
                  :alt="movie.title"
                  class="movie-poster-img"
                  @error="onImageError"
                />
                <div v-else class="movie-poster-placeholder">
                  <q-icon name="movie" size="2rem" color="grey-5" />
                </div>
              </div>
              <div class="movie-info">
                <h3 class="movie-title">{{ movie.title }}</h3>
                <div v-if="movie.production_year" class="movie-year">
                  {{ movie.production_year }}
                </div>
                <div v-if="movie.notes?.mean" class="movie-rating">
                  <q-icon name="star" size="0.8rem" color="amber" class="q-mr-xs" />
                  {{ movie.notes.mean.toFixed(1) }}/10
                </div>
                <div v-if="movie.genres && movie.genres.length > 0" class="movie-genres">
                  <q-chip
                    v-for="genre in movie.genres.slice(0, 2)"
                    :key="genre"
                    size="sm"
                    color="primary"
                    text-color="white"
                    class="genre-chip"
                  >
                    {{ genre }}
                  </q-chip>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentTab === 'shows'" class="content-tab">
          <div class="section-header">
            <h2 class="section-title">
              <q-icon name="tv" class="q-mr-sm" />
              Séries suivies ({{ watchedShows.length }})
            </h2>
          </div>

          <div>
            <div v-if="isLoading" class="loading-container">
              <q-spinner-dots size="3rem" color="primary" />
              <div class="text-h6 text-grey-7 q-mt-md">Chargement des séries...</div>
            </div>

            <div v-else-if="watchedShows.length === 0" class="empty-state">
              <q-icon name="tv" size="4rem" color="grey-5" class="q-mb-md" />
              <div class="text-h6 text-grey-7">Aucune série suivie pour le moment</div>
              <div class="text-body2 text-grey-6">
                Commencez à suivre des séries pour les voir apparaître ici
              </div>
            </div>

            <div v-else class="shows-column">
              <div
                v-for="show in watchedShows"
                :key="show.id"
                class="show-card-column"
                :class="{ 'has-banner': show.images?.banner }"
                :style="getShowBannerStyle(show)"
                @click="toggleShowDropdown(show.id)"
              >
                <div class="show-card-content">
                  <div class="show-poster">
                    <img
                      v-if="show.poster || show.images?.poster"
                      :src="show.poster || show.images?.poster || ''"
                      :alt="show.title"
                      class="show-poster-img"
                      @error="onImageError"
                    />
                    <div v-else class="show-poster-placeholder">
                      <q-icon name="tv" size="2rem" color="grey-5" />
                    </div>
                  </div>
                  <div class="show-info">
                    <h3 class="show-title">{{ show.title }}</h3>
                    <div v-if="show.creation" class="show-year">
                      {{ show.creation }}
                    </div>
                    <div v-if="show.notes?.mean" class="show-rating">
                      <q-icon name="star" size="0.8rem" color="amber" class="q-mr-xs" />
                      {{ show.notes.mean.toFixed(1) }}/10
                    </div>
                    <div v-if="show.status" class="show-status">
                      <q-chip
                        :color="getStatusColor(show.status)"
                        text-color="white"
                        size="sm"
                        class="status-chip"
                      >
                        {{ translateStatus(show.status) }}
                      </q-chip>
                    </div>
                    <div v-if="show.genres" class="show-genres">
                      <q-chip
                        v-for="genre in getGenresArray(show.genres).slice(0, 2)"
                        :key="genre"
                        size="sm"
                        color="secondary"
                        text-color="white"
                        class="genre-chip"
                      >
                        {{ genre }}
                      </q-chip>
                    </div>
                    <div class="progress-section">
                      <div class="progress-info">
                        <span class="progress-text">
                          {{ getWatchedEpisodesCount(show.id) }} / {{ show.episodes || 0 }} épisodes
                          <span v-if="getLastWatchedEpisode(show.id)" class="last-episode">
                            ({{ getLastWatchedEpisode(show.id) }})
                          </span>
                        </span>
                        <span class="progress-percentage">
                          {{ getProgressPercentage(show.id) }}%
                        </span>
                      </div>
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          :style="{ width: getProgressPercentage(show.id) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div class="dropdown-icon">
                    <q-icon
                      :name="expandedShows.includes(show.id) ? 'expand_less' : 'expand_more'"
                      size="1.5rem"
                    />
                  </div>
                </div>

                <q-slide-transition>
                  <div v-show="expandedShows.includes(show.id)" class="show-dropdown-content">
                    <div class="episodes-header">
                      <h4 class="episodes-title">
                        <q-icon name="play_circle" class="q-mr-sm" />
                        Épisodes vus ({{ showEpisodes[show.id]?.length || 0 }})
                      </h4>
                    </div>

                    <div
                      v-if="!showEpisodes[show.id] || showEpisodes[show.id]?.length === 0"
                      class="no-episodes"
                    >
                      <q-icon name="info" color="grey-5" class="q-mr-sm" />
                      <span>Aucun épisode vu pour cette série</span>
                    </div>

                    <div v-else class="episodes-list">
                      <div
                        v-for="episode in showEpisodes[show.id]"
                        :key="episode.id"
                        class="episode-item"
                      >
                        <div class="episode-info">
                          <div class="episode-title">{{ episode.title }}</div>
                          <div class="episode-details">
                            <span v-if="episode.season && episode.episode" class="episode-number">
                              S{{ episode.season }}E{{ episode.episode }}
                            </span>
                            <span v-if="episode.date" class="episode-date">
                              {{ formatDate(episode.date.toString()) }}
                            </span>
                          </div>
                        </div>
                        <div class="episode-actions">
                          <div v-if="episode.rating" class="episode-rating">
                            <q-icon name="star" size="0.8rem" color="amber" class="q-mr-xs" />
                            {{ episode.rating.toFixed(1) }}
                          </div>
                          <q-btn
                            :loading="loadingEpisodeActions[episode.id]"
                            :color="'negative'"
                            :text-color="'white'"
                            :icon="'visibility_off'"
                            :label="'Non vu'"
                            @click.stop="markEpisodeAsUnwatched(episode.id, show.id)"
                            class="unwatch-btn"
                            size="sm"
                            dense
                            no-caps
                            unelevated
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Section pour les épisodes non vus -->
                    <div v-if="hasWatchedEpisodes(show.id)" class="unwatched-episodes-section">
                      <div class="episodes-header">
                        <h4 class="episodes-title">
                          <q-icon name="play_circle_outline" class="q-mr-sm" />
                          Épisodes non vus ({{ getUnwatchedEpisodesCount(show.id) }})
                        </h4>
                      </div>

                      <div v-if="getUnwatchedEpisodes(show.id).length === 0" class="no-episodes">
                        <q-icon name="check_circle" color="green" class="q-mr-sm" />
                        <span>Tous les épisodes sont vus !</span>
                      </div>

                      <div v-else class="episodes-list">
                        <div
                          v-for="episode in getUnwatchedEpisodes(show.id)"
                          :key="episode.id"
                          class="episode-item unwatched"
                        >
                          <div class="episode-info">
                            <div class="episode-title">{{ episode.title }}</div>
                            <div class="episode-details">
                              <span v-if="episode.season && episode.episode" class="episode-number">
                                S{{ episode.season }}E{{ episode.episode }}
                              </span>
                              <span v-if="episode.date" class="episode-date">
                                {{ formatDate(episode.date.toString()) }}
                              </span>
                            </div>
                          </div>
                          <div class="episode-actions">
                            <q-btn
                              :loading="loadingEpisodeActions[episode.id]"
                              :color="'positive'"
                              :text-color="'white'"
                              :icon="'visibility'"
                              :label="'Marquer vu'"
                              @click.stop="markEpisodeAsWatched(episode.id, show.id)"
                              class="watch-btn"
                              size="sm"
                              dense
                              no-caps
                              unelevated
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-slide-transition>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentTab === 'favorites'" class="content-tab">
          <div class="section-header">
            <h2 class="section-title">
              <q-icon name="favorite" class="q-mr-sm" />
              Favoris ({{ favoriteMovies.length + favoriteShows.length }})
            </h2>
          </div>

          <div v-if="isLoading" class="loading-container">
            <q-spinner-dots size="3rem" color="primary" />
            <div class="text-h6 text-grey-7 q-mt-md">Chargement des favoris...</div>
          </div>

          <div
            v-else-if="favoriteMovies.length === 0 && favoriteShows.length === 0"
            class="empty-state"
          >
            <q-icon name="favorite_border" size="4rem" color="grey-5" class="q-mb-md" />
            <div class="text-h6 text-grey-7">Aucun favori pour le moment</div>
            <div class="text-body2 text-grey-6">Ajoutez des films et séries à vos favoris</div>
          </div>

          <div v-else class="favorites-content">
            <div v-if="favoriteMovies.length > 0" class="favorites-section">
              <h3 class="subsection-title">Films favoris</h3>
              <div class="movies-grid">
                <div
                  v-for="movie in favoriteMovies"
                  :key="movie.id"
                  class="movie-card"
                  @click="goToMovie(movie.id)"
                >
                  <div class="movie-poster">
                    <img
                      v-if="movie.poster"
                      :src="movie.poster || ''"
                      :alt="movie.title"
                      class="movie-poster-img"
                      @error="onImageError"
                    />
                    <div v-else class="movie-poster-placeholder">
                      <q-icon name="movie" size="2rem" color="grey-5" />
                    </div>
                  </div>
                  <div class="movie-info">
                    <h4 class="movie-title">{{ movie.title }}</h4>
                    <div v-if="movie.production_year" class="movie-year">
                      {{ movie.production_year }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="favoriteShows.length > 0" class="favorites-section">
              <h3 class="subsection-title">Séries favorites</h3>
              <div class="shows-grid">
                <div v-for="show in favoriteShows" :key="show.id" class="show-card">
                  <div class="show-poster">
                    <img
                      v-if="show.poster || show.images?.poster"
                      :src="show.poster || show.images?.poster || ''"
                      :alt="show.title"
                      class="show-poster-img"
                      @error="onImageError"
                    />
                    <div v-else class="show-poster-placeholder">
                      <q-icon name="tv" size="2rem" color="grey-5" />
                    </div>
                  </div>
                  <div class="show-info">
                    <h4 class="show-title">{{ show.title }}</h4>
                    <div v-if="show.creation" class="show-year">
                      {{ show.creation }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth-store';
import {
  moviesApi,
  memberApi,
  showsApi,
  type BetaSeriesMovie,
  type BetaSeriesShow,
  type BetaSeriesEpisode,
} from '../services/betaseries-api';

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const selectedTab = ref<string | { label: string; value: string }>({
  label: 'Films vus',
  value: 'movies',
});
const sortBy = ref<string | { label: string; value: string }>({
  label: 'Alphabétique',
  value: 'alphabetical',
});

const watchedMovies = ref<BetaSeriesMovie[]>([]);
const watchedShows = ref<BetaSeriesShow[]>([]);
const favoriteMovies = ref<BetaSeriesMovie[]>([]);
const favoriteShows = ref<BetaSeriesShow[]>([]);
const errorMessage = ref<string | null>(null);
const userBanner = ref<string | null>(null);
const expandedShows = ref<string[]>([]);
const showEpisodes = ref<Record<string, BetaSeriesEpisode[]>>({});
const allShowEpisodes = ref<Record<string, BetaSeriesEpisode[]>>({});
const loadingEpisodeActions = ref<Record<string, boolean>>({});

const tabOptions = [
  { label: 'Films vus', value: 'movies' },
  { label: 'Séries suivies', value: 'shows' },
  { label: 'Favoris', value: 'favorites' },
];

const currentTab = computed(() => {
  if (typeof selectedTab.value === 'string') {
    return selectedTab.value;
  }
  return selectedTab.value?.value || 'movies';
});

const currentSort = computed(() => {
  if (typeof sortBy.value === 'string') {
    return sortBy.value;
  }
  return sortBy.value?.value || 'alphabetical';
});

const sortOptions = [
  { label: 'Alphabétique', value: 'alphabetical' },
  { label: 'Popularité', value: 'popularity' },
  { label: "Date d'ajout", value: 'added' },
  { label: 'Date de sortie', value: 'release' },
];

const loadUserInfo = async () => {
  if (!authStore.token) {
    console.error("Token d'authentification manquant");
    return;
  }

  try {
    if (!authStore.user) {
      await authStore.fetchUserInfo();
    }

    if (authStore.user?.profile_banner) {
      userBanner.value = authStore.user.profile_banner;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des informations du membre:', error);
  }
};

const loadWatchedMovies = async () => {
  if (!authStore.token) {
    console.error("Token d'authentification manquant");
    return;
  }

  try {
    const response = await moviesApi.getMemberMovies(authStore.token, {
      state: '1',
      limit: 100,
      order: currentSort.value as 'alphabetical' | 'popularity' | 'added' | 'release' | 'svod',
    });
    watchedMovies.value = response.movies;
  } catch (error) {
    console.error('Erreur lors du chargement des films vus:', error);
  }
};

const loadWatchedShows = async () => {
  if (!authStore.token) {
    console.error("Token d'authentification manquant");
    return;
  }

  try {
    const response = await memberApi.getMemberShows(authStore.token, {
      order: currentSort.value as
        | 'alphabetical'
        | 'progression'
        | 'remaining_time'
        | 'remaining_episodes',
      limit: 100,
    });
    watchedShows.value = response.shows;

    await loadAllShowsEpisodes();
  } catch (error) {
    console.error('Erreur lors du chargement des séries suivies:', error);
  }
};

const loadFavorites = async () => {
  if (!authStore.token) {
    console.error("Token d'authentification manquant");
    return;
  }

  try {
    const [moviesResponse, showsResponse] = await Promise.all([
      moviesApi.getFavoriteMovies(authStore.token, {
        limit: 50,
        order: currentSort.value as 'alphabetical' | 'popularity' | 'added' | 'release' | 'svod',
      }),
      memberApi.getFavoriteShows(authStore.token, {
        limit: 50,
        order: currentSort.value as
          | 'alphabetical'
          | 'progression'
          | 'remaining_time'
          | 'remaining_episodes',
      }),
    ]);
    favoriteMovies.value = moviesResponse.movies;
    favoriteShows.value = showsResponse.shows;
  } catch (error) {
    console.error('Erreur lors du chargement des favoris:', error);
  }
};

const refreshData = async () => {
  if (!authStore.isAuthenticated || !authStore.token) {
    console.error('Utilisateur non authentifié');
    errorMessage.value = 'Vous devez être connecté pour accéder à vos données';
    return;
  }

  isLoading.value = true;
  errorMessage.value = null;

  try {
    await loadUserInfo();
    await loadFavorites();

    if (currentTab.value === 'movies') {
      await loadWatchedMovies();
    } else if (currentTab.value === 'shows') {
      await loadWatchedShows();
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    errorMessage.value = 'Erreur lors du chargement des données. Veuillez réessayer.';
  } finally {
    isLoading.value = false;
  }
};

const goToMovie = (movieId: string) => {
  void router.push(`/movie/${movieId}`);
};

const getShowBannerStyle = (show: BetaSeriesShow) => {
  const bannerUrl = show.images?.banner;
  if (!bannerUrl) return {};

  return {
    backgroundImage: `url(${bannerUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
};

const toggleShowDropdown = (showId: string) => {
  const index = expandedShows.value.indexOf(showId);
  if (index > -1) {
    expandedShows.value.splice(index, 1);
  } else {
    expandedShows.value.push(showId);
  }
};

const loadAllShowsEpisodes = async () => {
  if (!authStore.token) return;

  const promises = watchedShows.value.map((show) => loadShowEpisodes(show.id));
  await Promise.allSettled(promises);
};

const loadShowEpisodes = async (showId: string) => {
  if (!authStore.token) return;

  try {
    const watchedResponse = await memberApi.getWatchedEpisodes(authStore.token, showId);
    showEpisodes.value[showId] = watchedResponse.episodes || [];

    await loadAllSeasonsEpisodes(showId);
  } catch (error) {
    console.error('Erreur lors du chargement des épisodes:', error);
    showEpisodes.value[showId] = [];
    allShowEpisodes.value[showId] = [];
  }
};

const loadAllSeasonsEpisodes = async (showId: string) => {
  if (!authStore.token) return;

  try {
    const showDetails = await showsApi.getShowDetails(showId);
    const totalSeasons = showDetails.show.seasons || 1;

    const allEpisodesPromises = [];
    for (let season = 1; season <= totalSeasons; season++) {
      allEpisodesPromises.push(
        showsApi.getSeasonEpisodes(showId, season).catch((error) => {
          console.warn(`Erreur lors du chargement de la saison ${season}:`, error);
          return { episodes: [] };
        }),
      );
    }

    const allSeasonsResponses = await Promise.allSettled(allEpisodesPromises);
    const allEpisodes: BetaSeriesEpisode[] = [];

    allSeasonsResponses.forEach((response) => {
      if (response.status === 'fulfilled' && response.value.episodes) {
        allEpisodes.push(...response.value.episodes);
      }
    });

    allShowEpisodes.value[showId] = allEpisodes;
  } catch (error) {
    console.error('Erreur lors du chargement de toutes les saisons:', error);
    allShowEpisodes.value[showId] = [];
  }
};

const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Date inconnue';

  return dateObj.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getWatchedEpisodesCount = (showId: string): number => {
  return showEpisodes.value[showId]?.length || 0;
};

const getProgressPercentage = (showId: string): number => {
  const watchedCount = getWatchedEpisodesCount(showId);
  const totalEpisodes = watchedShows.value.find((show) => show.id === showId)?.episodes || 0;

  if (totalEpisodes === 0) return 0;

  return Math.round((watchedCount / totalEpisodes) * 100);
};

const getLastWatchedEpisode = (showId: string): string => {
  const episodes = showEpisodes.value[showId];
  if (!episodes || episodes.length === 0) return '';

  const sortedEpisodes = episodes
    .filter((ep) => ep.season && ep.episode)
    .sort((a, b) => {
      if (a.season !== b.season) {
        return a.season - b.season;
      }
      return a.episode - b.episode;
    });

  if (sortedEpisodes.length === 0) return '';

  const lastEpisode = sortedEpisodes[sortedEpisodes.length - 1];
  if (!lastEpisode) return '';

  return `S${lastEpisode.season}E${lastEpisode.episode}`;
};

const getGenresArray = (genres?: string[] | Record<string, string>): string[] => {
  if (!genres) return [];
  if (Array.isArray(genres)) return genres;
  return Object.values(genres);
};

const translateStatus = (status: string): string => {
  const statusTranslations: Record<string, string> = {
    Continuing: 'En cours',
    Ended: 'Terminée',
    Canceled: 'Annulée',
    'Returning Series': 'Série qui revient',
    Planned: 'Prévue',
    'In Development': 'En développement',
    Pilot: 'Pilote',
    'On Hiatus': 'En pause',
  };
  return statusTranslations[status] || status;
};

const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    Continuing: 'green',
    Ended: 'grey',
    Canceled: 'red',
    'Returning Series': 'blue',
    Planned: 'orange',
    'In Development': 'purple',
    Pilot: 'teal',
    'On Hiatus': 'amber',
  };
  return statusColors[status] || 'grey';
};

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img) {
    img.style.display = 'none';
  }
};

const getUnwatchedEpisodes = (showId: string): BetaSeriesEpisode[] => {
  const allEpisodes = allShowEpisodes.value[showId] || [];
  const watchedEpisodes = showEpisodes.value[showId] || [];
  const watchedIds = new Set(watchedEpisodes.map((ep) => ep.id));

  return allEpisodes.filter((episode) => !watchedIds.has(episode.id));
};

const getUnwatchedEpisodesCount = (showId: string): number => {
  return getUnwatchedEpisodes(showId).length;
};

const hasWatchedEpisodes = (showId: string): boolean => {
  return (showEpisodes.value[showId]?.length ?? 0) > 0;
};

const markEpisodeAsWatched = async (episodeId: string, showId: string) => {
  if (!authStore.token) {
    console.error("Token d'authentification manquant");
    return;
  }

  loadingEpisodeActions.value[episodeId] = true;

  try {
    await memberApi.markEpisodeAsWatched(authStore.token, episodeId);

    const allEpisodes = allShowEpisodes.value[showId] || [];
    const episodeToAdd = allEpisodes.find((ep) => ep.id === episodeId);
    const currentWatched = showEpisodes.value[showId];
    if (episodeToAdd && currentWatched) {
      showEpisodes.value[showId] = [...currentWatched, episodeToAdd];
    }

    if (authStore.user?.stats) {
      authStore.user.stats.shows = (authStore.user.stats.shows || 0) + 1;
    }
  } catch (error) {
    console.error("Erreur lors du marquage de l'épisode comme vu:", error);
  } finally {
    loadingEpisodeActions.value[episodeId] = false;
  }
};

const markEpisodeAsUnwatched = async (episodeId: string, showId: string) => {
  if (!authStore.token) {
    console.error("Token d'authentification manquant");
    return;
  }

  loadingEpisodeActions.value[episodeId] = true;

  try {
    await memberApi.markEpisodeAsUnwatched(authStore.token, episodeId);

    const episodes = showEpisodes.value[showId];
    if (episodes) {
      showEpisodes.value[showId] = episodes.filter((episode) => episode.id !== episodeId);
    }

    if (authStore.user?.stats) {
      authStore.user.stats.shows = Math.max((authStore.user.stats.shows || 0) - 1, 0);
    }
  } catch (error) {
    console.error("Erreur lors du marquage de l'épisode comme non vu:", error);
  } finally {
    loadingEpisodeActions.value[episodeId] = false;
  }
};

watch(currentTab, async () => {
  if (authStore.isAuthenticated) {
    await refreshData();
  }
});

watch(currentSort, async () => {
  if (authStore.isAuthenticated) {
    await refreshData();
  }
});

onMounted(async () => {
  if (authStore.isAuthenticated) {
    if (!authStore.user) {
      await authStore.fetchUserInfo();
    }
    await refreshData();
  }
});
</script>

<style lang="scss" scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-banner {
  position: relative;
  height: 300px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 20px;
}

.banner-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.banner-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 40px;
}

.profile-header {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  color: white;
}

.profile-header-content {
  display: flex;
  align-items: center;
  gap: 30px;
}

.profile-avatar-section {
  flex-shrink: 0;
}

.profile-avatar {
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.profile-info {
  flex: 1;
}

.profile-username {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 55px 0 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  color: white;
}

.profile-stats {
  display: flex;
  gap: 30px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  padding: 12px 20px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.stat-label {
  font-weight: 600;
  margin-right: 8px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.stat-value {
  font-weight: bold;
  font-size: 1.1rem;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filters-container {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.error-banner {
  margin-bottom: 20px;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-select {
  width: 100%;
}

.refresh-btn {
  height: 40px;
}

.content-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e0e0e0;
}

.section-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1976d2;
  margin: 0;
  display: flex;
  align-items: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.movies-grid,
.shows-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.shows-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.movie-card,
.show-card {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.movie-card:hover,
.show-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.show-card-column {
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.show-card-column:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.show-card-column.has-banner {
  background: transparent;
  color: white;
  min-height: 120px;
}

.show-card-column.has-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
  z-index: 1;
}

.show-card-content {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
  position: relative;
  z-index: 2;
}

.show-card-column.has-banner .show-poster,
.show-card-column.has-banner .show-info {
  position: relative;
  z-index: 2;
}

.show-card-content .show-poster {
  width: 80px;
  height: 120px;
  flex-shrink: 0;
}

.show-card-content .show-info {
  flex: 1;
  min-width: 0;
}

.show-card-content .show-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  line-height: 1.3;
}

.show-card-column.has-banner .show-title {
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.show-card-content .show-year {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 6px;
}

.show-card-column.has-banner .show-year {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.show-card-content .show-rating {
  font-size: 0.85rem;
  color: #ff9800;
  margin-bottom: 6px;
}

.show-card-column.has-banner .show-rating {
  color: #ffc107;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.show-card-content .show-status {
  margin-bottom: 8px;
}

.show-card-content .show-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.progress-section {
  margin-top: 12px;
  width: 100%;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 0.85rem;
}

.progress-text {
  color: #666;
  font-weight: 500;
}

.show-card-column.has-banner .progress-text {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.last-episode {
  color: #1976d2;
  font-weight: 600;
  font-size: 0.8rem;
}

.show-card-column.has-banner .last-episode {
  color: #64b5f6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.progress-percentage {
  color: #1976d2;
  font-weight: 600;
}

.show-card-column.has-banner .progress-percentage {
  color: #64b5f6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.show-card-column.has-banner .progress-bar {
  background: rgba(255, 255, 255, 0.2);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1976d2 0%, #42a5f5 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
  position: relative;
}

.show-card-column.has-banner .progress-fill {
  background: linear-gradient(90deg, #64b5f6 0%, #90caf9 100%);
}

.dropdown-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s ease;
}

.show-card-column:hover .dropdown-icon {
  color: #1976d2;
  transform: scale(1.1);
}

.show-card-column.has-banner .dropdown-icon {
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.show-card-column.has-banner:hover .dropdown-icon {
  color: white;
}

.show-dropdown-content {
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.show-card-column.has-banner .show-dropdown-content {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.episodes-header {
  padding: 16px 16px 8px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.show-card-column.has-banner .episodes-header {
  border-bottom-color: rgba(255, 255, 255, 0.2);
}

.episodes-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976d2;
  margin: 0;
  display: flex;
  align-items: center;
}

.show-card-column.has-banner .episodes-title {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.episodes-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
}

.no-episodes {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  color: #666;
  font-style: italic;
}

.show-card-column.has-banner .no-episodes {
  color: rgba(255, 255, 255, 0.7);
}

.episodes-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
}

.episode-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
}

.episode-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.show-card-column.has-banner .episode-item {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.show-card-column.has-banner .episode-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.episode-item:last-child {
  border-bottom: none;
}

.episode-info {
  flex: 1;
  min-width: 0;
}

.episode-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.3;
}

.show-card-column.has-banner .episode-title {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.episode-details {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: #666;
}

.show-card-column.has-banner .episode-details {
  color: rgba(255, 255, 255, 0.8);
}

.episode-number {
  font-weight: 500;
  color: #1976d2;
}

.show-card-column.has-banner .episode-number {
  color: #64b5f6;
}

.episode-date {
  font-style: italic;
}

.episode-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.episode-rating {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #ff9800;
  font-weight: 500;
}

.show-card-column.has-banner .episode-rating {
  color: #ffc107;
}

.unwatch-btn {
  font-weight: 500;
  border-radius: 6px;
  padding: 6px 12px;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.unwatch-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.3);
}

.unwatched-episodes-section {
  margin-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 16px;
}

.show-card-column.has-banner .unwatched-episodes-section {
  border-top-color: rgba(255, 255, 255, 0.2);
}

.episode-item.unwatched {
  opacity: 0.8;
  background-color: rgba(0, 0, 0, 0.02);
}

.show-card-column.has-banner .episode-item.unwatched {
  background-color: rgba(255, 255, 255, 0.05);
}

.watch-btn {
  font-weight: 500;
  border-radius: 6px;
  padding: 6px 12px;
  transition: all 0.2s ease;
  font-size: 0.75rem;
}

.watch-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
}

.movie-poster,
.show-poster {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.movie-poster-img,
.show-poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.movie-card:hover .movie-poster-img,
.show-card:hover .show-poster-img {
  transform: scale(1.05);
}

.movie-poster-placeholder,
.show-poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

.movie-info,
.show-info {
  padding: 15px;
}

.movie-title,
.show-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movie-year,
.show-year {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 8px;
}

.movie-rating,
.show-rating {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: #ff9800;
  margin-bottom: 8px;
}

.movie-genres,
.show-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.genre-chip {
  font-size: 0.7rem;
}

.status-chip {
  font-size: 0.7rem;
  margin-top: 8px;
}

.favorites-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.favorites-section {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  background: #fafafa;
}

.subsection-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1976d2;
  margin: 0 0 20px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.login-card {
  border-radius: 16px;
  background: white;
  max-width: 500px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .profile-header-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .profile-username {
    font-size: 2rem;
  }

  .profile-stats {
    justify-content: center;
    gap: 15px;
  }

  .filters-container {
    flex-direction: column;
    gap: 15px;
  }

  .filter-group {
    min-width: 100%;
  }

  .movies-grid,
  .shows-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }

  .shows-column {
    width: 100%;
    padding: 0 10px;
  }

  .show-card-column {
    padding: 12px;
    gap: 12px;
  }

  .show-card-column .show-poster {
    width: 60px;
    height: 90px;
  }

  .show-card-column .show-title {
    font-size: 1rem;
  }

  .movie-poster,
  .show-poster {
    height: 220px;
  }
}
</style>
