<template>
  <div class="feed-view">
    <header class="header">
      <div class="tab-selector">
        <button class="tab" :class="{ active: activeFeedTab === 'forYou' }" @click="activeFeedTab = 'forYou'">
          For You
        </button>
        <button class="tab" :class="{ active: activeFeedTab === 'following' }" @click="activeFeedTab = 'following'">
          Following
        </button>
      </div>
    </header>
    <main class="main-feed">
      <div v-if="isLoading && postCount === 0">
        <div class="loading-spinner">
          Loading posts...
        </div>
      </div>
      <div v-if="!isLoading && postCount === 0">
        <div class="empty-state" data-icon="timeline">
          No posts to show
        </div>
      </div>
      <div v-if="postCount > 0">
        <ul class="virtualized-list">
          <li v-for="post in filteredPosts" :key="post.id" class="card">
            <section class="author-section">
              <img class="avatar" :src="getAuthor(post.author_id)?.avatar_url" :alt="getAuthor(post.author_id)?.display_name" />
              <div class="author-info">
                <div class="display-name">
                  {{ getAuthor(post.author_id)?.display_name }}
                  <div v-if="getAuthor(post.author_id)?.verified" class="verified-badge" data-icon="verified">
                  </div>
                </div>
                <div class="username">
                  @{{ getAuthor(post.author_id)?.username }}
                </div>
              </div>
            </section>
            <section class="content-section">
              <div class="post-text">
                {{ post.content }}
              </div>
            </section>
            <section class="timestamp-section">
              <div class="timestamp">
                {{ formattedTimestamp(post.created_at) }}
              </div>
            </section>
            <section class="actions-section">
              <button class="reply-button" data-icon="chat_bubble_outline">
                {{ post.replies_count > 0 ? post.replies_count : '' }}
              </button>
              <button class="repost-button" data-icon="repeat">
                {{ post.reposts_count > 0 ? post.reposts_count : '' }}
              </button>
              <button class="like-button" :data-icon="post.is_liked ? 'favorite' : 'favorite_border'">
                {{ post.likes_count > 0 ? post.likes_count : '' }}
              </button>
              <button class="share-button" data-icon="ios_share">
              </button>
            </section>
          </li>
        </ul>
      </div>
    </main>
    <nav class="bottom-nav">
      <button class="nav-item" data-icon="home" :class="{ active: true }">
      </button>
      <button class="nav-item" data-icon="search" :class="{ active: false }">
      </button>
      <button class="nav-item" data-icon="notifications" :class="{ active: false }">
      </button>
      <button class="nav-item" data-icon="mail" :class="{ active: false }">
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '../stores/app';

const store = useAppStore();

// Local state
const activeFeedTab = ref<'forYou' | 'following'>('forYou');
const isLoading = ref(false);

// Computed properties from store
const filteredPosts = computed(() => store.filtered_posts);
const postCount = computed(() => store.post_count);

// Helper functions
const formattedTimestamp = (created_at: Date) => {
  return store.formatted_timestamp(created_at);
};

const getAuthor = (author_id: string) => {
  return store.getUserById(author_id);
};
</script>

<style scoped>
.feed-view {
  /* TODO: Add component styles */
}
</style>