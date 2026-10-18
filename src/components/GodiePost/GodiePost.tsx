import { useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { MediaHeader } from '../MediaHeader';
import { CommentsList } from '../CommentsList';
import { CommentComposerBar } from '../CommentComposerBar';
import {
  DEFAULT_DARK_BACKGROUND,
  DEFAULT_LIGHT_BACKGROUND,
  GodieThemeContext,
  type GodieTheme,
} from '../../theme/GodieTheme';
import type { CommentComposerTarget, GodiePostProps } from '../../types';

const DEFAULT_MEDIA_COMMENTS_GAP = 12;

export function GodiePost({
  media,
  comments,
  commentTypography,
  commentActions,
  onReplySubmit,
  currentUser,
  onCommentSubmit,
  composerEmojis,
  mediaCommentsGap = DEFAULT_MEDIA_COMMENTS_GAP,
  commentsBottomInset,
  backgroundColor,
  backgroundColorDark,
  closeOnSend,
  renderVideo,
  isVisible = true,
}: GodiePostProps) {
  const [replyTarget, setReplyTarget] = useState<CommentComposerTarget | null>(
    null
  );
  const [composerHeight, setComposerHeight] = useState(0);
  const hasComposer = currentUser != null;

  const isDark = useColorScheme() === 'dark';
  const theme: GodieTheme = {
    backgroundColor: isDark
      ? (backgroundColorDark ?? DEFAULT_DARK_BACKGROUND)
      : (backgroundColor ?? DEFAULT_LIGHT_BACKGROUND),
    textColor: isDark ? '#ffffff' : '#000000',
    isDark,
  };

  return (
    <GodieThemeContext.Provider value={theme}>
      {
        // The composer bar below is `position: absolute`, floating above the
        // keyboard on its own — this View is its positioning anchor (RN Views
        // are `position: relative` by default). MediaHeader/CommentsList are
        // never resized by the keyboard: MediaHeader has a fixed aspect ratio
        // that doesn't yield height, so letting the keyboard reflow this whole
        // column (e.g. via KeyboardAvoidingView) would squeeze the composer
        // bar off-screen. Only the composer moves.
      }
      <View
        style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      >
        <MediaHeader
          media={media}
          isVisible={isVisible}
          renderVideo={renderVideo}
        />
        <View style={[styles.commentsWrapper, { marginTop: mediaCommentsGap }]}>
          <CommentsList
            comments={comments}
            typography={commentTypography}
            actions={commentActions}
            onReplyRequested={setReplyTarget}
            bottomInset={
              hasComposer
                ? composerHeight + (commentsBottomInset ?? 0)
                : commentsBottomInset
            }
          />
        </View>
        {hasComposer && (
          <CommentComposerBar
            currentUser={currentUser}
            replyTarget={replyTarget}
            emojis={composerEmojis}
            bottomInset={commentsBottomInset}
            closeOnSend={closeOnSend}
            onHeightChange={setComposerHeight}
            onCancelReply={() => setReplyTarget(null)}
            onSubmitComment={(text) => onCommentSubmit?.(text)}
            onSubmitReply={(payload) => onReplySubmit?.(payload)}
          />
        )}
      </View>
    </GodieThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commentsWrapper: {
    flex: 1,
  },
});
