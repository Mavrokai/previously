<template>
  <q-page class="bg-grey-1">
    <div v-if="isLoading" class="text-center q-py-xl">
      <q-spinner-dots size="3rem" color="primary" />
      <div class="text-h6 text-grey-7 q-mt-md">Chargement de la série...</div>
    </div>

    <div v-else-if="show" class="page-wrapper">
      <div class="show-detail-container">
        <div class="show-poster-section">
          <div class="show-poster-container">
            <img
              v-if="show.poster || show.images?.poster"
              :src="show.poster || show.images?.poster || ''"
              :alt="show.title"
              class="show-poster"
              @error="onImageError"
            />
            <img
              v-else-if="show.id"
              :src="getShowImageUrl(show.id)"
              :alt="show.title"
              class="show-poster"
              @error="onImageError"
            />
            <div v-else class="show-poster-placeholder">
              <q-icon name="tv" size="4rem" color="grey-5" />
            </div>
          </div>
        </div>

        <div class="show-info-section">
          <div class="show-info">
            <div class="text-h3 text-weight-bold text-primary q-mb-md">
              {{ show.title }}
              <span v-if="show.release_date" class="text-h5 text-grey-6 q-ml-sm">
                ({{ new Date(show.release_date * 1000).getFullYear() }})
              </span>
            </div>

            <div v-if="show.notes?.mean" class="q-mb-md">
              <div class="rating-container">
                <q-icon name="star" size="1.5rem" color="amber" />
                <span class="text-h6 text-weight-bold q-ml-sm">
                  {{ show.notes.mean.toFixed(1) }}
                </span>
                <span class="text-body2 text-grey-6 q-ml-sm"> ({{ show.notes.total }} avis) </span>
              </div>
            </div>

            <div v-if="show.genres" class="q-mb-md">
              <div class="genres-container">
                <q-chip
                  v-for="genre in getGenresArray(show.genres)"
                  :key="genre"
                  color="primary"
                  text-color="white"
                  size="md"
                  class="q-mr-sm q-mb-sm"
                >
                  {{ genre }}
                </q-chip>
              </div>
            </div>

            <div class="show-details q-mb-lg">
              <div class="row q-gutter-md">
                <div v-if="show.length" class="col-12 col-sm-6">
                  <div class="detail-item">
                    <q-icon name="schedule" color="primary" class="q-mr-sm" />
                    <span class="text-weight-medium">Durée :</span>
                    <span class="q-ml-sm">{{ formatDuration(show.length) }}</span>
                  </div>
                </div>

                <div v-if="show.seasons" class="col-12 col-sm-6">
                  <div class="detail-item">
                    <q-icon name="layers" color="primary" class="q-mr-sm" />
                    <span class="text-weight-medium">Nombre de saisons :</span>
                    <span class="q-ml-sm">{{ show.seasons }}</span>
                  </div>
                </div>

                <div v-if="show.episodes" class="col-12 col-sm-6">
                  <div class="detail-item">
                    <q-icon name="playlist_play" color="primary" class="q-mr-sm" />
                    <span class="text-weight-medium">Nombre d'épisodes total :</span>
                    <span class="q-ml-sm">{{ show.episodes }}</span>
                  </div>
                </div>

                <div v-if="show.status" class="col-12 col-sm-6">
                  <div class="detail-item">
                    <q-icon name="info" color="primary" class="q-mr-sm" />
                    <span class="text-weight-medium">Statut :</span>
                    <span class="q-ml-sm">{{ translateStatus(show.status) }}</span>
                  </div>
                </div>

                <div v-if="show.network" class="col-12 col-sm-6">
                  <div class="detail-item">
                    <q-icon name="tv" color="primary" class="q-mr-sm" />
                    <span class="text-weight-medium">Chaîne :</span>
                    <span class="q-ml-sm">{{ show.network }}</span>
                  </div>
                </div>

                <div v-if="show.country" class="col-12 col-sm-6">
                  <div class="detail-item">
                    <q-icon name="public" color="primary" class="q-mr-sm" />
                    <span class="text-weight-medium">Pays :</span>
                    <span class="q-ml-sm">{{ show.country }}</span>
                  </div>
                </div>

                <div v-if="show.language" class="col-12 col-sm-6">
                  <div class="detail-item">
                    <q-icon name="language" color="primary" class="q-mr-sm" />
                    <span class="text-weight-medium">Langue :</span>
                    <span class="q-ml-sm">{{ show.language }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="latestEpisode || (nextEpisode && hasValidNextEpisode)" class="q-mb-lg">
              <div class="text-h5 text-weight-bold text-primary q-mb-md">Épisodes Récents</div>
              <div class="recent-episodes-container">
                <div v-if="loadingLatestNext" class="recent-episodes-loading">
                  <q-spinner-dots size="2rem" color="primary" />
                  <div class="text-body2 text-grey-6 q-mt-sm">
                    Chargement des épisodes récents...
                  </div>
                </div>

                <div v-else class="recent-episodes-grid">
                  <div v-if="latestEpisode" class="recent-episode-card latest">
                    <div class="recent-episode-poster">
                      <img
                        :src="getEpisodeImageUrl(latestEpisode, 200, 120)"
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
                        <span v-if="latestEpisode.date" class="recent-episode-date">
                          {{ formatDate(latestEpisode.date) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div v-if="nextEpisode && hasValidNextEpisode" class="recent-episode-card next">
                    <div class="recent-episode-poster">
                      <img
                        :src="getEpisodeImageUrl(nextEpisode, 200, 120)"
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
                        <span v-if="nextEpisode.date" class="recent-episode-date">
                          {{ formatDate(nextEpisode.date) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="show.seasons_details && show.seasons_details.length > 0" class="q-mb-lg">
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
                              :src="getEpisodeImageUrl(episode, 150, 100)"
                              :alt="episode.title"
                              class="episode-poster-img"
                              @error="onImageError"
                            />
                            <div v-else class="episode-poster-placeholder">
                              <q-icon name="error" size="1.5rem" color="negative" />
                            </div>
                          </div>

                          <div class="episode-info">
                            <div v-if="!episode.isError" class="episode-number">
                              Épisode {{ episode.episode }}
                            </div>
                            <div
                              class="episode-title"
                              :class="{ 'text-negative': episode.isError }"
                            >
                              {{ episode.title }}
                            </div>
                            <div v-if="episode.date && !episode.isError" class="episode-date">
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-slide-transition>
                </div>
              </div>
            </div>

            <div v-if="show.description" class="q-mb-lg">
              <div class="text-h6 text-weight-bold text-primary q-mb-sm">Synopsis</div>
              <div class="text-body1 text-grey-8 description-text">
                {{ show.description }}
              </div>
            </div>

            <div v-if="show.following || show.followers" class="q-mb-lg">
              <div class="text-h6 text-weight-bold text-primary q-mb-sm">Statistiques</div>
              <div class="stats-container">
                <div v-if="show.following" class="stat-item">
                  <q-icon name="favorite" color="red" class="q-mr-sm" />
                  <span class="text-weight-medium">{{ show.following }} personnes suivent</span>
                </div>
                <div v-if="show.followers" class="stat-item">
                  <q-icon name="people" color="blue" class="q-mr-sm" />
                  <span class="text-weight-medium">{{ show.followers }} abonnés</span>
                </div>
              </div>
            </div>

            <div v-if="show.svods && show.svods.length > 0" class="q-mb-lg">
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
    </div>

    <div v-else class="text-center q-py-xl">
      <q-icon name="error" size="4rem" color="negative" class="q-mb-md" />
      <div class="text-h6 text-grey-7">Série non trouvée</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showsApi, type BetaSeriesShow, type BetaSeriesEpisode } from '../services/betaseries-api';

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
}

const route = useRoute();
const router = useRouter();

const show = ref<BetaSeriesShow | null>(null);
const isLoading = ref(false);
const expandedSeason = ref<number | null>(null);
const seasonEpisodes = ref<Record<number, ProcessedEpisode[]>>({});
const loadingEpisodes = ref<Record<number, boolean>>({});
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

const getShowImageUrl = (showId: string): string => {
  return showsApi.getShowImage(showId, 400, 600);
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

const getEpisodeImageUrl = (episode: ProcessedEpisode, width = 150, height = 100): string => {
  if (episode.image && episode.image !== '') {
    return episode.image;
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
    const response = await showsApi.getSeasonEpisodes(show.value.id, seasonNumber);
    const episodes: ProcessedEpisode[] = response.episodes.map((episode: BetaSeriesEpisode) => ({
      id: episode.id,
      episode: episode.episode,
      season: episode.season,
      title: episode.title || `Épisode ${episode.episode}`,
      date: episode.date ? new Date(episode.date * 1000) : null,
      image: episode.image || null,
      description: episode.description,
      length: episode.length,
      rating: episode.rating,
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
        date: episode.date ? new Date(episode.date * 1000) : null,
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
          date: episode.date ? new Date(episode.date * 1000) : null,
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
  padding: 80px 0 40px 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.show-detail-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  padding: 20px;
  width: auto;
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
  flex-shrink: 0;
  width: 60px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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
  width: 80px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
    width: 60px;
    height: 45px;
  }
}
</style>
