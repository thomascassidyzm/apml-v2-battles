<template>
  <div class="feed-view">
    <header class="header">
      <div class="tab-selector">
        <button class="tab" :class="{ active: activeFeedTab == "forYou" }">
          For You
        </button>
        <button class="tab" :class="{ active: activeFeedTab == "following" }">
          Following
        </button>
      </div>
    </header>
    <main class="main-feed">
      <div v-if="isLoading && postCount == 0">
        <div class="loading-spinner">
          {{ "Loading posts..." }}
        </div>
      </div>
      <div v-if="!isLoading && postCount == 0">
        <div class="empty-state" data-icon="timeline">
          No posts to show
        </div>
      </div>
      <div v-if="postCount > 0">
        <li class="virtualized-list">
          <div class="card">
            <section class="author-section">
              <div class="avatar" :src="post.author.avatar_url">
              </div>
              <div class="author-info">
                <div class="display-name">
                  {{ post.author.display_name }}
                  <div v-if="post.author.verified">
                    <div class="verified-badge" data-icon="verified">
                    </div>
                  </div>
                </div>
                <div class="username">
                  {{ "@" + post.author.username }}
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
                {{ formatted_timestamp(post.created_at) }}
              </div>
            </section>
            <section class="actions-section">
              <button class="reply-button" data-icon="chat_bubble_outline">
                {{ post.replies_count > 0 ? post.replies_count : "" }}
              </button>
              <button class="repost-button" data-icon="repeat">
                {{ post.reposts_count > 0 ? post.reposts_count : "" }}
              </button>
              <button class="like-button" :data-icon="post.is_liked ? "favorite" : "favorite_border"">
                {{ post.likes_count > 0 ? post.likes_count : "" }}
              </button>
              <button class="share-button" data-icon="ios_share">
              </button>
            </section>
          </div>
        </li>
      </div>
    </main>
    <nav class="bottom-nav">
      <nav class="nav-item" data-icon="home" :class="{ active: true }">
      </nav>
      <nav class="nav-item" data-icon="search" :class="{ active: false }">
      </nav>
      <nav class="nav-item" data-icon="notifications" :class="{ active: false }">
      </nav>
      <nav class="nav-item" data-icon="mail" :class="{ active: false }">
      </nav>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '../stores/app';

const store = useAppStore();

// Computed properties from store
// const filtered_posts = store.filtered_posts;
// const formatted_timestamp = store.formatted_timestamp;
// const post_count = store.post_count;

// TODO: Add component logic
</script>

<style scoped>
.feed-view {
  /* TODO: Add component styles */
}
</style>