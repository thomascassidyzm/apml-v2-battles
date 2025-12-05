/**
 * Generated TypeScript types from APML data models
 * DO NOT EDIT - This file is auto-generated
 */

export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  verified: boolean;
}

export interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: Date;
  likes_count: number;
  reposts_count: number;
  replies_count: number;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: Date;
}

export interface Repost {
  id: string;
  user_id: string;
  post_id: string;
  created_at: Date;
}

export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  created_at: Date;
}
