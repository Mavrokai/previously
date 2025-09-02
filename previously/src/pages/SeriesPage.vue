<template>
  <q-page class="bg-grey-1">
    <div class="q-pa-xl">
      <div class="text-center q-mb-xl">
        <q-icon name="tv" size="4rem" color="primary" class="q-mb-md" />
        <div class="text-h3 text-weight-bold text-primary q-mb-sm">Séries</div>
        <div class="text-subtitle1 text-grey-7">Découvrez vos séries préférées</div>
      </div>

      <div class="row justify-center q-mb-xl">
        <div class="col-12 col-md-8 col-lg-6">
          <q-input
            v-model="searchQuery"
            placeholder="Rechercher une série..."
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
          {{ isLoading ? 'Chargement des séries...' : 'Chargement des genres...' }}
        </div>
      </div>

      <div v-else-if="shows.length > 0 && !isLoadingGenres" class="row q-gutter-md justify-center">
        <div
          v-for="show in shows"
          :key="show.id"
          class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2"
          v-memo="[
            show.id,
            show.title,
            show.poster,
            show.images?.poster,
            show.following,
            show.followers,
            show.genres,
          ]"
        >
          <ContentCard
            :title="show.title"
            :image="show.poster || show.images?.poster || undefined"
            :rating="show.notes?.mean || undefined"
            :genre="getMainGenre(show.genres) || 'Série'"
            icon="tv"
          />
        </div>
      </div>

      <div v-else-if="!isLoading && !isLoadingGenres" class="text-center q-py-xl">
        <q-icon name="search_off" size="4rem" color="grey-5" class="q-mb-md" />
        <div class="text-h6 text-grey-7">
          {{ searchQuery ? 'Aucune série trouvée' : 'Aucune série disponible' }}
        </div>
        <div v-if="searchQuery" class="text-body2 text-grey-6 q-mt-sm">
          Essayez avec d'autres mots-clés
        </div>
      </div>

      <div v-if="shows.length > 0 && hasMore && !isLoadingGenres" class="text-center q-mt-xl">
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
import { showsApi, type BetaSeriesShow } from '../services/betaseries-api';
import ContentCard from '../components/ContentCard.vue';

const shows = ref<BetaSeriesShow[]>([]);
const searchQuery = ref('');
const isLoading = ref(false);
const isLoadingMore = ref(false);
const hasMore = ref(true);
const currentOffset = ref(0);
const loadingGenres = ref(new Set<string>());
const isLoadingGenres = ref(false);

const loadShows = async (offset = 0, append = false) => {
  try {
    if (append) {
      isLoadingMore.value = true;
    } else {
      isLoading.value = true;
    }

    let response;

    if (searchQuery.value) {
      response = await showsApi.search({
        text: searchQuery.value,
        offset,
        limit: 20,
      });
    } else {
      response = await showsApi.search({
        text: 'the',
        offset,
        limit: 20,
      });
    }

    if (append) {
      shows.value.push(...response.shows);
    } else {
      shows.value = response.shows;
    }

    void loadGenresForShows(response.shows);

    hasMore.value = response.shows.length === 20;
    currentOffset.value = offset;
  } catch (error) {
    console.error('Erreur lors du chargement des séries:', error);
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
    void loadShows(0, false);
  }, 300);
};

const onClearSearch = () => {
  searchQuery.value = '';
  currentOffset.value = 0;
  void loadShows(0, false);
};

const loadMore = () => {
  void loadShows(currentOffset.value + 20, true);
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

  const priorityOrder = [
    'Science-fiction',
    'Fantastique',
    'Horreur',
    'Thriller',
    'Mystère',
    'Crime',
    'Action',
    'Comédie',
    'Romance',
    'Drame',
    'Animation',
    'Mini-série',
    'Documentaire',
    'Reality',
    'Talk-show',
  ];

  for (const priorityGenre of priorityOrder) {
    if (genresArray.includes(priorityGenre)) {
      return priorityGenre;
    }
  }

  return genresArray[0] || '';
};

const loadGenresForShows = async (showsToLoad: BetaSeriesShow[]) => {
  isLoadingGenres.value = true;

  const showsNeedingGenres = showsToLoad.filter(
    (show) => !loadingGenres.value.has(show.id) && !show.genres,
  );

  const batchSize = 5;
  for (let i = 0; i < showsNeedingGenres.length; i += batchSize) {
    const batch = showsNeedingGenres.slice(i, i + batchSize);

    const promises = batch.map(async (show) => {
      loadingGenres.value.add(show.id);

      try {
        const details = await showsApi.getShowDetails(show.id);
        const showIndex = shows.value.findIndex((s) => s.id === show.id);
        if (showIndex !== -1) {
          if (details.show.genres && typeof details.show.genres === 'object') {
            const genresArray = Object.values(details.show.genres);
            if (genresArray.length > 0) {
              shows.value[showIndex]!.genres = genresArray;
            }
          }

          if (details.show.notes) {
            shows.value[showIndex]!.notes = details.show.notes;
          }
        }
      } catch (error) {
        console.error(`Erreur lors du chargement des genres pour ${show.title}:`, error);
      } finally {
        loadingGenres.value.delete(show.id);
      }
    });

    await Promise.all(promises);

    if (i + batchSize < showsNeedingGenres.length) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  isLoadingGenres.value = false;
};

onMounted(() => {
  void loadShows();
});
</script>

<script lang="ts">
export default {
  name: 'SeriesPage',
};
</script>
