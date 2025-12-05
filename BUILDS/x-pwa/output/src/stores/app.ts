import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Post, Like, Repost, Bookmark } from '../types/models';

/**
 * Generated Pinia store from APML data and computed values
 * DO NOT EDIT - This file is auto-generated
 */

export const useAppStore = defineStore('app', () => {
  // State
  const users = ref<User[]>([]);
  const posts = ref<Post[]>([]);
  const likes = ref<Like[]>([]);
  const reposts = ref<Repost[]>([]);
  const bookmarks = ref<Bookmark[]>([]);

  // Computed properties
  const filtered_posts = computed(() => {
    return active_feed_tab == "for_you" ? for_you_posts : following_posts;
  });

  const formatted_timestamp = computed(() => {
    return function(created_at) {
      const now = Date.now()
      const diff = now - created_at
      const seconds = diff / 1000
      const minutes = seconds / 60
      const hours = minutes / 60
      const days = hours / 24

      if (seconds < 60) return "now"
      if (minutes < 60) return Math.floor(minutes) + "m"
      if (hours < 24) return Math.floor(hours) + "h"
      if (days < 7) return Math.floor(days) + "d"
      return created_at.toLocaleDateString()
    };
  });

  const post_count = computed(() => {
    return filtered_posts.length;
  });

  // Actions
  // TODO: Add CRUD actions for models

  return {
    users,
    posts,
    likes,
    reposts,
    bookmarks,
    filtered_posts,
    formatted_timestamp,
    post_count,
  };
});