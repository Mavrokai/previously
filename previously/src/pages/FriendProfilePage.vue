<template>
  <q-page class="profile-page">
    <div v-if="isLoading" class="loading-container">
      <q-spinner-dots size="4rem" color="primary" />
      <div class="text-h6 text-grey-6 q-mt-md">Chargement du profil...</div>
    </div>

    <div v-else-if="error" class="error-container">
      <q-icon name="error" size="4rem" color="negative" class="q-mb-md" />
      <div class="text-h6 text-negative">{{ error }}</div>
      <q-btn
        color="primary"
        label="Retour aux amis"
        @click="$router.push('/friends')"
        class="q-mt-md"
        rounded
        unelevated
      />
    </div>

    <div v-else-if="friend" class="profile-container">
      <div class="profile-header">
        <div
          class="profile-banner"
          :style="{
            backgroundImage: friend.profile_banner ? `url(${friend.profile_banner})` : 'none',
          }"
        >
          <div class="banner-overlay"></div>
        </div>
        <div class="profile-content">
          <div class="profile-avatar-section">
            <q-avatar size="140px" class="profile-avatar">
              <img v-if="friend.avatar" :src="friend.avatar" :alt="friend.login" />
              <q-icon v-else name="person" size="70px" color="grey-6" />
            </q-avatar>
            <div class="profile-info">
              <h1 class="profile-name">{{ friend.login }}</h1>
              <div v-if="friend.stats" class="profile-stats">
                <div class="stat-item">
                  <q-icon name="tv" size="20px" color="grey-7" />
                  <span>{{ friend.stats.shows }} séries</span>
                </div>
                <div class="stat-item">
                  <q-icon name="play_circle" size="20px" color="grey-7" />
                  <span>{{ friend.stats.episodes }} épisodes</span>
                </div>
                <div class="stat-item">
                  <q-icon name="movie" size="20px" color="grey-7" />
                  <span>{{ friend.stats.movies }} films</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-main">
        <q-tabs
          v-model="activeTab"
          class="profile-tabs"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="shows" icon="tv" label="Séries" />
          <q-tab name="movies" icon="movie" label="Films" />
        </q-tabs>

        <q-separator class="q-mb-lg" />

        <q-tab-panels v-model="activeTab" animated class="tab-panels">
          <q-tab-panel name="shows">
            <div class="section-header">
              <h2 class="section-title">
                <q-icon name="tv" class="q-mr-sm" />
                Séries suivies
              </h2>
              <div v-if="friendShows.length > 0" class="section-count">
                {{ friendShows.length }} série{{ friendShows.length > 1 ? 's' : '' }}
              </div>
            </div>

            <div v-if="friendShowsLoading" class="loading-section">
              <q-spinner-dots size="2rem" color="primary" />
              <div class="text-body2 text-grey-6 q-mt-sm">Chargement des séries...</div>
            </div>

            <div v-else-if="friendShows.length === 0" class="empty-state">
              <q-icon name="tv_off" size="3rem" color="grey-5" class="q-mb-md" />
              <h3 class="text-h6 text-grey-7">Aucune série suivie</h3>
              <p class="text-body2 text-grey-6">
                Les données peuvent être limitées par les paramètres de confidentialité
              </p>
            </div>

            <div v-else class="content-grid">
              <div v-for="show in friendShows" :key="show.id" class="content-item">
                <q-card class="show-card" @click="goToShow(show.id)">
                  <q-img :src="getShowImage(show.id)" :alt="show.title" class="show-poster">
                    <div class="card-overlay">
                      <div class="card-content">
                        <h3 class="card-title">{{ show.title }}</h3>
                        <div v-if="show.user" class="card-progress">
                          {{ getShowProgress(show) }}
                        </div>
                      </div>
                    </div>
                  </q-img>
                </q-card>
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="movies">
            <div class="section-header">
              <h2 class="section-title">
                <q-icon name="movie" class="q-mr-sm" />
                Films vus
              </h2>
              <div v-if="friendMovies.length > 0" class="section-count">
                {{ friendMovies.length }} film{{ friendMovies.length > 1 ? 's' : '' }}
              </div>
            </div>

            <div v-if="friendMoviesLoading" class="loading-section">
              <q-spinner-dots size="2rem" color="primary" />
              <div class="text-body2 text-grey-6 q-mt-sm">Chargement des films...</div>
            </div>

            <div v-else-if="friendMovies.length === 0" class="empty-state">
              <q-icon name="movie_creation" size="3rem" color="grey-5" class="q-mb-md" />
              <h3 class="text-h6 text-grey-7">Aucun film vu</h3>
              <p class="text-body2 text-grey-6">
                Les données peuvent être limitées par les paramètres de confidentialité
              </p>
            </div>

            <div v-else class="content-grid">
              <div v-for="movie in friendMovies" :key="movie.id" class="content-item">
                <q-card class="movie-card" @click="goToMovie(movie.id)">
                  <q-img :src="getMovieImage(movie.id)" :alt="movie.title" class="movie-poster">
                    <div class="card-overlay">
                      <div class="card-content">
                        <h3 class="card-title">{{ movie.title }}</h3>
                        <div v-if="movie.production_year" class="card-year">
                          {{ movie.production_year }}
                        </div>
                      </div>
                    </div>
                  </q-img>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { friendsApi, showsApi, moviesApi } from '../services/betaseries-api';
