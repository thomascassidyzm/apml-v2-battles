import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, Post, Like, Repost, Bookmark } from '../types/models';

/**
 * Generated Pinia store from APML data and computed values
 * DO NOT EDIT - This file is auto-generated
 */

export const useAppStore = defineStore('app', () => {
  // State
  const users = ref<User[]>([
    { id: '1', username: 'elonmusk', display_name: 'Elon Musk', avatar_url: 'https://pbs.twimg.com/profile_images/1590968738358079488/IY9Gx6Ok_400x400.jpg', verified: true },
    { id: '2', username: 'naval', display_name: 'Naval', avatar_url: 'https://pbs.twimg.com/profile_images/1256841238298292232/ycqwaMI2_400x400.jpg', verified: true },
  ]);

  const posts = ref<Post[]>([
    { id: '1', content: 'The best way to predict the future is to build it.', author_id: '1', created_at: new Date(), likes_count: 42000, reposts_count: 8500, replies_count: 3200 },
    { id: '2', content: 'Code is poetry.', author_id: '2', created_at: new Date(Date.now() - 3600000), likes_count: 15000, reposts_count: 2100, replies_count: 890 },
    { id: '3', content: 'Building the future of sustainable energy and multi-planetary life. 🚀', author_id: '1', created_at: new Date(Date.now() - 7200000), likes_count: 89000, reposts_count: 12000, replies_count: 5400 },
    { id: '4', content: 'Seek wealth, not money or status. Wealth is having assets that earn while you sleep.', author_id: '2', created_at: new Date(Date.now() - 10800000), likes_count: 34000, reposts_count: 6700, replies_count: 2100 },
    { id: '5', content: 'Working on something exciting. Can\'t wait to share it with the world!', author_id: '1', created_at: new Date(Date.now() - 14400000), likes_count: 56000, reposts_count: 9200, replies_count: 4100 },
    { id: '6', content: 'Reading is faster than listening. Doing is faster than watching.', author_id: '2', created_at: new Date(Date.now() - 18000000), likes_count: 28000, reposts_count: 5100, replies_count: 1800 },
    { id: '7', content: 'The most important thing is to try and inspire people so that they can be great at whatever they want to do.', author_id: '1', created_at: new Date(Date.now() - 21600000), likes_count: 67000, reposts_count: 11000, replies_count: 3900 },
  ]);
  const likes = ref<Like[]>([]);
  const reposts = ref<Repost[]>([]);
  const bookmarks = ref<Bookmark[]>([]);

  // Computed properties
  const filtered_posts = computed(() => {
    // TODO: Implement filtering logic when active_feed_tab is available
    return posts.value;
  });

  const formatted_timestamp = computed(() => {
    return function(created_at: Date) {
      const now = Date.now()
      const diff = now - created_at.getTime()
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
    return filtered_posts.value.length;
  });

  const getUserById = (id: string) => users.value.find(u => u.id === id);

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
    getUserById,
  };
});