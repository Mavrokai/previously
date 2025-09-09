<template>
  <q-page class="bg-grey-1">
    <div v-if="isLoading" class="text-center q-py-xl">
      <q-spinner-dots size="3rem" color="primary" />
      <div class="text-h6 text-grey-7 q-mt-md">Chargement de la série...</div>
    </div>

    <div v-else-if="show" class="page-wrapper">
      <div v-if="show.backdrop || show.images?.banner" class="show-banner">
        <div
          class="banner-backdrop"
          :style="{ backgroundImage: `url(${show.backdrop || show.images?.banner})` }"
        ></div>
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <div class="back-button-container">
            <q-btn
              flat
              icon="arrow_back"
              label="Revenir aux Séries"
              color="white"
              @click="$router.push('/series')"
              class="text-weight-medium back-button"
            />
          </div>

          <div class="banner-show-info">
            <div class="banner-poster-container">
              <img
                v-if="show.poster || show.images?.poster"
                :src="show.poster || show.images?.poster || ''"
                :alt="show.title"
                class="banner-poster"
                @error="onImageError"
              />
            </div>
            <div class="banner-text-content">
              <h1 class="banner-title">{{ show.title }}</h1>
              <div v-if="show.creation" class="banner-year">({{ show.creation }})</div>
              <div v-if="show.notes?.mean" class="banner-rating">
                <q-icon name="star" size="1.2rem" color="amber" />
                <span class="rating-text">{{ show.notes.mean.toFixed(1) }}/10</span>
                <span class="rating-count">({{ show.notes.total }} avis)</span>
              </div>

              <div v-if="show.genres" class="banner-genres">
                <div
                  v-for="genre in getGenresArray(show.genres)"
                  :key="genre"
                  :class="`genre-chip genre-${getGenreClass(genre)}`"
                >
                  {{ genre }}
                </div>
              </div>

              <div v-if="show.length || show.language" class="banner-details">
                <div v-if="show.length" class="banner-detail-item">
                  <q-icon
                    name="schedule"
                    size="1rem"
                    color="rgba(255, 255, 255, 0.9)"
                    class="q-mr-xs"
                  />
                  <span class="banner-detail-label">Durée Moyenne d'un épisode :</span>
                  <span class="banner-detail-value">{{ formatDuration(show.length) }}</span>
                </div>

                <div v-if="show.language" class="banner-detail-item">
                  <q-icon
                    name="language"
                    size="1rem"
                    color="rgba(255, 255, 255, 0.9)"
                    class="q-mr-xs"
                  />
                  <span class="banner-detail-label">Langue :</span>
                  <span class="banner-detail-value">{{ show.language }}</span>
                </div>
              </div>

              <div class="banner-actions">
                <q-btn
                  :loading="markingAllAsWatched"
                  :color="allEpisodesWatched ? 'green' : 'white'"
                  :text-color="allEpisodesWatched ? 'white' : 'primary'"
                  :icon="allEpisodesWatched ? 'check_circle' : 'done_all'"
                  :label="
                    allEpisodesWatched
                      ? 'Série complète vue'
                      : 'Marquer la série complète comme vue'
                  "
                  @click="markAllEpisodesAsWatched"
                  class="banner-mark-all-btn"
                  :class="{ 'all-watched': allEpisodesWatched }"
                  no-caps
                  unelevated
                />
                <q-btn
                  v-if="followFeatureEnabled"
                  :loading="togglingFollow"
                  :color="isFollowing ? 'red' : 'white'"
                  :text-color="isFollowing ? 'white' : 'primary'"
                  :icon="isFollowing ? 'favorite' : 'favorite_border'"
                  :label="isFollowing ? 'Ne plus suivre' : 'Suivre la série'"
                  @click="toggleFollowShow"
                  class="banner-follow-btn"
                  :class="{ following: isFollowing }"
                  no-caps
                  unelevated
                />

                <q-btn
                  v-if="isFollowing"
                  :loading="togglingFavorite"
                  :color="isFavorite ? 'amber' : 'white'"
                  :text-color="isFavorite ? 'white' : 'primary'"
                  :icon="isFavorite ? 'star' : 'star_border'"
                  :label="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  @click="toggleFavoriteShow"
                  class="banner-favorite-btn"
                  :class="{ favorited: isFavorite }"
                  no-caps
                  unelevated
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="back-button-container">
        <q-btn
          flat
          icon="arrow_back"
          label="Revenir aux Séries"
          color="primary"
          @click="$router.push('/series')"
          class="text-weight-medium back-button"
        />
      </div>

      <div v-if="!show.backdrop && !show.images?.banner" class="show-info-header">
        <div class="show-info-header-content">
          <div class="show-poster-section">
            <img
              v-if="show.poster || show.images?.poster"
              :src="show.poster || show.images?.poster || ''"
              :alt="show.title"
              class="show-poster-large"
              @error="onImageError"
            />
          </div>
          <div class="show-info-text">
            <h1 class="show-title">{{ show.title }}</h1>
            <div v-if="show.creation" class="show-year">({{ show.creation }})</div>
            <div v-if="show.notes?.mean" class="show-rating">
              <q-icon name="star" size="1.2rem" color="amber" />
              <span class="rating-text">{{ show.notes.mean.toFixed(1) }}/10</span>
              <span class="rating-count">({{ show.notes.total }} avis)</span>
            </div>

            <div v-if="show.genres" class="show-genres">
              <div
                v-for="genre in getGenresArray(show.genres)"
                :key="genre"
                :class="`genre-chip genre-${getGenreClass(genre)}`"
              >
                {{ genre }}
              </div>
            </div>

            <div v-if="show.length || show.language" class="show-details-row">
              <div v-if="show.length" class="detail-item">
                <q-icon name="schedule" color="primary" class="q-mr-sm" />
                <span class="text-weight-medium">Durée Moyenne d'un épisode :</span>
                <span class="q-ml-sm">{{ formatDuration(show.length) }}</span>
              </div>

              <div v-if="show.language" class="detail-item">
                <q-icon name="language" color="primary" class="q-mr-sm" />
                <span class="text-weight-medium">Langue :</span>
                <span class="q-ml-sm">{{ show.language }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="show-details-section">
        <div class="show-details q-mb-lg">
          <div class="details-row">
            <div v-if="show.seasons" class="detail-item">
              <q-icon name="layers" color="primary" class="q-mr-sm" />
              <span class="text-weight-medium">Nombre de saisons :</span>
              <span class="q-ml-sm">{{ show.seasons }}</span>
            </div>

            <div v-if="show.episodes" class="detail-item">
              <q-icon name="playlist_play" color="primary" class="q-mr-sm" />
              <span class="text-weight-medium">Nombre d'épisodes total :</span>
              <span class="q-ml-sm">{{ show.episodes }}</span>
            </div>

            <div v-if="show.status" class="detail-item">
              <q-icon name="info" color="primary" class="q-mr-sm" />
              <span class="text-weight-medium">Statut :</span>
              <span class="q-ml-sm">{{ translateStatus(show.status) }}</span>
            </div>

            <div v-if="show.network" class="detail-item">
              <q-icon name="tv" color="primary" class="q-mr-sm" />
              <span class="text-weight-medium">Chaîne :</span>
              <span class="q-ml-sm">{{ show.network }}</span>
            </div>

            <div v-if="show.country" class="detail-item">
              <q-icon name="public" color="primary" class="q-mr-sm" />
              <span class="text-weight-medium">Pays :</span>
              <span class="q-ml-sm">{{ show.country }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="show?.description" class="synopsis-container">
      <div class="text-h5 text-weight-bold text-primary q-mb-md">Description / Résumé</div>
      <div class="text-body1 text-grey-8 synopsis-text">
        {{ show.description }}
      </div>
    </div>

    <div class="show-detail-container">
      <div class="show-info-section">
        <div class="show-info">
          <div v-if="latestEpisode || (nextEpisode && hasValidNextEpisode)" class="q-mb-lg">
            <div class="text-h5 text-weight-bold text-primary q-mb-md">Épisodes Récents</div>
            <div class="recent-episodes-container">
              <div v-if="loadingLatestNext" class="recent-episodes-loading">
                <q-spinner-dots size="2rem" color="primary" />
                <div class="text-body2 text-grey-6 q-mt-sm">Chargement des épisodes récents...</div>
              </div>

              <div v-else class="recent-episodes-grid">
                <div v-if="latestEpisode" class="recent-episode-card latest">
                  <div class="recent-episode-poster">
                    <img
                      :src="getEpisodeImageUrl(latestEpisode, 240, 360)"
                      :alt="latestEpisode.title"
                      class="recent-episode-poster-img"
                      @error="onImageError"
                    />
                  </div>

                  <div class="recent-episode-info">
                    <div class="recent-episode-badge latest-badge">
                      <q-icon name="history" size="1rem" class="q-mr-xs" />
                      Dernier épisode
                    </div>
                    <div class="recent-episode-title">{{ latestEpisode.title }}</div>
                    <div class="recent-episode-details">
                      <span v-if="latestEpisode.season && latestEpisode.episode">
                        Saison {{ latestEpisode.season }} - Épisode {{ latestEpisode.episode }}
                      </span>
                      <span
                        v-if="latestEpisode.date && !isNaN(latestEpisode.date.getTime())"
                        class="recent-episode-date"
                      >
                        {{ formatDate(latestEpisode.date) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div v-if="nextEpisode && hasValidNextEpisode" class="recent-episode-card next">
                  <div class="recent-episode-poster">
                    <img
                      :src="getEpisodeImageUrl(nextEpisode, 240, 360)"
                      :alt="nextEpisode.title"
                      class="recent-episode-poster-img"
                      @error="onImageError"
                    />
                  </div>

                  <div class="recent-episode-info">
                    <div class="recent-episode-badge next-badge">
                      <q-icon name="schedule" size="1rem" class="q-mr-xs" />
                      Prochain épisode
                    </div>
                    <div class="recent-episode-title">{{ nextEpisode.title }}</div>
                    <div class="recent-episode-details">
                      <span v-if="nextEpisode.season && nextEpisode.episode">
                        Saison {{ nextEpisode.season }} - Épisode {{ nextEpisode.episode }}
                      </span>
                      <span
                        v-if="nextEpisode.date && !isNaN(nextEpisode.date.getTime())"
                        class="recent-episode-date"
                      >
                        {{ formatDate(nextEpisode.date) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="show?.seasons_details && show.seasons_details.length > 0" class="q-mb-lg">
            <div class="text-h5 text-weight-bold text-primary q-mb-md">Saisons et Épisodes</div>
            <div class="seasons-container">
              <div
                v-for="season in show.seasons_details"
                :key="season.number"
                class="season-card"
                :class="{ 'season-expanded': expandedSeason === season.number }"
              >
                <div class="season-header" @click="toggleSeason(season.number)">
                  <div class="season-poster-container">
                    <img
                      v-if="season.image"
                      :src="season.image"
                      :alt="`Saison ${season.number}`"
                      class="season-poster"
                      @error="onImageError"
                    />
                    <div v-else class="season-poster-placeholder">
                      <q-icon name="tv" size="2rem" color="grey-5" />
                    </div>
                  </div>

                  <div class="season-info">
                    <div class="season-title">
                      <q-icon name="layers" color="primary" class="q-mr-sm" />
                      <span class="text-h6 text-weight-bold">Saison {{ season.number }}</span>
                    </div>
                    <div class="season-episodes-count">
                      {{ season.episodes }} épisode{{ season.episodes > 1 ? 's' : '' }}
                    </div>
                  </div>

                  <div class="season-toggle">
                    <q-icon
                      :name="expandedSeason === season.number ? 'expand_less' : 'expand_more'"
                      size="2rem"
                      color="primary"
                    />
                  </div>
                </div>

                <q-slide-transition>
                  <div v-show="expandedSeason === season.number" class="season-episodes">
                    <div v-if="loadingEpisodes[season.number]" class="episodes-loading">
                      <q-spinner-dots size="2rem" color="primary" />
                      <div class="text-body2 text-grey-6 q-mt-sm">Chargement des épisodes...</div>
                    </div>

                    <div v-else class="episodes-grid">
                      <div
                        v-for="episode in getSeasonEpisodes(season.number)"
                        :key="episode.id"
                        class="episode-card"
                        :class="{ 'episode-error': episode.isError }"
                      >
                        <div class="episode-poster">
                          <img
                            v-if="!episode.isError"
                            :src="getEpisodeImageUrl(episode, 200, 280)"
                            :alt="episode.title"
                            class="episode-poster-img"
                            @error="onImageError"
                          />
                          <div v-else class="episode-poster-placeholder">
                            <q-icon name="error" size="1.5rem" color="negative" />
                          </div>
                          <div
                            v-if="!episode.isError && isEpisodeUpcoming(episode)"
                            class="episode-overlay upcoming"
                          >
                            <div class="upcoming-badge">
                              <q-icon name="schedule" size="0.8rem" class="q-mr-xs" />
                              À Venir
                            </div>
                          </div>
                        </div>

                        <div class="episode-info">
                          <div v-if="!episode.isError" class="episode-number">
                            Épisode {{ episode.episode }}
                          </div>
                          <div class="episode-title" :class="{ 'text-negative': episode.isError }">
                            {{ episode.title }}
                          </div>
                          <div
                            v-if="
                              episode.date && !episode.isError && !isNaN(episode.date.getTime())
                            "
                            class="episode-date"
                          >
                            {{ formatDate(episode.date) }}
                          </div>
                          <div v-if="episode.length && !episode.isError" class="episode-length">
                            <q-icon name="schedule" size="0.8rem" class="q-mr-xs" />
                            {{ formatDuration(episode.length) }}
                          </div>
                          <div v-if="episode.rating && !episode.isError" class="episode-rating">
                            <q-icon name="star" size="0.8rem" color="amber" class="q-mr-xs" />
                            {{ episode.rating.toFixed(1) }}
                          </div>
                          <div
                            v-if="!episode.isError && !isEpisodeUpcoming(episode)"
                            class="episode-actions"
                          >
                            <q-btn
                              v-if="!episode.user?.seen && !episode.seen"
                              flat
                              dense
                              color="primary"
                              icon="check_circle_outline"
                              label="Marquer comme vu"
                              size="sm"
                              @click="markEpisodeAsWatched(episode.id)"
                              :loading="loadingEpisodeActions[episode.id]"
                            />
                            <q-btn
                              v-else
                              flat
                              dense
                              color="positive"
                              icon="check_circle"
                              label="Vu"
                              size="sm"
                              @click="markEpisodeAsUnwatched(episode.id)"
                              :loading="loadingEpisodeActions[episode.id]"
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

          <div v-if="show?.svods && show.svods.length > 0" class="q-mb-lg">
            <div class="text-h6 text-weight-bold text-primary q-mb-sm">Disponible sur</div>
            <div class="streaming-platforms">
              <q-chip
                v-for="svod in show.svods"
                :key="svod.id"
                color="secondary"
                text-color="white"
                size="md"
                class="q-mr-sm q-mb-sm"
              >
                {{ svod.name }}
              </q-chip>
            </div>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="showLoginDialog" persistent>
      <q-card class="login-dialog-card">
        <q-card-section class="text-center q-pa-lg">
          <q-icon name="person" size="4rem" color="primary" class="q-mb-lg" />
          <div class="text-h5 text-weight-bold q-mb-md">Connexion requise</div>
          <div class="text-body1 text-grey-7 q-mb-lg">
            Vous devez être connecté pour effectuer cette action
          </div>
        </q-card-section>

        <q-card-actions align="center" class="q-pa-lg q-pt-none">
          <q-btn
            unelevated
            label="Refuser"
            color="negative"
            text-color="white"
            @click="showLoginDialog = false"
            class="q-mr-sm q-px-xl"
          />
          <q-btn color="primary" label="Se connecter" @click="goToLogin" class="q-px-xl" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import {
  showsApi,
  memberApi,
  type BetaSeriesShow,
  type BetaSeriesEpisode,
} from '../services/betaseries-api';
import { useAuthStore } from '../stores/auth-store';

const BETA_SERIES_CONFIG = {
  clientId: process.env.VITE_BETASERIES_CLIENT_ID || '',
};

interface ProcessedEpisode {
  id: string;
  episode: number;
  season?: number;
  title: string;
  date: Date | null;
  image: string | null;
  description?: string | undefined;
  length?: number | undefined;
  rating?: number | undefined;
  isError?: boolean;
  seen?: boolean;
  user?: {
    seen: boolean;
    note?: number;
  };
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const show = ref<BetaSeriesShow | null>(null);
const isLoading = ref(false);
const expandedSeason = ref<number | null>(null);
const seasonEpisodes = ref<Record<number, ProcessedEpisode[]>>({});
const loadingEpisodes = ref<Record<number, boolean>>({});
const loadingEpisodeActions = ref<Record<string, boolean>>({});
const markingAllAsWatched = ref(false);
const togglingFollow = ref(false);
const isFollowing = ref(false);
const followFeatureEnabled = ref(false);
const showLoginDialog = ref(false);
const isFavorite = ref(false);
const togglingFavorite = ref(false);
const latestEpisode = ref<ProcessedEpisode | null>(null);
const nextEpisode = ref<ProcessedEpisode | null>(null);
const loadingLatestNext = ref(false);

const hasValidNextEpisode = computed(() => {
  return (
    nextEpisode.value &&
    nextEpisode.value.season &&
    nextEpisode.value.episode &&
    nextEpisode.value.title &&
    nextEpisode.value.title !== 'Épisode undefined'
  );
});

const allEpisodesWatched = computed(() => {
  if (!show.value?.seasons_details) return false;

  let hasLoadedEpisodes = false;
  let allWatched = true;

  for (const season of show.value.seasons_details) {
    const episodes = seasonEpisodes.value[season.number] || [];

    if (episodes.length > 0) {
      hasLoadedEpisodes = true;
      const validEpisodes = episodes.filter((ep) => !ep.isError && !isEpisodeUpcoming(ep));
      const watchedEpisodes = validEpisodes.filter((ep) => ep.user?.seen || ep.seen);

      if (validEpisodes.length > 0 && watchedEpisodes.length !== validEpisodes.length) {
        allWatched = false;
        break;
      }
    }
  }

  return hasLoadedEpisodes && allWatched;
});

const loadShowDetails = async () => {
  const showId = route.params.id as string;
  if (!showId) {
    void router.push('/series');
    return;
  }

  try {
    isLoading.value = true;
    const response = await showsApi.getShowDetails(showId);
    show.value = response.show;

    if (show.value.seasons && show.value.seasons > 0) {
      show.value.seasons_details = [];
      for (let i = 1; i <= show.value.seasons; i++) {
        const seasonImageUrl = showsApi.getSeasonImage(showId, i, 150, 200);
        show.value.seasons_details.push({
          number: i,
          episodes: Math.floor((show.value.episodes || 0) / show.value.seasons),
          image: seasonImageUrl,
        });
      }
    }

    await loadLatestAndNextEpisodes();

    if (authStore.isAuthenticated) {
      await checkFollowStatus();
    }

    if (show.value?.seasons_details && show.value.seasons_details.length > 0) {
      const seasonPromises = show.value.seasons_details.map(async (season) => {
        if (!seasonEpisodes.value[season.number]) {
          await loadSeasonEpisodes(season.number);
        }
      });
      await Promise.allSettled(seasonPromises);
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la série:', error);
    show.value = null;
  } finally {
    isLoading.value = false;
  }
};

const getGenresArray = (genres?: string[] | Record<string, string>): string[] => {
  if (!genres) return [];

  if (Array.isArray(genres)) {
    return genres;
  }

  return Object.values(genres);
};

const getGenreClass = (genre: string): string => {
  const genreMap: { [key: string]: string } = {
    Action: 'action',
    Aventure: 'adventure',
    Animation: 'animation',
    Biographie: 'biography',
    Comédie: 'comedy',
    Crime: 'crime',
    Documentaire: 'documentary',
    Drame: 'drama',
    Famille: 'family',
    Fantastique: 'fantasy',
    Histoire: 'history',
    Horreur: 'horror',
    Musique: 'music',
    Mystère: 'mystery',
    Romance: 'romance',
    'Science-fiction': 'scifi',
    Sport: 'sport',
    Thriller: 'thriller',
    Guerre: 'war',
    Western: 'western',
    Enfant: 'family',
    Children: 'family',
  };

  return genreMap[genre] || 'default';
};

const formatDuration = (duration: number | string): string => {
  const totalMinutes = typeof duration === 'string' ? parseInt(duration, 10) : duration;

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}min`;
  }
  return `${totalMinutes}min`;
};

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  if (img) {
    const altText = img.alt || '';
    const episodeMatch = altText.match(/Épisode (\d+)/);
    const seasonMatch = altText.match(/Saison (\d+)/);

    if (episodeMatch && episodeMatch[1]) {
      const episodeNumber = parseInt(episodeMatch[1]);
      const seasonNumber = seasonMatch && seasonMatch[1] ? parseInt(seasonMatch[1]) : undefined;
      img.src = getEpisodePlaceholderUrl(episodeNumber, seasonNumber);
    } else {
      img.src = getEpisodePlaceholderUrl(1);
    }
  }
};

const getEpisodePlaceholderUrl = (episodeNumber: number, seasonNumber?: number): string => {
  const svg = `
    <svg width="150" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="100" fill="#f5f5f5" stroke="#ddd" stroke-width="1"/>
      <text x="75" y="40" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#666">
        ${seasonNumber ? `S${seasonNumber}` : ''}E${episodeNumber}
      </text>
      <text x="75" y="60" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#999">
        Épisode
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const isEpisodeUpcoming = (episode: ProcessedEpisode): boolean => {
  if (!episode.date) return false;
  const now = new Date();
  const episodeDate = new Date(episode.date);
  return episodeDate > now;
};

const getEpisodeImageUrl = (episode: ProcessedEpisode, width = 150, height = 100): string => {
  if (episode.image && episode.image !== '') {
    return episode.image;
  }

  if (isEpisodeUpcoming(episode) && show.value) {
    return (
      show.value.poster ||
      show.value.images?.poster ||
      getEpisodePlaceholderUrl(episode.episode, episode.season)
    );
  }

  if (episode.id && episode.id !== 'undefined' && episode.id !== 'null') {
    return showsApi.getEpisodeImage(episode.id, width, height);
  }

  return getEpisodePlaceholderUrl(episode.episode, episode.season);
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

const toggleSeason = async (seasonNumber: number) => {
  if (expandedSeason.value === seasonNumber) {
    expandedSeason.value = null;
  } else {
    expandedSeason.value = seasonNumber;

    if (!seasonEpisodes.value[seasonNumber]) {
      await loadSeasonEpisodes(seasonNumber);
    }
  }
};

const loadSeasonEpisodes = async (seasonNumber: number) => {
  if (!show.value?.id) return;

  loadingEpisodes.value[seasonNumber] = true;

  try {
    let response;
    if (authStore.token) {
      response = await memberApi.getSeasonEpisodes(authStore.token, show.value.id, seasonNumber);
    } else {
      response = await showsApi.getSeasonEpisodes(show.value.id, seasonNumber);
    }

    const episodes: ProcessedEpisode[] = response.episodes.map((episode: BetaSeriesEpisode) => ({
      id: episode.id,
      episode: episode.episode,
      season: episode.season,
      title: episode.title || `Épisode ${episode.episode}`,
      date: episode.date ? new Date(episode.date) : null,
      image: episode.image || null,
      description: episode.description,
      length: episode.length,
      rating: episode.rating,
      seen: episode.seen || false,
      user: episode.user || { seen: false },
    }));

    seasonEpisodes.value[seasonNumber] = episodes;
  } catch (error) {
    console.error('Erreur lors du chargement des épisodes:', error);

    seasonEpisodes.value[seasonNumber] = [
      {
        id: 'error',
        episode: 0,
        title: 'Erreur lors du chargement des épisodes',
        date: null,
        image: null,
        isError: true,
      },
    ];
  } finally {
    loadingEpisodes.value[seasonNumber] = false;
  }
};

const getSeasonEpisodes = (seasonNumber: number) => {
  return seasonEpisodes.value[seasonNumber] || [];
};

const formatDate = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return 'Date non disponible';
  }

  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const loadLatestAndNextEpisodes = async () => {
  if (!show.value?.id) return;

  loadingLatestNext.value = true;

  try {
    const [latestResponse, nextResponse] = await Promise.allSettled([
      showsApi.getLatestEpisode(show.value.id),
      showsApi.getNextEpisode(show.value.id),
    ]);

    if (latestResponse.status === 'fulfilled' && latestResponse.value.episode) {
      const episode = latestResponse.value.episode;
      latestEpisode.value = {
        id: episode.id,
        episode: episode.episode,
        season: episode.season,
        title: episode.title || `Épisode ${episode.episode}`,
        date: episode.date ? new Date(episode.date) : null,
        image: episode.image || null,
        description: episode.description,
        length: episode.length,
        rating: episode.rating,
      };
    }

    if (nextResponse.status === 'fulfilled' && nextResponse.value.episode) {
      const episode = nextResponse.value.episode;

      if (episode.season && episode.episode && episode.title) {
        nextEpisode.value = {
          id: episode.id,
          episode: episode.episode,
          season: episode.season,
          title: episode.title,
          date: episode.date ? new Date(episode.date) : null,
          image: episode.image || null,
          description: episode.description,
          length: episode.length,
          rating: episode.rating,
        };
      } else {
        nextEpisode.value = null;
      }
    } else {
      nextEpisode.value = null;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des épisodes récents:', error);
  } finally {
    loadingLatestNext.value = false;
  }
};

const markEpisodeAsWatched = async (episodeId: string) => {
  if (!authStore.isAuthenticated) {
    showLoginDialog.value = true;
    return;
  }

  loadingEpisodeActions.value[episodeId] = true;

  try {
    await memberApi.markEpisodeAsWatched(authStore.token!, episodeId);

    await new Promise((resolve) =>
      requestAnimationFrame(() => {
        Object.keys(seasonEpisodes.value).forEach((seasonNumber) => {
          const episodes = seasonEpisodes.value[parseInt(seasonNumber)];
          if (episodes) {
            const episodeIndex = episodes.findIndex((ep) => ep.id === episodeId);
            if (episodeIndex !== -1) {
              const episode = episodes[episodeIndex];
              if (episode) {
                episode.user = { seen: true };
                episode.seen = true;
              }
            }
          }
        });
        resolve(void 0);
      }),
    );
  } catch (error) {
    console.error("Erreur lors du marquage de l'épisode comme vu:", error);
  } finally {
    loadingEpisodeActions.value[episodeId] = false;
  }
};

const markEpisodeAsUnwatched = async (episodeId: string) => {
  if (!authStore.isAuthenticated) {
    showLoginDialog.value = true;
    return;
  }

  loadingEpisodeActions.value[episodeId] = true;

  try {
    await memberApi.markEpisodeAsUnwatched(authStore.token!, episodeId);

    await new Promise((resolve) =>
      requestAnimationFrame(() => {
        Object.keys(seasonEpisodes.value).forEach((seasonNumber) => {
          const episodes = seasonEpisodes.value[parseInt(seasonNumber)];
          if (episodes) {
            const episodeIndex = episodes.findIndex((ep) => ep.id === episodeId);
            if (episodeIndex !== -1) {
              const episode = episodes[episodeIndex];
              if (episode) {
                episode.user = { seen: false };
                episode.seen = false;
              }
            }
          }
        });
        resolve(void 0);
      }),
    );
  } catch (error) {
    console.error("Erreur lors du marquage de l'épisode comme non vu:", error);
  } finally {
    loadingEpisodeActions.value[episodeId] = false;
  }
};

const markAllEpisodesAsWatched = async () => {
  if (!authStore.isAuthenticated) {
    showLoginDialog.value = true;
    return;
  }

  if (!show.value) {
    console.error('Série non chargée');
    return;
  }

  markingAllAsWatched.value = true;

  try {
    const seasonPromises = (show.value.seasons_details || []).map(async (season) => {
      if (!seasonEpisodes.value[season.number]) {
        await loadSeasonEpisodes(season.number);
      }
      return seasonEpisodes.value[season.number] || [];
    });

    const seasonResults = await Promise.allSettled(seasonPromises);
    const allEpisodes: ProcessedEpisode[] = [];

    seasonResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        allEpisodes.push(...result.value.filter((ep) => !ep.isError && !isEpisodeUpcoming(ep)));
      }
    });

    await new Promise((resolve) => requestAnimationFrame(resolve));

    if (allEpisodesWatched.value) {
      const promises = allEpisodes.map((episode) =>
        memberApi.markEpisodeAsUnwatched(authStore.token!, episode.id),
      );

      await Promise.allSettled(promises);

      await new Promise((resolve) =>
        requestAnimationFrame(() => {
          allEpisodes.forEach((episode) => {
            episode.user = { seen: false };
            episode.seen = false;
          });
          resolve(void 0);
        }),
      );
    } else {
      const promises = allEpisodes.map((episode) =>
        memberApi.markEpisodeAsWatched(authStore.token!, episode.id),
      );

      await Promise.allSettled(promises);

      await new Promise((resolve) =>
        requestAnimationFrame(() => {
          allEpisodes.forEach((episode) => {
            episode.user = { seen: true };
            episode.seen = true;
          });
          resolve(void 0);
        }),
      );
    }
  } catch (error) {
    console.error('Erreur lors du marquage des épisodes:', error);
  } finally {
    markingAllAsWatched.value = false;
  }
};

const checkFollowStatus = async () => {
  if (!authStore.token || !show.value?.id) return;

  followFeatureEnabled.value = true;

  try {
    const { data } = await axios.get('https://api.betaseries.com/shows/member', {
      params: { locale: 'fr' },
      headers: {
        'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
        'X-BetaSeries-Token': authStore.token,
      },
    });

    const isShowFollowed = data.shows?.some(
      (followedShow: { id: string | number }) =>
        followedShow.id === show.value?.id || followedShow.id === show.value?.id?.toString(),
    );

    isFollowing.value = isShowFollowed || false;
  } catch (error) {
    isFollowing.value = false;
  }
};

const toggleFollowShow = async () => {
  if (!authStore.isAuthenticated) {
    showLoginDialog.value = true;
    return;
  }

  if (!show.value?.id) {
    console.error('Série non chargée');
    return;
  }

  togglingFollow.value = true;

  try {
    if (isFollowing.value) {
      await axios.delete(`https://api.betaseries.com/shows/show?id=${show.value.id}&locale=fr`, {
        headers: {
          'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
          'X-BetaSeries-Token': authStore.token,
        },
      });
    } else {
      await axios.post(
        'https://api.betaseries.com/shows/show',
        {
          id: show.value.id,
          locale: 'fr',
        },
        {
          headers: {
            'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
            'X-BetaSeries-Token': authStore.token,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
    }

    isFollowing.value = !isFollowing.value;
    if (show.value) {
      show.value.following = isFollowing.value ? '1' : '0';
    }

    if (isFollowing.value) {
      await checkFavoriteStatus();
    } else {
      isFavorite.value = false;
    }

    if (authStore.user?.stats) {
      if (isFollowing.value) {
        authStore.user.stats.shows = (authStore.user.stats.shows || 0) + 1;
      } else {
        authStore.user.stats.shows = Math.max((authStore.user.stats.shows || 0) - 1, 0);
      }
    }
  } catch (error) {
    await checkFollowStatus();
  } finally {
    togglingFollow.value = false;
  }
};

const checkFavoriteStatus = async () => {
  if (!authStore.isAuthenticated || !show.value?.id) return;

  try {
    const response = await memberApi.getFavoriteShows(authStore.token!);

    isFavorite.value =
      response.shows?.some((favShow: { id: string | number }) => favShow.id === show.value?.id) ||
      false;
  } catch (error: unknown) {
    console.error('Erreur lors de la vérification des favoris:', error);
    console.log(
      "Détails de l'erreur:",
      (error as { response?: { data?: unknown } })?.response?.data,
    );
    isFavorite.value = false;
  }
};

const toggleFavoriteShow = async () => {
  if (!authStore.isAuthenticated) {
    showLoginDialog.value = true;
    return;
  }

  if (!show.value?.id) {
    console.error('Série non chargée');
    return;
  }

  togglingFavorite.value = true;

  try {
    if (isFavorite.value) {
      await memberApi.removeFavoriteShow(authStore.token!, show.value.id);
      isFavorite.value = false;
    } else {
      await memberApi.addFavoriteShow(authStore.token!, show.value.id);
      isFavorite.value = true;
    }
  } catch (error) {
    console.error('Erreur lors du changement de statut favori:', error);
  } finally {
    togglingFavorite.value = false;
  }
};

watch(
  show,
  (newShow) => {
    if (newShow?.seasons_details && newShow.seasons_details.length > 0) {
      newShow.seasons_details.forEach((season) => {
        if (!seasonEpisodes.value[season.number]) {
          loadSeasonEpisodes(season.number).catch(console.error);
        }
      });
    }
  },
  { immediate: true },
);

watch(
  [isFollowing, () => authStore.isAuthenticated],
  ([newIsFollowing, isAuth]) => {
    if (newIsFollowing && isAuth) {
      void checkFavoriteStatus();
    } else if (!newIsFollowing) {
      isFavorite.value = false;
    }
  },
  { immediate: true },
);

const goToLogin = () => {
  showLoginDialog.value = false;

  localStorage.setItem('redirect_after_login', route.fullPath);

  authStore.initiateOAuthLogin();
};

onMounted(() => {
  void loadShowDetails();
});
</script>

<script lang="ts">
export default {
  name: 'ShowDetailPage',
};
</script>

<style lang="scss" scoped>
.page-wrapper {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.show-banner {
  position: relative;
  height: 500px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%);
}

.banner-content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.banner-show-info {
  display: flex;
  align-items: flex-end;
  gap: 25px;
  flex: 1;
  margin-top: auto;
  margin-bottom: 10px;
  max-width: 1200px;
  width: 100%;
}

.banner-poster-container {
  flex-shrink: 0;
}

.banner-poster {
  width: 153px;
  height: 230px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.banner-text-content {
  flex: 1;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.banner-title {
  font-size: 3rem;
  font-weight: bold;
  margin: 0 0 10px 0;
  line-height: 1.1;
}

.banner-year {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 15px;
}

.banner-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
}

.rating-text {
  font-weight: bold;
  color: #ffc107;
}

.rating-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

.banner-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
}

.banner-details {
  display: flex;
  gap: 30px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.banner-detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.banner-detail-label {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.banner-detail-value {
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
}

.banner-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.banner-mark-all-btn {
  font-weight: 600;
  border-radius: 8px;
  padding: 12px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  touch-action: manipulation;
  will-change: transform, box-shadow;
}

.banner-mark-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.banner-mark-all-btn.all-watched {
  background-color: #4caf50 !important;
  color: white !important;
}

.banner-mark-all-btn.all-watched:hover {
  background-color: #45a049 !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.banner-follow-btn {
  font-weight: 600;
  border-radius: 8px;
  padding: 12px 24px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  touch-action: manipulation;
  will-change: transform, box-shadow;
}

.banner-follow-btn * {
  touch-action: manipulation;
}

.banner-follow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.banner-follow-btn.following {
  background-color: #f44336 !important;
  color: white !important;
}

.banner-follow-btn.following:hover {
  background-color: #d32f2f !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
}

/* Optimisation globale pour les événements tactiles */
.q-btn {
  touch-action: manipulation !important;
}

.q-btn * {
  touch-action: manipulation !important;
}

.genre-chip {
  font-weight: 500;
  font-size: 0.85rem;
  padding: 6px 14px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  border: none;
  display: inline-block;
  margin-right: 6px;
  margin-bottom: 6px;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.genre-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.genre-action {
  background-color: rgba(231, 76, 60, 0.9);
  color: white;
}
.genre-adventure {
  background-color: rgba(46, 204, 113, 0.9);
  color: white;
}
.genre-animation {
  background-color: rgba(155, 89, 182, 0.9);
  color: white;
}
.genre-biography {
  background-color: rgba(149, 165, 166, 0.9);
  color: white;
}
.genre-comedy {
  background-color: rgba(241, 196, 15, 0.9);
  color: #2c3e50;
}
.genre-crime {
  background-color: rgba(44, 62, 80, 0.9);
  color: white;
}
.genre-documentary {
  background-color: rgba(52, 152, 219, 0.9);
  color: white;
}
.genre-drama {
  background-color: rgba(142, 68, 173, 0.9);
  color: white;
}
.genre-family {
  background-color: rgba(26, 188, 156, 0.9);
  color: white;
}
.genre-fantasy {
  background-color: rgba(230, 126, 34, 0.9);
  color: white;
}
.genre-history {
  background-color: rgba(127, 140, 141, 0.9);
  color: white;
}
.genre-horror {
  background-color: rgba(192, 57, 43, 0.9);
  color: white;
}
.genre-music {
  background-color: rgba(155, 89, 182, 0.9);
  color: white;
}
.genre-mystery {
  background-color: rgba(44, 62, 80, 0.9);
  color: white;
}
.genre-romance {
  background-color: rgba(231, 76, 60, 0.9);
  color: white;
}
.genre-scifi {
  background-color: rgba(52, 152, 219, 0.9);
  color: white;
}
.genre-sport {
  background-color: rgba(46, 204, 113, 0.9);
  color: white;
}
.genre-thriller {
  background-color: rgba(44, 62, 80, 0.9);
  color: white;
}
.genre-war {
  background-color: rgba(127, 140, 141, 0.9);
  color: white;
}
.genre-western {
  background-color: rgba(230, 126, 34, 0.9);
  color: white;
}
.genre-default {
  background-color: rgba(149, 165, 166, 0.9);
  color: white;
}

.show-info-header {
  background: white;
  padding: 30px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.show-info-header-content {
  display: flex;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: flex-start;
}

.show-poster-section {
  flex-shrink: 0;
}

.show-poster-large {
  width: 200px;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.show-info-text {
  flex: 1;
  min-width: 0;
}

.show-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1976d2;
  margin: 0 0 10px 0;
  line-height: 1.2;
}

.show-year {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 15px;
}

.show-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.show-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.show-details-row {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.show-details-section {
  max-width: 1200px;
  padding: 20px 20px 0 20px;
  width: 100%;
  margin: 0 auto;
}

.synopsis-container {
  max-width: 1200px;
  padding: 20px 20px;
  width: 100%;
  margin: 0 auto;
}

.synopsis-text {
  line-height: 1.7;
  text-align: justify;
  font-size: 1.1rem;
}

.back-button-container {
  width: 100%;
  max-width: 1200px;
  padding: 0 20px 20px 20px;
  display: flex;
  justify-content: flex-start;
}

@media (max-width: 768px) {
  .show-banner {
    height: 350px;
  }

  .banner-show-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 15px;
    margin-bottom: 20px;
  }

  .banner-poster {
    width: 120px;
    height: 180px;
  }

  .banner-title {
    font-size: 2rem;
  }

  .banner-year {
    font-size: 1.2rem;
  }

  .banner-rating {
    font-size: 1rem;
  }

  .banner-details {
    gap: 20px;
  }

  .show-info-header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }

  .show-poster-large {
    width: 150px;
    height: 225px;
  }

  .show-title {
    font-size: 2rem;
  }

  .show-details-row {
    gap: 20px;
    justify-content: center;
  }

  .details-row {
    gap: 15px;
    justify-content: center;
  }
}

.show-detail-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  padding: 0 20px;
  width: auto;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .show-detail-container {
    flex-direction: row;
    align-items: flex-start;
    gap: 32px;
  }
}

.show-poster-section {
  flex: 0 0 auto;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .show-poster-section {
    flex: 0 0 300px;
    margin: 0;
  }
}

.show-info-section {
  flex: 1;
  min-width: 0;
}

.show-poster-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.show-poster {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.show-poster-placeholder {
  width: 100%;
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12px;
  border: 2px dashed #ccc;
}

.rating-container {
  display: flex;
  align-items: center;
  background: rgba(255, 193, 7, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  width: fit-content;
}

.genres-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.show-details {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.details-row {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  align-items: center;
  justify-content: center;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.description-text {
  line-height: 1.6;
  text-align: justify;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(25, 118, 210, 0.05);
  border-radius: 8px;
  border-left: 4px solid #1976d2;
}

.streaming-platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.seasons-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.season-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.season-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.season-card.season-expanded {
  border-color: #1976d2;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.2);
}

.season-header {
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  gap: 16px;
}

.season-header:hover {
  background-color: rgba(25, 118, 210, 0.05);
}

.season-poster-container {
  flex-shrink: 0;
  width: 80px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.season-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.season-poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

.season-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.season-title {
  display: flex;
  align-items: center;
  color: #1976d2;
}

.season-episodes-count {
  color: #666;
  font-size: 0.9rem;
}

.season-toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(25, 118, 210, 0.1);
  transition: all 0.2s ease;
}

.season-toggle:hover {
  background: rgba(25, 118, 210, 0.2);
  transform: scale(1.1);
}

.season-episodes {
  background: rgba(25, 118, 210, 0.02);
  border-top: 1px solid rgba(25, 118, 210, 0.1);
  padding: 20px;
}

.episodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.episode-card {
  display: flex;
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  gap: 12px;
}

.episode-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.episode-poster {
  position: relative;
  flex-shrink: 0;
  width: 100px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.episode-poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.episode-poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

.episode-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 6px;
}

.episode-overlay.upcoming {
  background: rgba(0, 0, 0, 0.8);
}

.upcoming-badge {
  display: flex;
  align-items: center;
  background: rgba(255, 193, 7, 0.9);
  color: #000;
  padding: 6px 12px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 0.8rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

.episode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.episode-number {
  font-size: 0.8rem;
  color: #1976d2;
  font-weight: 600;
}

.episode-title {
  font-weight: 500;
  color: #333;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.episode-date {
  font-size: 0.75rem;
  color: #666;
}

.episode-length {
  font-size: 0.7rem;
  color: #888;
  display: flex;
  align-items: center;
}

.episode-rating {
  font-size: 0.7rem;
  color: #888;
  display: flex;
  align-items: center;
}

.episode-actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-start;
}

.episode-actions .q-btn {
  font-size: 0.75rem;
  min-height: 28px;
  padding: 4px 8px;
}

.episode-error {
  border-left: 3px solid #f44336;
  background-color: rgba(244, 67, 54, 0.05);
}

.episodes-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
}

.recent-episodes-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.recent-episodes-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #666;
}

.recent-episodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.recent-episode-card {
  display: flex;
  background: rgba(25, 118, 210, 0.02);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
  gap: 16px;
  border-left: 4px solid transparent;
}

.recent-episode-card.latest {
  border-left-color: #4caf50;
}

.recent-episode-card.next {
  border-left-color: #ff9800;
}

.recent-episode-card:hover {
  background: rgba(25, 118, 210, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.recent-episode-poster {
  flex-shrink: 0;
  width: 120px;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.recent-episode-poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recent-episode-poster-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

.recent-episode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.recent-episode-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.latest-badge {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.next-badge {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.recent-episode-title {
  font-weight: 600;
  color: #333;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-episode-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  color: #666;
}

.recent-episode-date {
  font-weight: 500;
  color: #1976d2;
}

@media (max-width: 768px) {
  .season-header {
    padding: 16px;
    gap: 12px;
  }

  .season-poster-container {
    width: 60px;
    height: 90px;
  }

  .episodes-grid {
    grid-template-columns: 1fr;
  }

  .episode-card {
    padding: 10px;
  }

  .recent-episodes-grid {
    grid-template-columns: 1fr;
  }

  .recent-episode-card {
    padding: 12px;
    gap: 12px;
  }

  .recent-episode-poster {
    width: 100px;
    height: 150px;
  }
}

.login-dialog-card {
  min-width: 400px;
  max-width: 500px;
  border-radius: 16px;
}

.banner-favorite-btn {
  font-weight: 600;
  border-radius: 8px;
  padding: 12px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  touch-action: manipulation;
  will-change: transform, box-shadow;
}

.banner-favorite-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.banner-favorite-btn.favorited {
  background-color: #ffc107 !important;
  color: white !important;
}

.banner-favorite-btn.favorited:hover {
  background-color: #ffb300 !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
}
</style>
