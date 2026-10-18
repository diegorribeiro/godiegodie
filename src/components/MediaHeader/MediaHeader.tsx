import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { MediaCarousel } from '../MediaCarousel';
import type {
  MediaItem,
  RenderVideoContext,
  VideoMediaItem,
} from '../../types';

export type MediaHeaderProps = {
  media: MediaItem[];
  isVisible: boolean;
  renderVideo?: (
    item: VideoMediaItem,
    context: RenderVideoContext
  ) => ReactNode;
};

export function MediaHeader({
  media,
  isVisible,
  renderVideo,
}: MediaHeaderProps) {
  return (
    <View style={styles.container}>
      <MediaCarousel
        media={media}
        isVisible={isVisible}
        renderVideo={renderVideo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
  },
});
