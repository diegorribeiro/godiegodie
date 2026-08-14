import type { ReactNode } from 'react';

export type MediaItem =
  | { type: 'photo'; id: string; uri: string }
  | { type: 'video'; id: string; uri: string; posterUri?: string };

export type CommentAuthor = {
  id: string;
  name: string;
  avatarUri?: string;
};

export type CommentReply = {
  id: string;
  author: CommentAuthor;
  text: string;
  createdAt: Date | string | number;
  /** The author being addressed by this specific reply within the flat thread. */
  replyingToAuthorId: string;
};

export type Comment = {
  id: string;
  author: CommentAuthor;
  text: string;
  /** When the comment was created. Accepts anything `new Date()` accepts. */
  createdAt: Date | string | number;
  /**
   * Single-level replies only — entries here never have their own `replies`.
   * Hidden by default behind a "See N replies" toggle; once expanded, every
   * reply renders at the same indentation (flat — never deepening/cascading).
   */
  replies?: CommentReply[];
};

/** Payload delivered to `onReplySubmit` once the user sends a reply. */
export type ReplySubmitPayload = {
  /** The top-level comment this reply belongs to (the thread root). */
  commentId: string;
  /** The author being addressed — either the comment's author, or a specific reply's author. */
  replyingToUserId: string;
  text: string;
};

export type TextStyleOverride = {
  /**
   * Name of a font already available to the app (a built-in system font,
   * or a custom font already loaded/linked by the host app). The library
   * never loads fonts itself — pass the name exactly as the app declared it.
   */
  fontFamily?: string;
  fontSize?: number;
};

export type CommentTypography = {
  /** The comment author's name (the "title" of a comment row). */
  authorName?: TextStyleOverride;
  /** The comment body text. */
  text?: TextStyleOverride;
  /** The relative/absolute timestamp. Font family isn't customizable here on purpose — it's a small, secondary label. */
  timestamp?: Pick<TextStyleOverride, 'fontSize'>;
};

/**
 * Fixed set of allowed button sizes. Deliberately closed (no arbitrary
 * pixel values) so a large button can never push the avatar/text layout
 * of a comment row out of alignment.
 */
export type CommentActionButtonSize = 'small' | 'medium' | 'large';

export type CommentActionButton = {
  id: string;
  icon?: ReactNode;
  label?: string;
  size?: CommentActionButtonSize;
  accessibilityLabel?: string;
  onPress: (comment: Comment) => void;
};

export type CommentActionsConfig = {
  /** Side-by-side ('row') or stacked ('column'). Defaults to 'column'. */
  direction?: 'row' | 'column';
  /**
   * Either the same buttons for every comment, or a function to decide
   * per comment (return an empty array to show no button on that row).
   */
  buttons:
    CommentActionButton[] | ((comment: Comment) => CommentActionButton[]);
};

export type GodiePostProps = {
  media: MediaItem[];
  comments: Comment[];
  commentTypography?: CommentTypography;
  commentActions?: CommentActionsConfig;
  /**
   * Called when the user sends a reply (to a comment, or to one of its
   * replies). The component only reports the payload — it does not mutate
   * `comments` itself. Update your own state and pass the new `comments`
   * array back down for the reply to actually appear.
   */
  onReplySubmit?: (payload: ReplySubmitPayload) => void;
  /** Gap between the media header and the comments list. Defaults to 12. */
  mediaCommentsGap?: number;
  /**
   * Extra space left below the last comment, so it doesn't end up hidden
   * behind a system bar (e.g. Android's persistent gesture/nav bar) or any
   * other chrome the host renders below GodiePost. The component has no way
   * to know about that chrome itself — measure it in your own app (typically
   * `useSafeAreaInsets().bottom` from `react-native-safe-area-context`, if
   * you already have it) and pass the number down.
   */
  commentsBottomInset?: number;
};
