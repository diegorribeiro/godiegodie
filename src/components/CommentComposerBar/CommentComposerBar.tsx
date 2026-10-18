import { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
  type TextInputKeyPressEvent,
} from 'react-native';
import { Avatar } from '../Avatar';
import { useGodieTheme } from '../../theme/GodieTheme';
import type {
  CommentAuthor,
  CommentComposerTarget,
  ReplySubmitPayload,
} from '../../types';

const DEFAULT_EMOJIS = ['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'];
const AVATAR_SIZE = 60;
const MAX_INPUT_HEIGHT = 100;
const KEYBOARD_GAP = 8;

export type CommentComposerBarProps = {
  currentUser: CommentAuthor;
  replyTarget: CommentComposerTarget | null;
  emojis?: string[];
  bottomInset?: number;
  /** Dismiss the keyboard automatically after sending. Defaults to `true`. */
  closeOnSend?: boolean;
  /** Reports the bar's own rendered height, so the comments list can reserve room for it. */
  onHeightChange?: (height: number) => void;
  onCancelReply: () => void;
  onSubmitComment: (text: string) => void;
  onSubmitReply: (payload: ReplySubmitPayload) => void;
};

export function CommentComposerBar({
  currentUser,
  replyTarget,
  emojis = DEFAULT_EMOJIS,
  bottomInset,
  closeOnSend = true,
  onHeightChange,
  onCancelReply,
  onSubmitComment,
  onSubmitReply,
}: CommentComposerBarProps) {
  const theme = useGodieTheme();
  const isDark = theme.isDark;
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  // Tracked in JS on both platforms rather than relying on Android's
  // windowSoftInputMode="adjustResize" to resize the window for us: on
  // recent Android versions (edge-to-edge enforced from API 35) that
  // window-resize behavior is inconsistent, so a plain `bottom: 0` can't be
  // trusted to land above the keyboard. Explicit height tracking works the
  // same way on both platforms regardless of that.
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  // `any`: RN 0.85's generated TextInput ref type doesn't expose `.focus()`
  // even though the runtime instance has it — a known upstream typing gap,
  // not something fixable from here.
  const inputRef = useRef<any>(null);
  const canSubmit = text.trim().length > 0;

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (event) => {
      // Android: some IMEs (Gboard's suggestion/tools strip is the common
      // one) render a toolbar above the actual keys that isn't included in
      // `endCoordinates.height`, which would otherwise leave the bar
      // positioned a bit too low, tucked behind that toolbar. This is a
      // heuristic allowance, not a measurement — there's no reliable way
      // to query it from JS. iOS keyboards don't have this extra chrome.
      const imeToolbarAllowance = Platform.OS === 'android' ? 48 : 0;
      setKeyboardHeight(event.endCoordinates.height + imeToolbarAllowance);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const replyCommentId = replyTarget?.commentId;
  const replyAuthorId = replyTarget?.authorId;
  const replyAuthorName = replyTarget?.authorName;

  useEffect(() => {
    if (replyCommentId == null || replyAuthorId == null) {
      return;
    }
    setText(`@${replyAuthorName} `);
    inputRef.current?.focus();
    // Intentionally keyed on the target's identity, not the whole object —
    // an equivalent-but-new object reference from the host shouldn't retrigger this.
  }, [replyCommentId, replyAuthorId, replyAuthorName]);

  function handleSubmit() {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return;
    }
    if (replyTarget) {
      onSubmitReply({
        commentId: replyTarget.commentId,
        replyingToUserId: replyTarget.authorId,
        text: trimmed,
      });
    } else {
      onSubmitComment(trimmed);
    }
    setText('');
    onCancelReply();
    if (closeOnSend) {
      Keyboard.dismiss();
    }
  }

  function handleCancelReply() {
    setText('');
    onCancelReply();
  }

  function handleKeyPress(event: TextInputKeyPressEvent) {
    if (
      event.nativeEvent.key === 'Backspace' &&
      text.length === 0 &&
      replyTarget != null
    ) {
      handleCancelReply();
    }
  }

  // A small gap above the keyboard itself — without it, the pill's rounded
  // bottom edge sits flush against the keyboard with no breathing room.
  const bottom =
    keyboardHeight > 0 ? keyboardHeight + KEYBOARD_GAP : (bottomInset ?? 0);

  function handleLayout(event: LayoutChangeEvent) {
    onHeightChange?.(event.nativeEvent.layout.height);
  }

  const dividerColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.container,
        {
          bottom,
          backgroundColor: theme.backgroundColor,
          borderTopColor: dividerColor,
        },
      ]}
    >
      {replyTarget && (
        <View style={styles.replyBanner}>
          <Text style={[styles.replyBannerText, { color: theme.textColor }]}>
            Replying to {replyTarget.authorName}
          </Text>
          <Pressable
            onPress={handleCancelReply}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Cancel reply"
          >
            <Text style={[styles.replyBannerClose, { color: theme.textColor }]}>
              ✕
            </Text>
          </Pressable>
        </View>
      )}

      {focused && emojis.length > 0 && (
        <View style={styles.emojiRow}>
          {emojis.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => setText((current) => current + emoji)}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`Insert ${emoji}`}
            >
              <Text style={styles.emoji}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.row}>
        <Avatar
          name={currentUser.name}
          uri={currentUser.avatarUri}
          size={AVATAR_SIZE}
        />
        <View
          style={[styles.pill, isDark ? styles.pillDark : styles.pillLight]}
        >
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyPress={handleKeyPress}
            onSubmitEditing={handleSubmit}
            returnKeyType="send"
            blurOnSubmit={false}
            multiline
            placeholder="Add a comment..."
            placeholderTextColor={
              isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'
            }
            style={[styles.input, { color: theme.textColor }]}
          />
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Send"
            style={[
              styles.sendButton,
              isDark ? styles.sendButtonDark : styles.sendButtonLight,
              !canSubmit && styles.sendButtonDisabled,
            ]}
          >
            <Text style={isDark ? styles.sendIconDark : styles.sendIconLight}>
              ➤
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 10,
    gap: 6,
    // Delimits the composer band from the comments scrolling above it.
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  replyBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replyBannerText: {
    fontSize: 12,
  },
  replyBannerClose: {
    fontSize: 12,
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  emoji: {
    fontSize: 22,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    gap: 8,
  },
  pillDark: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderColor: 'rgba(255,255,255,1)',
  },
  pillLight: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(0,0,0,0.15)',
  },
  input: {
    flex: 1,
    fontSize: 14,
    maxHeight: MAX_INPUT_HEIGHT,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonLight: {
    backgroundColor: '#000000',
  },
  sendButtonDark: {
    backgroundColor: '#ffffff',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendIconLight: {
    color: '#ffffff',
    fontSize: 16,
  },
  sendIconDark: {
    color: '#000000',
    fontSize: 16,
  },
});
