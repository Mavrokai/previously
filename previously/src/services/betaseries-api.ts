import axios from 'axios';

const BETA_SERIES_CONFIG = {
  clientId: import.meta.env.VITE_BETASERIES_CLIENT_ID,
  baseUrl: 'https://api.betaseries.com',
};

export interface BetaSeriesShow {
  id: string;
  title: string;
  poster?: string;
  following?: string;
  followers?: string;
  release_date?: number;
  creation?: string;
  slug?: string;
  alias_title?: string | null;
  aliases?: Record<string, string>;
  images?: {
    poster?: string;
    banner?: string;
    show?: string;
    box?: string;
  };
  genres?: string[] | Record<string, string>;
  svods?: Array<{
    id: number;
    name: string;
  }>;
  notes?: {
    total: number;
    mean: number;
    user: number;
  };

  description?: string;
  length?: number;
  seasons?: number;
  episodes?: number;
  status?: string;
  network?: string;
  country?: string;
  language?: string;

  seasons_details?: Array<{
    number: number;
    episodes: number;
    image?: string;
  }>;
}

export interface BetaSeriesEpisode {
  id: string;
  episode: number;
  season: number;
  title: string;
  date?: number;
  image?: string;
  description?: string;
  length?: number;
  rating?: number;
  show_id?: string;
  thetvdb_id?: string;
  youtube_id?: string;
  global?: number;
  special?: boolean;
  seen?: boolean;
  user?: {
    seen: boolean;
    note?: number;
  };
}

export interface BetaSeriesMovie {
  id: string;
  title: string;
  poster?: string;
  followers?: string;
  production_year?: string;
  tmdb_id?: string;
  imdb_id?: string;
  genres?: string[];
  notes?: {
    total: number;
    mean: number;
    user: number;
  };

  description?: string;
  length?: number;
  director?: string;
  cast?: string;
  country?: string;
  language?: string;
  svods?: Array<{
    id: number;
    name: string;
  }>;
}

export interface SearchParams {
  text?: string;
  limit?: number;
  offset?: number;
  genres?: string;
  tri?: string;
  autres?: string;
}

export interface MovieListParams {
  start?: number;
  limit?: number;
  order?: 'alphabetical' | 'popularity';
  filter?: string;
  platforms?: string;
  country?: string;
  locale?: string;
}

export interface MovieSearchParams {
  title?: string;
  order?: 'title' | 'popularity';
  nbpp?: number;
  page?: number;
  recent?: boolean;
  locale?: string;
}

