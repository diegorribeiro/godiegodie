import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  GodiePost,
  type Comment,
  type CommentActionButton,
  type CommentActionsConfig,
  type CommentAuthor,
  type CommentTypography,
  type MediaItem,
  type ReplySubmitPayload,
} from 'godiegodie';
import { VideoRenderer } from './VideoRenderer';

const currentUser: CommentAuthor = {
  id: 'me',
  name: 'You',
  avatarUri: 'https://picsum.photos/seed/godiegodie-me/200/200',
};

const now = Date.now();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const media: MediaItem[] = [
  {
    type: 'photo',
    id: 'media-1',
    uri: 'https://picsum.photos/seed/godiegodie-1/800/800',
  },
  {
    type: 'photo',
    id: 'media-2',
    uri: 'https://picsum.photos/seed/godiegodie-2/800/800',
  },
  {
    type: 'video',
    id: 'media-3',
    // Public ExoPlayer sample clip. Horizontal (16:9), shown inside the
    // fixed 1:1 media area with a cover-fit crop.
    uri: 'https://storage.googleapis.com/exoplayer-test-media-0/BigBuckBunny_320x180.mp4',
    posterUri: 'https://picsum.photos/seed/godiegodie-3/800/800',
  },
];

const initialComments: Comment[] = [
  {
    id: 'comment-1',
    author: { id: 'user-1', name: 'Ana' },
    text: 'Just posted this!',
    createdAt: now - 20 * 1000,
    replies: [
      {
        id: 'reply-1',
        author: { id: 'user-7', name: 'Gabi' },
        text: 'Congrats!',
        createdAt: now - 10 * 1000,
        replyingToAuthorId: 'user-1',
      },
    ],
  },
  {
    id: 'comment-2',
    author: { id: 'user-2', name: 'Bruno' },
    text: 'Looks great 🔥',
    createdAt: now - 30 * MINUTE,
    replies: [
      {
        id: 'reply-2',
        author: { id: 'user-3', name: 'Carla' },
        text: 'Agreed!',
        createdAt: now - 28 * MINUTE,
        replyingToAuthorId: 'user-2',
      },
      {
        id: 'reply-3',
        author: { id: 'user-4', name: 'Diego' },
        text: '@Carla right? 🔥🔥',
        createdAt: now - 25 * MINUTE,
        replyingToAuthorId: 'user-3',
      },
    ],
  },
  {
    id: 'comment-3',
    author: { id: 'user-3', name: 'Carla' },
    text: 'Been here 2 hours already, still scrolling.',
    createdAt: now - 2 * HOUR,
  },
  {
    id: 'comment-4',
    author: { id: 'user-4', name: 'Diego' },
    text: 'Earlier today, before the 2h cutoff switched to clock time.',
    createdAt: now - 5 * HOUR,
  },
  {
    id: 'comment-5',
    author: { id: 'user-5', name: 'Elis' },
    text: 'Commented yesterday.',
    createdAt: now - 1 * DAY,
  },
  {
    id: 'comment-6',
    author: { id: 'user-6', name: 'Fabio' },
    text: 'Commented last week — shows a full date now.',
    createdAt: now - 8 * DAY,
  },
];

// Font names below are Android's built-in generic families, used here only
// because they're guaranteed present without loading anything. Any font
// name already registered by the host app (via a custom font linked at
// build time, or expo-font) works exactly the same way — GodiePost never
// loads fonts itself, it just forwards the name to <Text style={{fontFamily}}>.
const commentTypography: CommentTypography = {
  authorName: { fontFamily: 'sans-serif-medium', fontSize: 16 },
  text: { fontFamily: 'serif', fontSize: 15 },
  timestamp: { fontSize: 11 },
};

// `direction: 'row'` puts the buttons side by side; omitting it defaults to
// a vertical stack ('column'). Using the function form here so comment-2 is
// the only row with a "pin" button, proving a button can be present on some
// comments and absent on others. Both onPress handlers below are just
// example actions — a real app would do something app-specific instead
// (e.g. open a modal already on its own screen, navigate, call an API).
const commentActions: CommentActionsConfig = {
  direction: 'row',
  buttons: (comment) => {
    const buttons: CommentActionButton[] = [
      {
        id: 'like',
        label: '❤️',
        size: 'small',
        accessibilityLabel: 'Like',
        onPress: (c) =>
          Alert.alert('Liked', `You liked ${c.author.name}'s comment.`),
      },
    ];

    if (comment.id === 'comment-2') {
      buttons.push({
        id: 'pin',
        label: '📌',
        size: 'medium',
        accessibilityLabel: 'Pin comment',
        onPress: (c) =>
          Alert.alert('Pinned', `Pinned ${c.author.name}'s comment.`),
      });
    }

    return buttons;
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  // GodiePost has no way to know about the Android nav bar (or any other
  // chrome the host renders below it) — the host measures it and passes
  // the number down. See docs/ARCHITECTURE.md and README "Safe area".
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const [comments, setComments] = useState(initialComments);
  // Stands in for "the host's own outer feed scrolled this post out of
  // view" — in a real app this would come from a FlatList's
  // onViewableItemsChanged, not a button. Here it's just the simplest way
  // to prove GodiePostProps.isVisible actually stops the video.
  const [isPostVisible, setIsPostVisible] = useState(true);

  function handleReplySubmit({
    commentId,
    replyingToUserId,
    text,
  }: ReplySubmitPayload) {
    setComments((current) =>
      current.map((comment) => {
        if (comment.id !== commentId) {
          return comment;
        }
        return {
          ...comment,
          replies: [
            ...(comment.replies ?? []),
            {
              id: `reply-${Date.now()}`,
              author: currentUser,
              text,
              createdAt: Date.now(),
              replyingToAuthorId: replyingToUserId,
            },
          ],
        };
      })
    );
  }

  function handleCommentSubmit(text: string) {
    setComments((current) => [
      ...current,
      {
        id: `comment-${Date.now()}`,
        author: currentUser,
        text,
        createdAt: Date.now(),
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Pressable
        onPress={() => setIsPostVisible((current) => !current)}
        style={[styles.visibilityToggle, { paddingTop: 8 + insets.top }]}
      >
        <Text style={styles.visibilityToggleText}>
          {isPostVisible
            ? '⬇ Simulate leaving post (pause video)'
            : '⬆ Simulate returning to post'}
        </Text>
      </Pressable>
      <GodiePost
        media={media}
        comments={comments}
        commentTypography={commentTypography}
        commentActions={commentActions}
        currentUser={currentUser}
        onCommentSubmit={handleCommentSubmit}
        onReplySubmit={handleReplySubmit}
        commentsBottomInset={insets.bottom}
        renderVideo={VideoRenderer}
        isVisible={isPostVisible}
        // Omitting backgroundColor/backgroundColorDark on purpose — these
        // match GodiePost's own tested defaults (white / Instagram-style
        // near-black). Passed explicitly here only to show the prop exists:
        // backgroundColor="#ffffff"
        // backgroundColorDark="#000000"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  visibilityToggle: {
    padding: 8,
    backgroundColor: '#222222',
    alignItems: 'center',
  },
  visibilityToggleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});
