<template>
  <q-page class="bg-grey-1">
    <div v-if="isLoading" class="text-center q-py-xl">
      <q-spinner-dots size="3rem" color="primary" />
      <div class="text-h6 text-grey-7 q-mt-md">Chargement du film...</div>
    </div>

    <div v-else-if="movie" class="page-wrapper">
      <div v-if="movie.backdrop" class="movie-banner">
        <div class="banner-backdrop" :style="{ backgroundImage: `url(${movie.backdrop})` }"></div>
        <div class="banner-overlay"></div>
        <div class="banner-content">
          <div class="back-button-container">
            <q-btn
              flat
              icon="arrow_back"
              label="Revenir aux Films"
              color="white"
              @click="$router.push('/movies')"
              class="text-weight-medium back-button"
            />
          </div>

          <div class="banner-movie-info">
            <div class="banner-poster-container">
              <img
                v-if="movie.poster"
                :src="movie.poster"
                :alt="movie.title"
                class="banner-poster"
                @error="onImageError"
              />
            </div>
            <div class="banner-text-content">
              <h1 class="banner-title">{{ movie.title }}</h1>
              <div v-if="movie.production_year" class="banner-year">
                ({{ movie.production_year }})
              </div>
              <div v-if="movie.notes?.mean" class="banner-rating">
                <q-icon name="star" size="1.2rem" color="amber" />
                <span class="rating-text">{{ movie.notes.mean.toFixed(1) }}/10</span>
                <span class="rating-count">({{ movie.notes.total }} avis)</span>
              </div>

              <div v-if="movie.genres && movie.genres.length > 0" class="banner-genres">
                <div
                  v-for="genre in movie.genres"
                  :key="genre"
                  :class="`genre-chip genre-${getGenreClass(genre)}`"
                >
                  {{ genre }}
                </div>
              </div>

              <div v-if="movie.length || movie.language" class="banner-details">
                <div v-if="movie.length" class="banner-detail-item">
                  <q-icon
                    name="schedule"
                    size="1rem"
                    color="rgba(255, 255, 255, 0.9)"
                    class="q-mr-xs"
                  />
                  <span class="banner-detail-label">Durée :</span>
                  <span class="banner-detail-value">{{ formatDuration(movie.length) }}</span>
                </div>

                <div v-if="movie.language" class="banner-detail-item">
                  <q-icon
                    name="language"
                    size="1rem"
                    color="rgba(255, 255, 255, 0.9)"
                    class="q-mr-xs"
                  />
                  <span class="banner-detail-label">Langue :</span>
                  <span class="banner-detail-value">{{ movie.language }}</span>
                </div>
              </div>

              <div class="banner-actions">
                <q-btn
                  :loading="markingMovieAsWatched"
                  :color="isMovieWatched ? 'green' : 'white'"
                  :text-color="isMovieWatched ? 'white' : 'primary'"
                  :icon="isMovieWatched ? 'check_circle' : 'done'"
                  :label="isMovieWatched ? 'Film vu' : 'Marquer le film comme vu'"
                  @click="toggleMovieWatched"
                  class="banner-mark-movie-btn"
                  :class="{ 'movie-watched': isMovieWatched }"
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
          label="Revenir aux Films"
          color="primary"
          @click="$router.push('/movies')"
          class="text-weight-medium back-button"
        />
      </div>

      <div v-if="!movie.backdrop" class="movie-info-header">
        <div class="movie-info-header-content">
          <div class="movie-poster-section">
            <img
              v-if="movie.poster"
              :src="movie.poster"
              :alt="movie.title"
              class="movie-poster-large"
              @error="onImageError"
            />
          </div>
          <div class="movie-info-text">
            <h1 class="movie-title">{{ movie.title }}</h1>
            <div v-if="movie.production_year" class="movie-year">({{ movie.production_year }})</div>
            <div v-if="movie.notes?.mean" class="movie-rating">
              <q-icon name="star" size="1.2rem" color="amber" />
              <span class="rating-text">{{ movie.notes.mean.toFixed(1) }}/10</span>
              <span class="rating-count">({{ movie.notes.total }} avis)</span>
            </div>

            <div v-if="movie.genres && movie.genres.length > 0" class="movie-genres">
              <div
                v-for="genre in movie.genres"
                :key="genre"
                :class="`genre-chip genre-${getGenreClass(genre)}`"
              >
                {{ genre }}
              </div>
            </div>

            <div v-if="movie.length || movie.language" class="movie-details-row">
              <div v-if="movie.length" class="detail-item">
                <q-icon name="schedule" color="primary" class="q-mr-sm" />
                <span class="text-weight-medium">Durée :</span>
                <span class="q-ml-sm">{{ formatDuration(movie.length) }}</span>
              </div>

              <div v-if="movie.language" class="detail-item">
                <q-icon name="language" color="primary" class="q-mr-sm" />
                <span class="text-weight-medium">Langue :</span>
                <span class="q-ml-sm">{{ movie.language }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="movie.synopsis" class="synopsis-container">
        <div class="text-h5 text-weight-bold text-primary q-mb-md">Description / Résumé</div>
        <div class="text-body1 text-grey-8 synopsis-text">
          {{ movie.synopsis }}
        </div>

        <div v-if="movie.trailer" class="trailer-video q-mt-lg">
          <iframe
            :src="`https://www.youtube.com/embed/${movie.trailer}?rel=0&modestbranding=1&fs=1&disablekb=1&iv_load_policy=3&cc_load_policy=0`"
            title="Bande annonce"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="trailer-iframe"
            loading="lazy"
          ></iframe>
        </div>
      </div>

      <div class="movie-detail-container">
        <div class="movie-info-section">
          <div class="movie-info">
            <div v-if="movie.cast" class="q-mb-md">
              <div class="text-h6 text-weight-bold text-primary q-mb-sm">Casting</div>
              <div class="text-body1 text-grey-8">
                {{ movie.cast }}
              </div>
            </div>

            <div v-if="movie.svods && movie.svods.length > 0" class="q-mb-md">
              <div class="text-h6 text-weight-bold text-primary q-mb-sm">Disponible sur</div>
              <div class="streaming-platforms">
                <q-chip
                  v-for="svod in movie.svods"
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
      <div class="text-h6 text-grey-7">Film non trouvé</div>
    </div>

    <!-- Popup de connexion -->
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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { moviesApi, memberApi, type BetaSeriesMovie } from '../services/betaseries-api';
import { useAuthStore } from '../stores/auth-store';

const route = useRoute();
const authStore = useAuthStore();

const movie = ref<BetaSeriesMovie | null>(null);
const isLoading = ref(false);
const imageError = ref(false);
const markingMovieAsWatched = ref(false);
const isMovieWatched = ref(false);
const showLoginDialog = ref(false);

const loadMovieDetails = async () => {
  const movieId = route.params.id as string;
  if (!movieId) {
    window.location.href = '/movies';
    return;
  }

  try {
    isLoading.value = true;
    const response = await moviesApi.getMovieDetails(movieId);
    movie.value = response.movie;

    if (authStore.isAuthenticated) {
      await checkMovieWatchedStatus();
    }
  } catch (error) {
    console.error('Erreur lors du chargement du film:', error);
    movie.value = null;
  } finally {
    isLoading.value = false;
  }
};

const checkMovieWatchedStatus = async () => {
  if (!authStore || !authStore.token || !movie.value) return;

  try {
    const response = await moviesApi.getMemberMovies(authStore.token, {
      state: '1',
      limit: 1000,
    });

    isMovieWatched.value = response.movies.some((m: BetaSeriesMovie) => m.id === movie.value?.id);
  } catch (error) {
    console.error('Erreur lors de la vérification du statut du film:', error);
  }
};

const toggleMovieWatched = async () => {
  if (!authStore.isAuthenticated) {
    showLoginDialog.value = true;
    return;
  }

  if (!movie.value) {
    console.error('Film non chargé');
    return;
  }

  markingMovieAsWatched.value = true;

  try {
    if (isMovieWatched.value) {
      await memberApi.markMovieAsUnwatched(authStore.token!, movie.value.id);
      isMovieWatched.value = false;
    } else {
      await memberApi.markMovieAsWatched(authStore.token!, movie.value.id);
      isMovieWatched.value = true;
    }
  } catch (error) {
    console.error('Erreur lors du marquage du film:', error);
  } finally {
    markingMovieAsWatched.value = false;
  }
};

const formatDuration = (duration: number): string => {
  const totalMinutes = Math.floor(duration / 60);

  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}min`;
  }
  return `${totalMinutes}min`;
};

const onImageError = () => {
  imageError.value = true;
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
  };

  return genreMap[genre] || 'default';
};

const goToLogin = () => {
  showLoginDialog.value = false;

  localStorage.setItem('redirect_after_login', route.fullPath);

  authStore.initiateOAuthLogin();
};

onMounted(() => {
  void loadMovieDetails();
});
</script>

<script lang="ts">
export default {
  name: 'MovieDetailPage',
};
</script>

<style lang="scss" scoped>
.page-wrapper {
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.movie-banner {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  margin-bottom: 40px;
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
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.6) 30%,
    rgba(0, 0, 0, 0.3) 60%,
    rgba(0, 0, 0, 0.7) 100%
  );
}

.banner-content {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.banner-movie-info {
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
}

.banner-mark-movie-btn {
  font-weight: 600;
  border-radius: 8px;
  padding: 12px 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  touch-action: manipulation;
  will-change: transform, box-shadow;
}

.banner-mark-movie-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.banner-mark-movie-btn.movie-watched {
  background-color: #4caf50 !important;
  color: white !important;
}

.banner-mark-movie-btn.movie-watched:hover {
  background-color: #45a049 !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
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

.rating-count {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

.back-button-container {
  width: 100%;
  max-width: 1200px;
  padding: 0 20px 20px 20px;
  display: flex;
  justify-content: flex-start;
}

.movie-info-header {
  background: white;
  padding: 30px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.movie-info-header-content {
  display: flex;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  align-items: flex-start;
}

.movie-poster-section {
  flex-shrink: 0;
}

.movie-poster-large {
  width: 200px;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.movie-info-text {
  flex: 1;
  min-width: 0;
}

.movie-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1976d2;
  margin: 0 0 10px 0;
  line-height: 1.2;
}

.movie-year {
  font-size: 1.3rem;
  color: #666;
  margin-bottom: 15px;
}

.movie-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.rating-text {
  font-weight: bold;
  color: #ffc107;
  font-size: 1.2rem;
}

.rating-count {
  color: #666;
  font-size: 1rem;
}

.movie-genres {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.movie-details-row {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.movie-detail-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  padding: 0 20px 40px 20px;
  width: 100%;
  margin: 0 auto;
}

.movie-info-section {
  width: 100%;
}

.movie-info {
  width: 100%;
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

.synopsis-container {
  max-width: 1200px;
  padding: 40px 20px;
  width: 100%;
}

.trailer-video {
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.trailer-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
}

.synopsis-text {
  line-height: 1.7;
  text-align: justify;
  font-size: 1.1rem;
}

.streaming-platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 768px) {
  .movie-banner {
    height: 350px;
  }

  .banner-movie-info {
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

  .movie-info-header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 20px;
  }

  .movie-poster-large {
    width: 150px;
    height: 225px;
  }

  .movie-title {
    font-size: 2rem;
  }

  .movie-details-row {
    gap: 20px;
    justify-content: center;
  }
}

.login-dialog-card {
  min-width: 400px;
  max-width: 500px;
  border-radius: 16px;
}
</style>
