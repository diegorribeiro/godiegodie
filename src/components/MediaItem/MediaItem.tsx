import { Image, StyleSheet, View } from 'react-native';
import type { MediaItem as MediaItemType } from '../../types';

export type MediaItemProps = {
  item: MediaItemType;
};

export function MediaItem({ item }: MediaItemProps) {
  const uri = item.type === 'photo' ? item.uri : (item.posterUri ?? item.uri);

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      {item.type === 'video' && (
        <View style={styles.playOverlay}>
          <View style={styles.playTriangle} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e1e1e1',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 4,
    borderTopWidth: 12,
    borderBottomWidth: 12,
    borderLeftWidth: 20,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#ffffff',
  },
});
