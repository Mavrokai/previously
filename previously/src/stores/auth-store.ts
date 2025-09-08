import axios from 'axios';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

const BETA_SERIES_CONFIG = {
  clientId: import.meta.env.VITE_BETASERIES_CLIENT_ID,
  clientSecret: import.meta.env.VITE_BETASERIES_CLIENT_SECRET,
  redirectUri: import.meta.env.VITE_BETASERIES_REDIRECT_URI,
  authUrl: import.meta.env.VITE_BETASERIES_AUTH_URL,
  tokenUrl: import.meta.env.VITE_BETASERIES_TOKEN_URL,
};

export interface AuthState {
  token: string | null;
  user: BetaSeriesUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface BetaSeriesUser {
  id: number;
  login: string;
  email?: string;
  avatar?: string;
  profile_banner?: string;
  stats?: {
    shows: number;
    episodes: number;
    movies: number;
  };
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('betaseries_token'));
  const user = ref<BetaSeriesUser | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  const initializeAuth = async () => {
    if (token.value) {
      await fetchUserInfo();
    }
  };

  const initiateOAuthLogin = () => {
    const authUrl = new URL(BETA_SERIES_CONFIG.authUrl);
    authUrl.searchParams.append('client_id', BETA_SERIES_CONFIG.clientId);
    authUrl.searchParams.append('redirect_uri', BETA_SERIES_CONFIG.redirectUri);

    window.location.href = authUrl.toString();
  };

  const handleOAuthCallback = async (code: string) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await axios.post(
        BETA_SERIES_CONFIG.tokenUrl,
        {
          client_id: BETA_SERIES_CONFIG.clientId,
          client_secret: BETA_SERIES_CONFIG.clientSecret,
          redirect_uri: BETA_SERIES_CONFIG.redirectUri,
          code: code,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const responseData = response.data;
      if (responseData.access_token) {
        token.value = responseData.access_token;
        localStorage.setItem('betaseries_token', responseData.access_token);

        await fetchUserInfo();

        window.history.replaceState({}, document.title, '/');
      } else {
        throw new Error("Token d'accès non reçu");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la connexion';
      const apiError = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      error.value = apiError || errorMessage;
      console.error('Erreur OAuth:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUserInfo = async () => {
    if (!token.value) return;

    try {
      const response = await axios.get('https://api.betaseries.com/members/infos', {
        headers: {
          'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
          Authorization: `Bearer ${token.value}`,
        },
      });

      user.value = response.data.member;
    } catch (err) {
      console.error('Erreur lors de la récupération des informations utilisateur:', err);
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('betaseries_token');
    error.value = null;
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    token,
    user,
    isLoading,
    error,

    isAuthenticated,

    initiateOAuthLogin,
    handleOAuthCallback,
    fetchUserInfo,
    logout,
    clearError,
    initializeAuth,
  };
});
