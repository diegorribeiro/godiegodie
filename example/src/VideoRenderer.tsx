import { StyleSheet } from 'react-native';
import Video from 'react-native-video';
import type { RenderVideoContext, VideoMediaItem } from 'godiegodie';

// Lives entirely in the example app — godieGodie itself never imports
// react-native-video (or any video library). This is the reference
// implementation of GodiePostProps.renderVideo: `godieGodie` only tells us
// `isActive`, we decide what that means for *this* player (here: the
// `paused` prop). No pause()/stop() call ever comes from the library.
export function VideoRenderer(
  item: VideoMediaItem,
  { isActive }: RenderVideoContext
) {
  return (
    <Video
      source={{ uri: item.uri }}
      poster={item.posterUri}
      style={styles.video}
      resizeMode="cover"
      paused={!isActive}
      repeat
      controls
      onError={(error) => console.warn('[VideoRenderer] playback error', error)}
    />
  );
}

const styles = StyleSheet.create({
  video: {
    width: '100%',
    height: '100%',
  },
});
