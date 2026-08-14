import { StyleSheet, View } from 'react-native';
import { MediaCarousel } from '../MediaCarousel';
import type { MediaItem } from '../../types';

export type MediaHeaderProps = {
  media: MediaItem[];
};

export function MediaHeader({ media }: MediaHeaderProps) {
  return (
    <View style={styles.container}>
      <MediaCarousel media={media} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
  },
});
