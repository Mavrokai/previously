<template>
  <q-card class="profile-card" elevated> </q-card>
</template>

<script setup lang="ts">
import type { BetaSeriesUser } from '../stores/auth-store';

interface Props {
  user: BetaSeriesUser | null;
}

defineProps<Props>();
</script>

<script lang="ts">
export default {
  name: 'UserProfile',
};
</script>

<style lang="scss" scoped>
.profile-card {
  border-radius: 16px;
  background: white;
  max-width: 500px;
  margin: 0 auto;
}
</style>