import type { BetaSeriesFriend, BetaSeriesShow, BetaSeriesMovie } from '../services/betaseries-api';

const route = useRoute();
const router = useRouter();

const friend = ref<BetaSeriesFriend | null>(null);
const friendShows = ref<BetaSeriesShow[]>([]);
const friendMovies = ref<BetaSeriesMovie[]>([]);
const friendTimeline = ref<unknown[]>([]);
const friendMemberInfos = ref<Record<string, unknown>>({});

const isLoading = ref(true);
const friendShowsLoading = ref(false);
const friendMoviesLoading = ref(false);
const friendTimelineLoading = ref(false);
const error = ref<string | null>(null);

const activeTab = ref('shows');

const friendId = computed(() => route.params.id as string);

const getShowImage = (showId: string) => {
  return showsApi.getShowImage(showId, 300, 400);
};

const getMovieImage = (movieId: string) => {
  return moviesApi.getMovieImage(movieId, 300, 400);
};

const getShowProgress = (show: BetaSeriesShow) => {
  const total = typeof show.episodes === 'string' ? parseInt(show.episodes) : show.episodes || 0;
  if (total === 0) return 'Série en cours';

  let watched = 0;

  if (show.user?.watched !== undefined) {
    watched = show.user.watched;
  }
  if (watched === 0 && show.user?.remaining !== undefined && total > 0) {
    const lastEpisode = show.user.last_watched as string;
    if (lastEpisode && lastEpisode !== 'S00E00') {
      const episodeMatch = lastEpisode.match(/S\d+E(\d+)/);
      if (episodeMatch && episodeMatch[1]) {
        const lastEpisodeNumber = parseInt(episodeMatch[1]);
        watched = Math.min(lastEpisodeNumber, total);
      } else {
        watched = total - show.user.remaining;
      }
    }
  }
  if (watched === 0 && show.userVisited?.remaining !== undefined && total > 0) {
    const lastEpisode = show.userVisited.last;
    if (lastEpisode && lastEpisode !== 'S00E00') {
      const episodeMatch = lastEpisode.match(/S\d+E(\d+)/);
      if (episodeMatch && episodeMatch[1]) {
        const lastEpisodeNumber = parseInt(episodeMatch[1]);
        watched = Math.min(lastEpisodeNumber, total);
      } else {
        watched = total - show.userVisited.remaining;
      }
    } else {
      watched = total - show.userVisited.remaining;
    }
  }
  if (watched === 0 && friendTimeline.value.length > 0) {
    const watchedEpisodes = friendTimeline.value.filter((event) => {
      const eventData = event as { show?: { id: string }; type?: string };
      return eventData.show?.id === show.id && eventData.type === 'episode';
    }).length;
    watched = watchedEpisodes;
  }
  if (
    watched === 0 &&
    friendMemberInfos.value.member &&
    typeof friendMemberInfos.value.member === 'object' &&
    friendMemberInfos.value.member !== null &&
    'stats' in friendMemberInfos.value.member
  ) {
    const stats = friendMemberInfos.value.member.stats as Record<string, unknown>;
    const totalEpisodes = stats.episodes as number;
    const totalShows = stats.shows as number;

    if (totalEpisodes > 0 && totalShows > 0) {
      const avgEpisodesPerShow = totalEpisodes / totalShows;

      if (total <= avgEpisodesPerShow) {
        watched = total;
      } else {
        watched = Math.min(Math.round(avgEpisodesPerShow), total);
      }
    }
  }

  if (watched > 0) {
    const percentage = Math.round((watched / total) * 100);
    return `${watched}/${total} épisodes (${percentage}%)`;
  }
  return `Progression non disponible`;
};

const goToShow = (showId: string) => {
  void router.push(`/show/${showId}`);
};

const goToMovie = (movieId: string) => {
  void router.push(`/movie/${movieId}`);
};

const loadFriendInfo = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await friendsApi.getMemberInfo(friendId.value);
    friend.value = response.member as BetaSeriesFriend;
  } catch (err) {
    console.error('Erreur lors du chargement des infos ami:', err);
    error.value = 'Impossible de charger les informations de cet ami';
  } finally {
    isLoading.value = false;
  }
};

