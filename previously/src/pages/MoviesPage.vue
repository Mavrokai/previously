<template>
  <q-page class="bg-grey-1">
    <div class="q-pa-xl">
      <div class="text-center q-mb-xl">
        <q-icon name="movie" size="4rem" color="primary" class="q-mb-md" />
        <div class="text-h3 text-weight-bold text-primary q-mb-sm">Films</div>
        <div class="text-subtitle1 text-grey-7">Découvrez vos films préférés</div>
      </div>

      <div class="row justify-center q-mb-xl">
        <div class="col-12 col-md-8 col-lg-6">
          <q-input
            v-model="searchQuery"
            placeholder="Rechercher un film..."
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

      <div v-if="isLoading || isLoadingGenres" class="text-center q-py-xl">
        <q-spinner-dots size="3rem" color="primary" />
        <div class="text-h6 text-grey-7 q-mt-md">
          {{ isLoading ? 'Chargement des films...' : 'Chargement des genres...' }}
        </div>
      </div>

      <div v-else-if="movies.length > 0 && !isLoadingGenres" class="row q-gutter-md justify-center">
        <div
          v-for="movie in movies"
          :key="movie.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2"
          v-memo="[movie.id, movie.title, movie.poster, movie.followers, movie.genres]"
        >
          <ContentCard
            :title="movie.title"
            v-bind="{
              ...(movie.poster && { image: movie.poster }),
              ...(movie.notes?.mean && { rating: movie.notes.mean }),
              ...(getMainGenre(movie.genres) && { genre: getMainGenre(movie.genres) }),
              ...(!getMainGenre(movie.genres) && { genre: 'Film' }),
              id: movie.id,
              type: 'movie',
            }"
            icon="movie"
          />
        </div>
      </div>

      <div v-else-if="!isLoading && !isLoadingGenres" class="text-center q-py-xl">
        <q-icon name="search_off" size="4rem" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-7">
          {{ searchQuery ? 'Aucun film trouvé' : 'Aucun film disponible' }}
        </div>
        <div v-if="searchQuery" class="text-body2 text-grey-6 q-mt-sm">
          Essayez avec d'autres mots-clés
        </div>
      </div>

      <div v-if="movies.length > 0 && hasMore && !isLoadingGenres" class="text-center q-mt-xl">
        <q-btn
          label="Charger plus"
          color="primary"
          outline
          @click="loadMore"
          :loading="isLoadingMore"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  moviesApi,
  type BetaSeriesMovie,
  type MovieSearchParams,
} from '../services/betaseries-api';
import ContentCard from '../components/ContentCard.vue';

const movies = ref<BetaSeriesMovie[]>([]);
const searchQuery = ref('');
const isLoading = ref(false);
const isLoadingMore = ref(false);
const hasMore = ref(true);
const currentOffset = ref(0);
const loadingGenres = ref(new Set<string>());
const isLoadingGenres = ref(false);

const loadMovies = async (start = 0, append = false) => {
  try {
    if (append) {
      isLoadingMore.value = true;
    } else {
      isLoading.value = true;
    }

    let response;

    if (searchQuery.value) {
      const searchParams: MovieSearchParams = {
        title: searchQuery.value,
        order: 'title',
        nbpp: 20,
        page: Math.floor(start / 20) + 1,
        locale: 'fr',
      };
      response = await moviesApi.search(searchParams);
    } else {
      const searchParams: MovieSearchParams = {
        title: 'the',
        order: 'popularity',
        nbpp: 20,
        page: Math.floor(start / 20) + 1,
        locale: 'fr',
      };
      response = await moviesApi.search(searchParams);
    }

    if (append) {
      movies.value.push(...response.movies);
    } else {
      movies.value = response.movies;
    }

    void loadGenresForMovies(response.movies);

    hasMore.value = response.movies.length === 20;
    currentOffset.value = start;
  } catch (error) {
    console.error('Erreur lors du chargement des films:', error);
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
};

let searchTimeout: NodeJS.Timeout | null = null;

const onSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    currentOffset.value = 0;
    void loadMovies(0, false);
  }, 300);
};

const onClearSearch = () => {
  searchQuery.value = '';
  currentOffset.value = 0;
  void loadMovies(0, false);
};

const loadMore = () => {
  void loadMovies(currentOffset.value + 20, true);
};

const getMainGenre = (genres?: string[] | Record<string, string>): string => {
  if (!genres) return '';

  let genresArray: string[];
  if (typeof genres === 'object' && !Array.isArray(genres)) {
    genresArray = Object.values(genres);
  } else if (Array.isArray(genres)) {
    genresArray = genres;
  } else {
    return '';
  }

  if (genresArray.length === 0) return '';

  return genresArray[0] || '';
};

const loadGenresForMovies = async (moviesToLoad: BetaSeriesMovie[]) => {
  isLoadingGenres.value = true;

  const moviesNeedingGenres = moviesToLoad.filter(
    (movie) => !loadingGenres.value.has(movie.id) && !movie.genres,
  );

  const batchSize = 5;
  for (let i = 0; i < moviesNeedingGenres.length; i += batchSize) {
    const batch = moviesNeedingGenres.slice(i, i + batchSize);

    const promises = batch.map(async (movie) => {
      loadingGenres.value.add(movie.id);

      try {
        const details = await moviesApi.getMovieDetails(movie.id);
        const movieIndex = movies.value.findIndex((m) => m.id === movie.id);
        if (movieIndex !== -1) {
          if (details.movie.genres && details.movie.genres.length > 0) {
            movies.value[movieIndex]!.genres = details.movie.genres;
          }

          if (details.movie.notes) {
            movies.value[movieIndex]!.notes = details.movie.notes;
          }
        }
      } catch (error) {
        console.error(`Erreur lors du chargement des genres pour ${movie.title}:`, error);
      } finally {
        loadingGenres.value.delete(movie.id);
      }
    });

    await Promise.all(promises);

    if (i + batchSize < moviesNeedingGenres.length) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  isLoadingGenres.value = false;
};

onMounted(() => {
  void loadMovies(0);
});
</script>

<script lang="ts">
export default {
  name: 'MoviesPage',
};
</script>
