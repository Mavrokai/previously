import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  friendsApi,
  type BetaSeriesFriend,
  type BetaSeriesMember,
} from '../services/betaseries-api';
import { useAuthStore } from './auth-store';

export const useFriendsStore = defineStore('friends', () => {
  const authStore = useAuthStore();

  const friends = ref<BetaSeriesFriend[]>([]);
  const friendRequests = ref<BetaSeriesFriend[]>([]);
  const searchResults = ref<BetaSeriesMember[]>([]);
  const popularMembers = ref<BetaSeriesMember[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  friends.value = [];
  friendRequests.value = [];
  searchResults.value = [];
  popularMembers.value = [];

  const friendsCount = computed(() => {
    try {
      return friends.value?.length ?? 0;
    } catch {
      return 0;
    }
  });

  const pendingRequestsCount = computed(() => {
    try {
      return friendRequests.value?.length ?? 0;
    } catch {
      return 0;
    }
  });

  const loadFriends = async () => {
    if (!authStore.token) {
      error.value = "Token d'authentification manquant";
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      const response = await friendsApi.getFriendsList(authStore.token, {
        limit: 100,
        summary: true,
      });

      const friendsList = Array.isArray(response.friends) ? response.friends : [];

      const enrichedFriends = await Promise.all(
        friendsList.map(async (friend) => {
          try {
            const memberInfo = await friendsApi.getMemberInfo(friend.id);
            return { ...friend, ...memberInfo.member };
          } catch (err) {
            console.warn(`Impossible de récupérer les infos pour ${friend.id}:`, err);
            return friend;
          }
        }),
      );

      friends.value = enrichedFriends;
    } catch (err) {
      console.error('Erreur lors du chargement des amis:', err);
      error.value = "Erreur lors du chargement de la liste d'amis";
      friends.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const loadFriendRequests = async () => {
    if (!authStore.token) {
      error.value = "Token d'authentification manquant";
      return;
    }

    try {
      isLoading.value = true;
      error.value = null;

      const response = await friendsApi.getFriendRequests(authStore.token, {
        received: true,
      });

      friendRequests.value = Array.isArray(response.friends) ? response.friends : [];
    } catch (err) {
      console.error("Erreur lors du chargement des demandes d'amis:", err);
      error.value = "Erreur lors du chargement des demandes d'amis";
      friendRequests.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const searchMembers = async (login: string, offset = 0, limit = 20) => {
    if (!login || login.length < 2) {
      searchResults.value = [];
      return [];
    }

    try {
      isLoading.value = true;
      error.value = null;

      const response = await friendsApi.searchMembers({
        login,
        limit,
        offset,
      });

      const members = Array.isArray(response.members) ? response.members : [];

      const enrichedMembers = await Promise.all(
        members.map(async (member) => {
          try {
            const memberInfo = await friendsApi.getMemberInfo(member.id);
            return { ...member, ...memberInfo.member };
          } catch (err) {
            console.warn(`Impossible de récupérer les infos pour ${member.id}:`, err);
            return member;
          }
        }),
      );

      searchResults.value = enrichedMembers;
      return enrichedMembers;
    } catch (err) {
      console.error('Erreur lors de la recherche de membres:', err);
      error.value = 'Erreur lors de la recherche de membres';
      searchResults.value = [];
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const addFriend = async (memberId: string) => {
    if (!authStore.token) {
      error.value = "Token d'authentification manquant";
      return false;
    }

    try {
      isLoading.value = true;
      error.value = null;

      const response = await friendsApi.addFriend(authStore.token, memberId);

      const newFriend: BetaSeriesFriend = {
        id: response.friend.id,
        login: response.friend.login,
        avatar: response.friend.avatar || undefined,
        in_account: true,
        stats: response.friend.stats,
      };

      friends.value.push(newFriend);

      const searchIndex = searchResults.value.findIndex((member) => member.id === memberId);
      if (searchIndex !== -1 && searchResults.value[searchIndex]) {
        searchResults.value[searchIndex].in_account = true;
      }

      return true;
    } catch (err) {
      console.error("Erreur lors de l'ajout d'ami:", err);
      error.value = "Erreur lors de l'ajout d'ami";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const removeFriend = async (memberId: string) => {
    if (!authStore.token) {
      error.value = "Token d'authentification manquant";
      return false;
    }

    try {
      isLoading.value = true;
      error.value = null;

      await friendsApi.removeFriend(authStore.token, memberId);

      const friendIndex = friends.value.findIndex((friend) => friend.id === memberId);
      if (friendIndex !== -1) {
        friends.value.splice(friendIndex, 1);
      }

      const searchIndex = searchResults.value.findIndex((member) => member.id === memberId);
      if (searchIndex !== -1 && searchResults.value[searchIndex]) {
        searchResults.value[searchIndex].in_account = false;
      }

      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression d'ami:", err);
      error.value = "Erreur lors de la suppression d'ami";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const blockUser = async (memberId: string) => {
    if (!authStore.token) {
      error.value = "Token d'authentification manquant";
      return false;
    }

    try {
      isLoading.value = true;
      error.value = null;

      await friendsApi.blockUser(authStore.token, memberId);

      const friendIndex = friends.value.findIndex((friend) => friend.id === memberId);
      if (friendIndex !== -1) {
        friends.value.splice(friendIndex, 1);
      }

      return true;
    } catch (err) {
      console.error("Erreur lors du blocage de l'utilisateur:", err);
      error.value = "Erreur lors du blocage de l'utilisateur";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const unblockUser = async (memberId: string) => {
    if (!authStore.token) {
      error.value = "Token d'authentification manquant";
      return false;
    }

    try {
      isLoading.value = true;
      error.value = null;

      await friendsApi.unblockUser(authStore.token, memberId);

      return true;
    } catch (err) {
      console.error("Erreur lors du déblocage de l'utilisateur:", err);
      error.value = "Erreur lors du déblocage de l'utilisateur";
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const loadPopularMembers = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await friendsApi.getPopularMembers(10);
      popularMembers.value = Array.isArray(response.members) ? response.members : [];
    } catch (err) {
      console.error('Erreur lors du chargement des membres populaires:', err);
      error.value = 'Erreur lors du chargement des membres populaires';
      popularMembers.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const clearSearchResults = () => {
    searchResults.value = [];
  };

  const removeFromSearchResults = (memberId: string) => {
    const index = searchResults.value.findIndex((member) => member.id === memberId);
    if (index !== -1) {
      searchResults.value.splice(index, 1);
    }
  };

  return {
    friends,
    friendRequests,
    searchResults,
    popularMembers,
    isLoading,
    error,
    friendsCount,
    pendingRequestsCount,

    loadFriends,
    loadFriendRequests,
    searchMembers,
    loadPopularMembers,
    addFriend,
    removeFriend,
    blockUser,
    unblockUser,
    clearError,
    clearSearchResults,
    removeFromSearchResults,
  };
});
