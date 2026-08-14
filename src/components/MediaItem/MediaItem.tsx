import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type {
  MediaItem as MediaItemType,
  RenderVideoContext,
  VideoMediaItem,
} from '../../types';

export type MediaItemProps = {
  item: MediaItemType;
  isActive: boolean;
  renderVideo?: (
    item: VideoMediaItem,
    context: RenderVideoContext
  ) => ReactNode;
};

export function MediaItem({ item, isActive, renderVideo }: MediaItemProps) {
  if (item.type === 'video' && renderVideo) {
    return (
      <View style={styles.container}>{renderVideo(item, { isActive })}</View>
    );
  }

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
