<template>
  <q-page class="bg-grey-1">
    <div v-if="isLoading" class="text-center q-py-xl">
      <q-spinner-dots size="3rem" color="primary" />
      <div class="text-h6 text-grey-7 q-mt-md">Chargement du film...</div>
    </div>

    <div v-else-if="movie" class="page-wrapper">
      <div class="movie-detail-container">
        <div class="movie-poster-section">
          <div class="movie-poster-container">
            <img
              v-if="movie.poster"
              :src="movie.poster"
              :alt="movie.title"
              class="movie-poster"
              @error="onImageError"
            />
            <img
              v-else-if="movie.id"
              :src="getMovieImageUrl(movie.id)"
              :alt="movie.title"
              class="movie-poster"
              @error="onImageError"
            />
            <div v-else class="movie-poster-placeholder">
              <q-icon name="movie" size="4rem" color="grey-5" />
            </div>
          </div>
        </div>

        <div class="movie-info-section">
          <div class="movie-info">
            <div class="text-h3 text-weight-bold text-primary q-mb-md">
              {{ movie.title }}
              <span v-if="movie.production_year" class="text-h5 text-grey-6 q-ml-sm">
                ({{ movie.production_year }})
              </span>
            </div>

            <div v-if="movie.notes?.mean" class="q-mb-md">
              <div class="rating-container">
                <q-icon name="star" size="1.5rem" color="amber" />
                <span class="text-h6 text-weight-bold q-ml-sm">
                  {{ movie.notes.mean.toFixed(1) }}
                </span>
                <span class="text-body2 text-grey-6 q-ml-sm"> ({{ movie.notes.total }} avis) </span>
              </div>
            </div>

            <div v-if="movie.description" class="q-mb-md">
              <div class="text-h6 text-weight-bold text-primary q-mb-sm">Synopsis</div>
              <div class="text-body1 text-grey-8 description-text">
                {{ movie.description }}
              </div>
            </div>

            <div v-if="movie.length" class="q-mb-md">
              <div class="detail-item">
                <q-icon name="schedule" color="primary" class="q-mr-sm" />
                <span class="text-weight-medium">Durée :</span>
                <span class="q-ml-sm">{{ formatDuration(movie.length) }}</span>
              </div>
            </div>

            <div v-if="movie.genres && movie.genres.length > 0" class="q-mb-md">
              <div class="text-h6 text-weight-bold text-primary q-mb-sm">Genres</div>
              <div class="genres-container">
                <q-chip
                  v-for="genre in movie.genres"
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

            <div v-if="movie.director" class="q-mb-md">
              <div class="detail-item">
                <q-icon name="person" color="primary" class="q-mr-sm" />
                <span class="text-weight-medium">Réalisateur :</span>
                <span class="q-ml-sm">{{ movie.director }}</span>
              </div>
            </div>

            <div v-if="movie.language" class="q-mb-md">
              <div class="detail-item">
                <q-icon name="language" color="primary" class="q-mr-sm" />
                <span class="text-weight-medium">Langue :</span>
                <span class="q-ml-sm">{{ movie.language }}</span>
              </div>
            </div>

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
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { moviesApi, type BetaSeriesMovie } from '../services/betaseries-api';

const route = useRoute();
const router = useRouter();

const movie = ref<BetaSeriesMovie | null>(null);
const isLoading = ref(false);
const imageError = ref(false);

const loadMovieDetails = async () => {
  const movieId = route.params.id as string;
  if (!movieId) {
    void router.push('/movies');
    return;
  }

  try {
    isLoading.value = true;
    const response = await moviesApi.getMovieDetails(movieId);
    movie.value = response.movie;
  } catch (error) {
    console.error('Erreur lors du chargement du film:', error);
    movie.value = null;
  } finally {
    isLoading.value = false;
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

const getMovieImageUrl = (movieId: string): string => {
  return moviesApi.getMovieImage(movieId, 400, 600);
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
  padding: 80px 0 40px 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.movie-poster-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.movie-detail-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  padding: 20px;
  width: auto;
}

@media (min-width: 768px) {
  .movie-detail-container {
    flex-direction: row;
    align-items: flex-start;
    gap: 32px;
  }
}

.movie-poster-section {
  flex: 0 0 auto;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .movie-poster-section {
    flex: 0 0 300px;
    margin: 0;
  }
}

.movie-info-section {
  flex: 1;
  min-width: 0;
}

.movie-info {
  padding-left: 0;
}

@media (min-width: 768px) {
  .movie-info {
    padding-left: 0;
  }
}

.movie-poster {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.movie-poster-placeholder {
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

.movie-details {
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

.streaming-platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
