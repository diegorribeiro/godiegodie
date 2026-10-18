import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { MediaItem } from '../MediaItem';
import type {
  MediaItem as MediaItemType,
  RenderVideoContext,
  VideoMediaItem,
} from '../../types';

export type MediaCarouselProps = {
  media: MediaItemType[];
  isVisible: boolean;
  renderVideo?: (
    item: VideoMediaItem,
    context: RenderVideoContext
  ) => ReactNode;
};

export function MediaCarousel({
  media,
  isVisible,
  renderVideo,
}: MediaCarouselProps) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);

  function handleMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  }

  return (
    <View>
      <FlatList
        data={media}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={{ width }}>
            <MediaItem
              item={item}
              isActive={isVisible && index === activeIndex}
              renderVideo={renderVideo}
            />
          </View>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      />
      {media.length > 1 && (
        <View style={styles.dots}>
          {media.map((item, index) => (
            <View
              key={item.id}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute',
    bottom: 8,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: '#ffffff',
  },
});