export const showsApi = {
  async search(params: SearchParams = {}): Promise<{ shows: BetaSeriesShow[] }> {
    const response = await axios.get(`${BETA_SERIES_CONFIG.baseUrl}/search/shows`, {
      params: {
        ...params,
        limit: params.limit || 20,
        offset: params.offset || 0,
        locale: 'fr',
      },
      headers: {
        'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
      },
    });
    return response.data;
  },

  async list(
    params: { start?: number; limit?: number; order?: string } = {},
  ): Promise<{ shows: BetaSeriesShow[] }> {
    const response = await axios.get(`${BETA_SERIES_CONFIG.baseUrl}/shows/list`, {
      params: {
        ...params,
        start: params.start || 0,
        limit: params.limit || 20,
        order: params.order || 'popularity',
        locale: 'fr',
      },
      headers: {
        'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
      },
    });
    return response.data;
  },

  async getGenres(): Promise<{ genres: Record<string, string> }> {
    const response = await axios.get(`${BETA_SERIES_CONFIG.baseUrl}/shows/genres`, {
      headers: {
        'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
      },
    });
    return response.data;
  },

  async getShowDetails(
    id: string,
  ): Promise<{ show: BetaSeriesShow & { genres?: Record<string, string> } }> {
    const response = await axios.get(`${BETA_SERIES_CONFIG.baseUrl}/shows/display`, {
      params: {
        id,
        locale: 'fr',
        summary: false,
      },
      headers: {
        'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
      },
    });
    return response.data;
  },

  getSeasonImage(showId: string, seasonNumber: number, width = 250, height = 375): string {
    return `${BETA_SERIES_CONFIG.baseUrl}/pictures/seasons?show_id=${showId}&season=${seasonNumber}&width=${width}&height=${height}&locale=fr&key=${BETA_SERIES_CONFIG.clientId}`;
  },

  getEpisodeImage(episodeId: string, width?: number, height?: number): string {
    if (!episodeId || episodeId === 'undefined' || episodeId === 'null') {
      return '';
    }
    let url = `${BETA_SERIES_CONFIG.baseUrl}/pictures/episodes?id=${episodeId}&locale=fr&key=${BETA_SERIES_CONFIG.clientId}`;
    if (width) url += `&width=${width}`;
    if (height) url += `&height=${height}`;
    return url;
  },

  getShowImage(showId: string, width?: number, height?: number, picked?: string): string {
    let url = `${BETA_SERIES_CONFIG.baseUrl}/pictures/shows?id=${showId}&locale=fr&key=${BETA_SERIES_CONFIG.clientId}`;
    if (width) url += `&width=${width}`;
    if (height) url += `&height=${height}`;
    if (picked) url += `&picked=${picked}`;
    return url;
  },

  async getSeasonEpisodes(
    showId: string,
    seasonNumber: number,
  ): Promise<{ episodes: BetaSeriesEpisode[] }> {
    const response = await axios.get(`${BETA_SERIES_CONFIG.baseUrl}/shows/episodes`, {
      params: {
        id: showId,
        season: seasonNumber,
        locale: 'fr',
      },
      headers: {
        'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
      },
    });
    return response.data;
  },

  async getEpisodeDetails(episodeId: string): Promise<{ episode: BetaSeriesEpisode }> {
    const response = await axios.get(`${BETA_SERIES_CONFIG.baseUrl}/episodes/display`, {
      params: {
        id: episodeId,
        locale: 'fr',
      },
      headers: {
        'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
      },
    });
    return response.data;
  },

  async getLatestEpisode(showId: string): Promise<{ episode: BetaSeriesEpisode }> {
    const response = await axios.get(`${BETA_SERIES_CONFIG.baseUrl}/episodes/latest`, {
      params: {
        id: showId,
        locale: 'fr',
      },
      headers: {
        'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
      },
    });
    return response.data;
  },

  async getNextEpisode(showId: string): Promise<{ episode: BetaSeriesEpisode }> {
    const response = await axios.get(`${BETA_SERIES_CONFIG.baseUrl}/episodes/next`, {
      params: {
        id: showId,
        locale: 'fr',
      },
      headers: {
        'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
      },
    });
    return response.data;
  },
};

export const moviesApi = {
  async list(params: MovieListParams = {}): Promise<{ movies: BetaSeriesMovie[] }> {
    const response = await axios.get(`${BETA_SERIES_CONFIG.baseUrl}/movies/list`, {
      params: {
        ...params,
        start: params.start || 0,
        limit: params.limit || 20,
        order: params.order || 'popularity',
        locale: params.locale || 'fr',
      },
      headers: {
        'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
      },
    });
    return response.data;
  },

  async search(params: MovieSearchParams = {}): Promise<{ movies: BetaSeriesMovie[] }> {
    const response = await axios.get(`${BETA_SERIES_CONFIG.baseUrl}/movies/search`, {
      params: {
        ...params,
        title: params.title || undefined,
        order: params.order || 'popularity',
        nbpp: params.nbpp || 20,
        page: params.page || 1,
        locale: params.locale || 'fr',
      },
      headers: {
        'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
      },
    });
    return response.data;
  },

  async getGenres(): Promise<{ genres: Record<string, string> }> {
    const response = await axios.get(`${BETA_SERIES_CONFIG.baseUrl}/movies/genres`, {
      headers: {
        'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
      },
    });
    return response.data;
  },

  async getMovieDetails(id: string): Promise<{ movie: BetaSeriesMovie & { genres?: string[] } }> {
    const response = await axios.get(`${BETA_SERIES_CONFIG.baseUrl}/movies/movie`, {
      params: { id },
      headers: {
        'X-BetaSeries-Key': BETA_SERIES_CONFIG.clientId,
      },
    });
    return response.data;
  },

  getMovieImage(movieId: string, width = 250, height = 375, language = 'original'): string {
    return `${BETA_SERIES_CONFIG.baseUrl}/pictures/movies?id=${movieId}&width=${width}&height=${height}&language=${language}&locale=fr&key=${BETA_SERIES_CONFIG.clientId}`;
  },
};
