import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export type CommentReplyComposerProps = {
  placeholder: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
};

export function CommentReplyComposer({
  placeholder,
  onSubmit,
  onCancel,
}: CommentReplyComposerProps) {
  const [text, setText] = useState('');
  const canSubmit = text.trim().length > 0;

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }
    onSubmit(text.trim());
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor="#8e8e8e"
        style={styles.input}
        multiline
        autoFocus
      />
      <Pressable
        onPress={handleSubmit}
        disabled={!canSubmit}
        hitSlop={8}
        accessibilityRole="button"
      >
        <Text style={[styles.send, !canSubmit && styles.sendDisabled]}>
          Send
        </Text>
      </Pressable>
      <Pressable onPress={onCancel} hitSlop={8} accessibilityRole="button">
        <Text style={styles.cancel}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d0d0d0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxHeight: 80,
  },
  send: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0095f6',
    paddingBottom: 8,
  },
  sendDisabled: {
    color: '#b2dffc',
  },
  cancel: {
    fontSize: 13,
    color: '#8e8e8e',
    paddingBottom: 8,
  },
});
