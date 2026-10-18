# Roadmap

Things that are planned/discussed but not built yet. See `ARCHITECTURE.md` for what *is* built today — including the `renderVideo`/`isActive`/`isVisible` architecture from Phase 3 below, which **is now implemented**; this file tracks what's still outstanding within that phase.

## Phase 3 — Pluggable video playback

### Status: architecture implemented, first player validated on-device
The `renderVideo` render-slot design (host supplies the player, `GodiePost` supplies a correctly-sized, correctly-lifecycled slot) is built — see `docs/ARCHITECTURE.md` → "Video rendering" for the full design. Validated end-to-end on a physical Android device against `react-native-video`:
- [x] Real playback works (`example/src/VideoRenderer.tsx`, native controls, progress bar advancing)
- [x] Swiping the carousel away from the video slide flips its `isActive` to `false`
- [x] Simulating "leaving the post" (`isVisible={false}`, via a manual toggle button in the example — a real feed would drive this from `FlatList.onViewableItemsChanged`) correctly pauses the video; returning resumes it
- [x] No crash on playback error (a first test URL — the old `gtv-videos-bucket` Google sample — started 403'ing; swapped to `storage.googleapis.com/exoplayer-test-media-0/...`, confirmed reachable first)

### Video library landscape (for the host's reference, and our own remaining test candidates)
- **react-native-video** — ✅ tested, works. The community-standard choice, HLS/DASH support, works in bare RN CLI with no Expo footprint, actively maintained, New Architecture ready.
- **expo-video** — not yet tested. Good ergonomics (`useVideoPlayer` hook), but pulls in expo-modules-core even in a bare RN app — a bigger dependency footprint than `react-native-safe-area-context` (currently the only non-core dep in `/example`). Next candidate.
- **react-native-vlc-media-player** — not yet tested. Broadest format/protocol support (RTSP, obscure codecs) via the VLC engine, heavier, more of a niche/streaming pick. Lower priority.

### Remaining test matrix — before calling Phase 3 fully done
All within the *current* fixed 1:1 media container (no redesign of that assumed yet):
- [x] Horizontal (16:9) video — tested with the ExoPlayer sample clip; `cover`-fit crop reads fine
- [ ] Vertical (9:16) video — not yet tested
- [ ] Square (1:1) video — not yet tested
- [ ] A second and third player (expo-video, then one more) wired up the same way, to prove `renderVideo` genuinely works with "whatever player the host brings," not just the one we happened to build against
- [ ] No dangling player instances/memory leaks when `GodiePost` unmounts mid-playback — not yet specifically checked

### Explicitly deferred
- **Screen rotation.** Acknowledged as a genuinely hard case (layout, insets, and probably the video-comments relationship all change) — not addressed now, current layout assumes portrait only.

## Future idea (not designed yet) — "theater mode" comments
For video-heavy or horizontal content: comments overlaid on the right edge of the video (YouTube Live style) instead of stacked below it, with a collapse/expand toggle (a `>>`-style icon) animated via Reanimated, or a lighter transition if Reanimated turns out to be overkill for a simple slide. This would be a distinct **behavioral variant** of `GodiePost`, not a replacement for today's stacked layout — needs its own design pass (interaction with the composer bar, portrait-only given rotation is out of scope). Not started; recorded here so the idea isn't lost.
