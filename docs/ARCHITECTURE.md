# Architecture

## Overview
`godieGodie` is a dynamic React Native component structured similarly to an Instagram post, or as an organized form layout. It is a pure React Native component (no Ionic/web abstraction layer today).

## Layout
- **Top area (media / blocks):** toggles between displaying media (photos and videos) and informational blocks / important forms.
- **Bottom area (content / comments):** scrollable area listing comments or complementary information.

## Platform decisions
- **Target:** React Native only for v1. Any Ionic/web port is a possible separate future project, not a constraint on today's API design.
- **Build tooling:** [`react-native-builder-bob`](https://github.com/callstack/react-native-builder-bob) — community standard for RN libraries, outputs CJS/ESM/types and supports the New Architecture (Fabric/TurboModules) out of the box.
- **The library itself has zero Expo dependency** — `peerDependencies` is only `react` + `react-native`, nothing in `src/` imports any `expo-*` package. `/example` is a **bare React Native CLI app** (real `android/`/`ios/` native projects, committed to the repo, built via the Gradle wrapper / Xcode directly and installed with `adb install` — no Expo Go involved). This was a deliberate choice, not the generator's default: `create-react-native-library` defaults its example app to Expo because it's faster to scaffold, but that ties on-device testing to whatever Expo Go build happens to be installed on the test device. Testing on a physical Android tablet hit exactly that friction (an ancient Expo Go build incompatible with the project's SDK) — switching the example to bare RN CLI removes that dependency entirely and is a more honest proof that the component works in *any* React Native app, not just inside Expo's managed runtime.

## Known cross-project pitfalls to watch for
Patterns worth keeping in mind:
- **Reanimated `runOnJS`:** must always receive a stable function reference defined outside the worklet — never an inline arrow function created inside a `withTiming`/`withSpring` callback.
- **`SafeAreaView` on Android:** the `react-native-safe-area-context` version double-applies the top inset when a native header is already present; the core `react-native` version is a no-op for bottom insets. Relevant if the component is ever rendered inside a screen with a native header.

## Component tree (v1 — Instagram-style post)
```
GodiePost                    (src/components/GodiePost)
├── MediaHeader               fixed-aspect-ratio (1:1) top container
│   └── MediaCarousel         horizontal pager + dots, tracks active index
│       └── MediaItem         single photo, or video poster + play overlay
└── CommentsList               FlatList wrapper, empty state
    └── CommentItem            avatar + name/timestamp row + text + action area
        ├── Avatar             image or initials fallback
        ├── CommentTimestamp   wraps utils/formatCommentTimestamp, fontSize override
        ├── CommentActionArea  right-aligned row/column of buttons (only if any resolve)
        │   └── CommentActionButton   fixed-size Pressable, icon + optional label
        ├── ReplyTrigger       "Reply" text link — also used inside ReplyItem below
        ├── CommentReplyComposer      inline TextInput + Send/Cancel, shown only while replying
        └── RepliesSection     only rendered when comment.replies is non-empty
            ├── RepliesToggle  "See N replies" / "Hide replies"
            └── ReplyItem × N  indented reply row (own Avatar, text, ReplyTrigger)
```
Each node above is its own component folder under `src/components/<Name>/` (component + typed props + barrel `index.ts`). Anything that was pure formatting logic (timestamp rules, font-style overrides) was pulled out into `src/utils/` instead of living inline in a component — see `product-manager` and `rn-component-architect` agents for the componentization rule this follows.

## Comment typography (`commentTypography` prop)
`authorName`, `text`, and `timestamp` each accept a size override; `authorName` and `text` also accept `fontFamily`. The library never loads or bundles fonts — it only forwards the name to `<Text style={{ fontFamily }}>`, so it works with any font the host app already has (system font or one it linked/loaded itself). Style overrides are applied conditionally (`value != null && { ... }`) rather than always spreading the override object — spreading an object with an explicit `fontSize: undefined` key would overwrite the component's default via `Object.assign` semantics in RN's style flattening, silently falling back to the platform default size instead of the component's intended default.

## Comment action buttons (`commentActions` prop)
- `buttons` is either a fixed array or a `(comment) => CommentActionButton[]` function, so a button can be present on some comment rows and absent on others (e.g. a moderator-only "pin" button).
- `size` is a closed enum (`'small' | 'medium' | 'large'` → 28/36/44px) instead of an arbitrary number, specifically so a button can never grow large enough to push the avatar or wrap the comment text unpredictably.
- `icon` is a plain `ReactNode` — the library has **no icon-library dependency of its own** (not FontAwesome, not `react-native-vector-icons`). The host app brings whatever icon set it already uses. This was a deliberate call: `react-native-vector-icons`/FontAwesome-style packages need native font linking, which would force a native-setup requirement onto every consumer of this library — directly against the "zero native dependency" position established when the example app was moved off Expo.
- `onPress: (comment) => void` is supplied by the host and only ever called back by the button — the component has no opinion about what the button does (open a modal already on the host's screen, navigate, call an API). This is the entire mechanism; no separate "callback registration" API exists or is needed.
- Click isolation: `CommentActionArea` uses a `10px` gap between buttons and each `CommentActionButton` a `4px` `hitSlop` — gap is kept `> 2 × hitSlop` so two adjacent buttons' hit regions can never touch. `CommentsList`'s `FlatList` pins `removeClippedSubviews={false}` (an Android-specific behavior that has, in the past, left rows visually present but unresponsive to touch) now that rows contain independently-pressable buttons. `CommentItem`'s own row container is a plain `View` (never itself touchable), so there is no nested-touchable/bubbling ambiguity between a row and its buttons.

## Replies (`Comment.replies`, `onReplySubmit` prop)
- **Single level only, by design.** `CommentReply` has no `replies` field of its own — the type system rules out cascading threads, matching the "one level, flat" requirement. Every reply to a comment (whether triggered from the comment itself or from a specific earlier reply) lands in the *same* `comment.replies` array with the *same* `commentId`; only `replyingToUserId` changes.
- Replies are **hidden by default** behind a `RepliesToggle` ("See N replies" / singular "See 1 reply"); expanding renders every entry in `comment.replies` at the *same* `paddingLeft: 40` indent — `RepliesSection` applies that indent once, on its own wrapping container, rather than each `ReplyItem` positioning itself, which is what keeps the indentation flat instead of accumulating deeper per reply.
- **One composer, one position.** Tapping "Reply" on the comment itself or on any individual reply sets the same `replyTarget` state in `CommentItem` and renders a single `CommentReplyComposer` in a fixed spot (right below the comment, above `RepliesSection`) — not inline at the tapped row. The placeholder text ("Reply to {name}...") is what communicates who's being addressed. This was a deliberate simplification over inserting the composer at an arbitrary position inside the replies list: far less layout-reflow complexity, at the cost of the composer not being physically anchored next to the row you tapped.
- **The component never mutates `comments` itself.** `onReplySubmit({ commentId, replyingToUserId, text })` fires once the user sends a reply; the host is expected to update its own `comments` state (append the new `CommentReply`) and pass the new array back down as a prop, same controlled-component pattern as everything else in this library. Confirmed working end-to-end on-device: typed replies via the composer show up correctly, flat-indented, after the host's state update round-trips back through props.

## Layout spacing and safe area (`mediaCommentsGap`, `commentsBottomInset` props)
- `mediaCommentsGap` (default `12`) is a plain `marginTop` on the wrapper around `CommentsList` in `GodiePost`. Added after the media/comments boundary looked too tight by default — was `0` (no gap at all) before this.
- `commentsBottomInset` is applied as `contentContainerStyle={{ paddingBottom }}` on `CommentsList`'s `FlatList`, **not** `style` padding — content-container padding becomes real scrollable space below the last row, whereas `style` padding just shrinks the visible viewport without letting the last item scroll clear of it.
- **Why this isn't automatic:** the component was asked to stop a persistent Android nav bar from covering the last comment. The fix that actually works cross-platform — `useSafeAreaInsets().bottom` from `react-native-safe-area-context`, applied as manual `paddingBottom` — is the standard approach (core RN's `SafeAreaView` no-ops on Android; there's no component shortcut for the bottom edge). The open question was *where* that hook call should live: inside `godieGodie` (forcing `react-native-safe-area-context` as a peer dependency on every consumer) or in the host app (which likely already has the library anyway, e.g. via `react-navigation`). Chose the latter — `commentsBottomInset` is just a number, `GodiePost` stays dependency-free, and the host is in a strictly better position to know it anyway (only the host knows whether it's rendering fullscreen, in a modal, alongside other chrome, etc.). See the `example/src/App.tsx` for the reference implementation (`SafeAreaProvider` + `useSafeAreaInsets()`, only added to the example app's own dependencies — never to the library).

## Comment timestamp rules (implemented in `src/utils/formatCommentTimestamp.ts`)
- `< 1 min`: "Just now"
- `< 1 hour`: "N min ago"
- `<= 2 hours`: "N hour(s) ago"
- same calendar day, `> 2 hours`: device-locale clock time (e.g. "5:40 PM")
- previous calendar day: "Yesterday"
- older: device-locale date (`Intl.DateTimeFormat`, no explicit locale/timeZone — resolves to the viewer's own device settings)

## Known gaps / open questions
- **Video playback is not implemented yet.** `MediaItem` renders a video's poster image with a play-button overlay only — tapping it does not play anything yet. Picking a video library (e.g. `expo-video` vs `react-native-video`) is a real trade-off (Expo-only vs universal RN) that needs a decision before real playback is wired up.
- The top area's "toggle to informational blocks/forms" mode described in the original briefing is **not built yet** — v1 only covers the media (photo/video/carousel) case. `MediaHeader` is deliberately kept as a thin container so this can be added later without reshaping `MediaCarousel`.
- Public prop API so far: `media`, `comments`, `commentTypography`, `commentActions`, `onReplySubmit`. No `onMediaPress`/media-level callbacks yet — add only when a real use case needs them.
- The reply composer has no loading/error/pending state — `onReplySubmit` is fire-and-forget from the component's point of view. If a host's backend call can fail, that's on the host to handle (e.g. show its own toast) since the component doesn't track submission status.
- List virtualization: `CommentsList` uses plain `FlatList` (fine for a demo); revisit `FlashList` only if profiling shows it's needed for large comment lists.
- npm package name: `godiegodie` and `godie-godie` are both unclaimed on the npm registry as of 2026-08-13.
