import { Image, StyleSheet, Text, View } from 'react-native';

export type AvatarProps = {
  name: string;
  uri?: string;
  size?: number;
};

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function Avatar({ name, uri, size = 32 }: AvatarProps) {
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, dimensionStyle]}
        accessibilityLabel={name}
      />
    );
  }

  return (
    <View style={[styles.fallback, dimensionStyle]}>
      <Text style={[styles.fallbackText, { fontSize: size * 0.45 }]}>
        {getInitial(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#e1e1e1',
  },
  fallback: {
    backgroundColor: '#c4c4c4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
