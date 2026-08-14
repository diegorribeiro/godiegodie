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

## Component tree (v2 — Instagram-style post + fixed composer bar)
```
GodiePost                    (src/components/GodiePost) — owns replyTarget + composerHeight state
├── MediaHeader               fixed-aspect-ratio (1:1) top container
│   └── MediaCarousel         horizontal pager + dots, tracks active index
│       └── MediaItem         single photo, or video poster + play overlay
├── CommentsList               FlatList wrapper, empty state, reserves bottom room for the composer
│   └── CommentItem            avatar + name/timestamp row + text + action area
│       ├── Avatar             image or initials fallback
│       ├── CommentTimestamp   wraps utils/formatCommentTimestamp, fontSize override
│       ├── CommentActionArea  right-aligned row/column of buttons (only if any resolve)
│       │   └── CommentActionButton   fixed-size Pressable, icon + optional label
│       ├── ReplyTrigger       "Reply" text link — reports up to GodiePost, doesn't render its own composer
│       └── RepliesSection     only rendered when comment.replies is non-empty
│           ├── RepliesToggle  "See N replies" / "Hide replies"
│           └── ReplyItem × N  indented reply row (own Avatar, text, ReplyTrigger)
└── CommentComposerBar         only rendered when `currentUser` is set — floats above everything else
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
- **The component never mutates `comments` itself.** `onReplySubmit({ commentId, replyingToUserId, text })` fires once the user sends a reply; the host is expected to update its own `comments` state (append the new `CommentReply`) and pass the new array back down as a prop, same controlled-component pattern as everything else in this library. Confirmed working end-to-end on-device.

## The fixed composer bar (`currentUser`, `onCommentSubmit`, `onReplySubmit`, `composerEmojis` props — "advanced mode")
Originally, tapping "Reply" opened a small inline `TextInput` right under that specific comment (one composer instance per row). That's gone — replaced by a **single** `CommentComposerBar`, shared by both "write a new top-level comment" and "reply to X", matching how current Instagram's bottom comment bar works. `GodiePost` now owns one piece of shared state, `replyTarget: CommentComposerTarget | null` — every `ReplyTrigger` (on a comment or on a reply) reports up to it via `onReplyRequested` instead of managing its own local composer.

- **Only renders when `currentUser` is provided.** No identity, no composing — `GodiePost` is read-only in that case, same as before this feature existed.
- **@mention prefill, not a locked chip.** When `replyTarget` changes, an effect sets the input's text to `@{authorName} ` and calls `.focus()` on it. This is genuinely editable text — the user can delete it — but the actual reply attribution (`commentId`/`replyingToUserId` sent to `onReplySubmit`) comes from `replyTarget` state, never by parsing the text back out. A small "Replying to {name} ✕" banner above the pill is the actual (and only reliable) way to cancel — confirmed on-device.
- **Emoji row** appears only while the `TextInput` is focused (`onFocus`/`onBlur`), tapping an emoji appends it to the current text (`setText(current => current + emoji)`). `composerEmojis` overrides the default set; `[]` hides the row.
- **Growing input:** `multiline` with `maxHeight: 100` — RN's `TextInput` scrolls its own content internally past that height, no extra code needed.
- **Send:** the paper-plane button, or the keyboard's return key (`returnKeyType="send"` + `onSubmitEditing`). `blurOnSubmit={false}` stops RN's own auto-dismiss-on-submit from firing, so keyboard dismissal is entirely decided by `closeOnSend` (default `true`) instead — after a successful send, `Keyboard.dismiss()` runs if `closeOnSend` is `true`; pass `false` to keep the keyboard open for rapid back-to-back comments. Backspacing on an empty input while replying also cancels the reply (`onKeyPress` checking for `Backspace` — a low-friction convenience alongside the explicit ✕).
- **Light/dark aware out of the box**, via the shared theme system (see below) — dark pill (`rgba(0,0,0,0.6)` + white 1px border) with a white send button/black icon in dark mode; light pill with a black send button/white icon otherwise. The pill's own fill/border shades aren't exposed as override props yet — ask if a host needs a different palette. The surrounding band's background color *is* customizable, via `backgroundColor`/`backgroundColorDark`.
- **Layout matches Instagram's own bar, checked against a real screenshot:** the avatar sits *outside* the pill (its own row, left of it), and the send button sits *inside* the pill on the right — the slot Instagram uses for a GIF button. A `borderTopWidth: hairlineWidth` divider on the composer's outer container delimits the whole band (reply banner + emoji row + pill) from the comments scrolling above it.

### Why it's `position: 'absolute'`, floating on its own
The first implementation wrapped all of `GodiePost` in a `KeyboardAvoidingView` so the whole column (media, list, composer) would reflow when the keyboard opened. That broke on-device: `MediaHeader` has a fixed aspect ratio (`width: '100%', aspectRatio: 1`) that never yields height, so on a real tablet the keyboard's vertical footprint left no room for `CommentsList` *and* the composer — the composer got squeezed off-screen entirely, confirmed via screenshot. The fix, per explicit direction: **only the composer bar should float above the keyboard; nothing else should move.**

- `CommentComposerBar`'s root `View` is `position: 'absolute', left: 0, right: 0`, anchored to `GodiePost`'s own box (RN Views are `position: 'relative'` by default, so no extra style is needed on the parent). `MediaHeader`/`CommentsList` are completely unaffected by keyboard state now.
- `bottom` is driven by keyboard height tracked in JS via `Keyboard.addListener` (`keyboardDidShow`/`keyboardDidHide` on Android, `keyboardWillShow`/`keyboardWillHide` on iOS for smoother animation) — **on both platforms**, not just iOS. The first attempt tried to lean on Android's `windowSoftInputMode="adjustResize"` (which shrinks the whole window, so a plain `bottom: 0` would land in the right place "for free") — that turned out unreliable on this test device, likely due to edge-to-edge enforcement on newer Android versions changing how `adjustResize` behaves. Explicit JS-side tracking works the same way regardless of that.
- **Android IME toolbar allowance:** Gboard (and some other keyboards) render their own toolbar (GIF/translate/clipboard/etc.) *above* the actual keys, and `endCoordinates.height` from the keyboard event does not include it — confirmed on-device (the composer rendered correctly per the math, but was visually tucked behind that toolbar strip). `CommentComposerBar` adds a flat `48px` heuristic allowance to the reported keyboard height on Android only. This is a heuristic, not a measurement — there's no reliable way to query IME chrome height from JS — and isn't currently exposed as an override if a specific keyboard needs a different value.
- While the keyboard is visible, `bottom` adds a flat `8px` (`KEYBOARD_GAP`) on top of the tracked keyboard height — without it, the pill's rounded bottom edge sits flush against the keyboard with no breathing room, confirmed on-device.
- At rest (no keyboard), `bottom` is `commentsBottomInset ?? 0` — the same prop used for the Android nav-bar clearance case when there's no composer.
- `CommentComposerBar` reports its own rendered height via `onLayout` → `onHeightChange`; `GodiePost` feeds that into `CommentsList`'s `bottomInset` (`composerHeight + (commentsBottomInset ?? 0)`) so the floating bar never permanently hides the last comment at rest. It can still transiently overlap list content while scrolling, which matches Instagram's own behavior (the bar is a floating overlay, not a layout participant).

## Theme system (`backgroundColor`, `backgroundColorDark` props)
The whole component — media letterboxing, comments list, composer bar band — shares one background color, resolved once in `GodiePost` and distributed via React Context (`src/theme/GodieTheme.tsx`) rather than prop-drilled through every intermediate component (`CommentsList` → `CommentItem` → `RepliesSection` → `ReplyItem`, etc. would all otherwise need to accept and forward a `theme` prop they don't themselves use — a Context is the right tool for a cross-cutting concern like this, not a componentization violation).

- **Detection:** `useColorScheme()` (core RN, no dependency) read once in `GodiePost`.
- **Resolution:** `backgroundColor` (light) / `backgroundColorDark` (dark) props override the defaults; omit either (or both) and `GodiePost` falls back to its own tested defaults — white (`#ffffff`) for light, the same near-black (`#000000`) Instagram itself uses for dark. This was an explicit requirement: hosts that don't care about theming get a correct-looking result with zero configuration.
- **Text color:** deliberately simple for v1 — black in light mode, white in dark mode, for every piece of text in the component (comment author/body, timestamps, "Reply"/"See N replies" labels, action-button labels, composer text). Not independently customizable yet (no per-element color override), and no muted/secondary shade for timestamps or "Reply" links — they're full-strength `textColor` now, same as primary text. This trades away some visual hierarchy for simplicity; revisit with a proper secondary-text color if that's ever needed.
- **Why the composer band needed its own fix:** before this, `CommentComposerBar`'s outer container had no background (transparent), so it looked like a floating pill with comments scrolling visibly behind/around it. Real Instagram's comment bar sits on a solid band matching the screen's background, with no visible seam between "comments area" and "composer area." `CommentComposerBar` now reads the same theme via `useGodieTheme()` (no longer its own separate `useColorScheme()` call) and paints its root container with `theme.backgroundColor`, producing that same seamless look — confirmed on-device against a real Instagram dark-mode screenshot for comparison.
- Any component that renders themed text or backgrounds calls `useGodieTheme()` directly; nothing above it in the tree needs to know or care.

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
- Public prop API so far: `media`, `comments`, `commentTypography`, `commentActions`, `onReplySubmit`, `currentUser`, `onCommentSubmit`, `composerEmojis`, `mediaCommentsGap`, `commentsBottomInset`, `backgroundColor`, `backgroundColorDark`. No `onMediaPress`/media-level callbacks yet — add only when a real use case needs them.
- The composer bar has no loading/error/pending state — `onCommentSubmit`/`onReplySubmit` are fire-and-forget from the component's point of view. If a host's backend call can fail, that's on the host to handle (e.g. show its own toast) since the component doesn't track submission status.
- Text color is a flat black/white split with no override prop and no muted/secondary shade — see "Theme system" above.
- The composer pill's own fill/border shades (as opposed to the surrounding band's `backgroundColor`) aren't independently customizable yet.
- The Android IME-toolbar allowance (`48px`) is a flat heuristic, not measured — could be wrong for keyboards with a taller or shorter toolbar than Gboard's.
- List virtualization: `CommentsList` uses plain `FlatList` (fine for a demo); revisit `FlashList` only if profiling shows it's needed for large comment lists.
- npm package name: `godiegodie` and `godie-godie` are both unclaimed on the npm registry as of 2026-08-13.
