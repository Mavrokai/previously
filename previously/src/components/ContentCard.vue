<template>
  <q-card class="content-card" elevated>
    <div class="card-image-container">
      <img
        v-if="image"
        :src="image"
        :alt="title"
        class="card-image"
        @error="onImageError"
        loading="lazy"
        decoding="async"
      />
      <div v-else class="card-image-placeholder">
        <q-icon :name="icon" size="3rem" color="grey-5" />
      </div>

      <div v-if="rating" class="rating-badge">
        <q-icon name="star" size="sm" color="amber" />
        <span class="rating-text">{{ rating.toFixed(1) }}</span>
      </div>
    </div>

    <q-card-section class="q-pa-md">
      <div class="text-h6 text-weight-bold q-mb-xs text-primary">
        {{ title }}
      </div>

      <div v-if="genre && genre.trim()" class="text-caption text-grey-7 q-mb-sm">
        <q-icon name="category" size="xs" class="q-mr-xs" />
        {{ genre }}
      </div>

      <div v-if="description" class="text-body2 text-grey-8 description">
        {{ description }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title: string;
  image?: string | undefined;
  rating?: number | undefined;
  genre?: string | undefined;
  description?: string | undefined;
  icon?: string | undefined;
}

withDefaults(defineProps<Props>(), {
  icon: 'movie',
});

const imageError = ref(false);

const onImageError = () => {
  imageError.value = true;
};
</script>

<script lang="ts">
export default {
  name: 'ContentCard',
};
</script>

<style lang="scss" scoped>
.content-card {
  border-radius: 12px;
  background: white;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

.card-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.rating-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.rating-text {
  color: white;
}

.description {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
</style>