const loadFriendShows = async () => {
  if (!friendId.value) return;

  try {
    friendShowsLoading.value = true;

    const response = await friendsApi.getPublicMemberShows(friendId.value, {
      summary: false,
      limit: 100,
      order: 'progression',
    });

    friendShows.value = response.shows || [];
  } catch (err) {
    console.warn('Séries non disponibles pour cet ami (erreur API):', err);
    friendShows.value = [];
  } finally {
    friendShowsLoading.value = false;
  }
};

const loadFriendMovies = async () => {
  if (!friendId.value) return;

  try {
    friendMoviesLoading.value = true;
    const response = await friendsApi.getPublicMemberMovies(friendId.value, {
      state: '1',
      limit: 100,
    });
    friendMovies.value = response.movies || [];
  } catch (err) {
    console.warn('Films non disponibles pour cet ami (erreur API):', err);
    friendMovies.value = [];
  } finally {
    friendMoviesLoading.value = false;
  }
};

const loadFriendTimeline = async () => {
  if (!friendId.value) return;

  try {
    friendTimelineLoading.value = true;

    const response = await friendsApi.getPublicMemberTimeline(friendId.value, {
      nbpp: 200,
      types: 'episode,show,movie',
    });

    friendTimeline.value = (response.timeline as unknown[]) || [];
  } catch (err) {
    console.warn('Timeline non disponible pour cet ami (erreur API):', err);
    friendTimeline.value = [];
  } finally {
    friendTimelineLoading.value = false;
  }
};

const loadFriendMemberInfos = async () => {
  if (!friendId.value) return;

  try {
    const response = await friendsApi.getPublicMemberInfos(friendId.value);
    friendMemberInfos.value = response;
  } catch (error) {
    console.warn('Infos membre non disponibles (erreur API):', error);
    friendMemberInfos.value = {};
  }
};

onMounted(async () => {
  await loadFriendInfo();
  if (friend.value) {
    await Promise.all([
      loadFriendShows(),
      loadFriendMovies(),
      loadFriendTimeline(),
      loadFriendMemberInfos(),
    ]);
  }
});
</script>

<style lang="scss" scoped>
.profile-page {
  background: transparent;
  min-height: 100vh;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.profile-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
}

.profile-header {
  position: relative;
  margin-bottom: 2rem;
}

.profile-banner {
  height: 200px;
  background: transparent;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 16px 16px 0 0;
  position: relative;
  overflow: hidden;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.profile-content {
  background: white;
  border-radius: 0 0 16px 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.profile-avatar-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: -70px;
  position: relative;
  z-index: 2;
}

.profile-avatar {
  border: 4px solid white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1rem 0;
}

.profile-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border-radius: 25px;
  font-weight: 600;
  color: #495057;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #dee2e6;
  }
}

.profile-main {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.profile-tabs {
  margin-bottom: 1rem;

  :deep(.q-tab) {
    padding: 1rem 2rem;
    font-weight: 600;
    font-size: 1.1rem;
    border-radius: 12px 12px 0 0;
    transition: all 0.3s ease;

    &:hover {
      background: transparent;
    }

    &.q-tab--active {
      background: transparent;
      color: #495057;
      border-bottom: 2px solid #495057;
    }
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f2f5;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.section-count {
  background: transparent;
  color: #495057;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  border: 1px solid #e9ecef;
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: transparent;
  border-radius: 16px;
  border: 2px dashed #dee2e6;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}

.content-item {
  position: relative;
}

.show-card,
.movie-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  background: white;

  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  }
}

.show-poster,
.movie-poster {
  height: 400px;
  object-fit: cover;
  transition: all 0.4s ease;
}

.card-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
  padding: 2rem;
  transform: translateY(100%);
  transition: all 0.4s ease;
}

.show-card:hover .card-overlay,
.movie-card:hover .card-overlay {
  transform: translateY(0);
}

.show-card:hover .show-poster,
.movie-card:hover .movie-poster {
  transform: scale(1.1);
}

.card-content {
  color: white;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.card-progress,
.card-year {
  font-size: 0.9rem;
  opacity: 0.9;
  font-weight: 500;
}

.tab-panels {
  min-height: 400px;
}

@media (max-width: 768px) {
  .profile-avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .profile-name {
    font-size: 2rem;
  }

  .profile-stats {
    justify-content: center;
    gap: 1rem;
  }

  .stat-item {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .content-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .profile-content,
  .profile-main {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .profile-stats {
    flex-direction: column;
    align-items: center;
  }

  .profile-name {
    font-size: 1.8rem;
  }
}
</style>
