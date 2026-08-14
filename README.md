# godieGodie

A dynamic React Native component: a fixed media header (photo/video/carousel) plus a scrollable comments section below, with a fixed comment/reply composer bar — similar in spirit to an Instagram post.

> 🚧 Work in progress — API not stable yet, not published to npm.
>
> A toggle between the media header and informational blocks/forms (mentioned in the original brief) is **not built yet** — v1 only covers the media case. See `docs/ARCHITECTURE.md` → "Known gaps" for the current state.

## Install

```sh
npm install godiegodie
```

## Usage

```tsx
import { GodiePost, type Comment, type MediaItem } from 'godiegodie';

const media: MediaItem[] = [
  { type: 'photo', id: '1', uri: 'https://example.com/photo.jpg' },
];

const comments: Comment[] = [
  {
    id: '1',
    author: { id: 'u1', name: 'Ana' },
    text: 'Nice!',
    createdAt: Date.now(),
  },
];

<GodiePost media={media} comments={comments} />;
```

See [`example/`](./example) for a runnable demo app, and [`/docs`](./docs) for architecture details.

## Media

`media` accepts one or more photos and videos, shown in a swipeable carousel (with pagination dots when there's more than one) at a fixed 1:1 aspect ratio:

```tsx
const media: MediaItem[] = [
  { type: 'photo', id: '1', uri: 'https://example.com/photo.jpg' },
  {
    type: 'video',
    id: '2',
    uri: 'https://example.com/video.mp4',
    posterUri: 'https://example.com/video-poster.jpg',
  },
];
```

**Video does not play yet.** A `'video'` item currently renders as its `posterUri` image with a play-button icon overlaid — tapping it doesn't do anything yet. Picking a video library to wire up real playback (`expo-video` vs `react-native-video`) is a deliberate open decision — see `docs/ARCHITECTURE.md` — so budget for that if your use case needs actual video playback today.

## Customizing comment typography

`commentTypography` lets the host app control font family and size at the three comment text spots — the author name, the comment body, and the timestamp. `fontFamily` is never loaded by the library; pass the name of a font already available in your app (a system font, or one you've already linked/loaded yourself):

```tsx
<GodiePost
  media={media}
  comments={comments}
  commentTypography={{
    authorName: { fontFamily: 'Poppins-SemiBold', fontSize: 16 },
    text: { fontFamily: 'Poppins-Regular', fontSize: 15 },
    timestamp: { fontSize: 11 },
  }}
/>
```

## Adding action buttons to each comment

`commentActions` puts one or more buttons to the right of every comment row (`direction: 'row'` for side by side, `'column'` — the default — to stack them). Sizes are a fixed small/medium/large scale on purpose, so a button can never push the avatar/text out of alignment.

Icons are plain `ReactNode` — bring whatever icon set your app already uses (FontAwesome, Material Icons, an SVG, an emoji). The library doesn't ship or depend on any icon library itself, so installing it never requires linking icon fonts.

`onPress` is your own function; the component only calls it back with the `comment` that was clicked — what happens next (open a modal already on your screen, navigate, call an API) is entirely up to your app:

```tsx
const [donateModalVisible, setDonateModalVisible] = useState(false);

<GodiePost
  media={media}
  comments={comments}
  commentActions={{
    direction: 'row',
    buttons: [
      {
        id: 'donate',
        icon: <FontAwesomeIcon icon={faHandHoldingDollar} />, // your own icon set
        accessibilityLabel: 'Donate',
        onPress: () => setDonateModalVisible(true), // your own state/modal
      },
    ],
  }}
/>
<DonateModal visible={donateModalVisible} onClose={() => setDonateModalVisible(false)} />
```

`buttons` can also be a function `(comment) => CommentActionButton[]` when different comments need different buttons (return `[]` for comments that should show none).

## Replies

Every comment can carry `replies` — single-level only, an Instagram-style flat thread (a reply never has replies of its own). They're hidden by default behind a "See N replies" toggle; once expanded, every reply renders at the same indentation, whether it's the 1st or the 34th.

Each comment (and each reply) gets a "Reply" link — tapping it activates the fixed composer bar at the bottom (see below). `GodiePost` never mutates your `comments` itself; when the user sends a reply, `onReplySubmit` fires with everything you need to build the new reply and update your own state.

## Comment composer bar (advanced mode)

Pass `currentUser` (your logged-in user's `id`/`name`/`avatarUri`) and `GodiePost` renders a fixed comment bar at the bottom — an avatar-left, pill-shaped input with a send button, matching current Instagram. It's the single input for **both** writing a brand-new top-level comment and replying: tapping "Reply" on any comment/reply prefills `@name` and shows a small dismissible "Replying to {name}" banner above the bar; sending with no active reply calls `onCommentSubmit(text)`, sending while replying calls `onReplySubmit({ commentId, replyingToUserId, text })`.

```tsx
const currentUser = { id: 'me', name: 'You', avatarUri: 'https://…' };
const [comments, setComments] = useState(initialComments);

function handleCommentSubmit(text) {
  setComments((current) => [
    ...current,
    { id: `comment-${Date.now()}`, author: currentUser, text, createdAt: Date.now() },
  ]);
}

function handleReplySubmit({ commentId, replyingToUserId, text }) {
  setComments((current) =>
    current.map((comment) =>
      comment.id !== commentId
        ? comment
        : {
            ...comment,
            replies: [
              ...(comment.replies ?? []),
              {
                id: `reply-${Date.now()}`,
                author: currentUser,
                text,
                createdAt: Date.now(),
                replyingToAuthorId: replyingToUserId,
              },
            ],
          }
    )
  );
}

<GodiePost
  media={media}
  comments={comments}
  currentUser={currentUser}
  onCommentSubmit={handleCommentSubmit}
  onReplySubmit={handleReplySubmit}
/>;
```

Other notes:
- Omit `currentUser` and the bar simply doesn't render — `GodiePost` is read-only, same as before this feature existed.
- `composerEmojis` overrides the quick-pick emoji row shown while the input is focused (defaults to a small curated set); pass `[]` to hide it.
- The bar automatically follows the system light/dark theme and floats above the keyboard on its own — it doesn't push your media or comments list around when it opens.
- Multiline input grows up to a max height, then scrolls internally, same as the message box in most chat apps.
- `closeOnSend` (default `true`) dismisses the keyboard right after a comment/reply is sent. Pass `false` if you'd rather keep it open for rapid back-to-back comments.

## Theming (light/dark)

The whole component — media area, comments list, and the composer bar — shares one background color, and text switches between black (light mode) and white (dark mode) automatically, detected via the device's own theme setting. You don't need to do anything for this to work correctly; it's on by default.

If you want a background color other than the tested defaults (white in light mode, the same near-black Instagram itself uses in dark mode), pass your own:

```tsx
<GodiePost
  media={media}
  comments={comments}
  backgroundColor="#ffffff"     // light mode
  backgroundColorDark="#000000" // dark mode
/>
```

Leave either one out and that mode falls back to the tested default — so a host that doesn't care about theming gets a correct-looking result with zero configuration. Text color isn't independently customizable yet (it's a simple black/white split tied to the resolved background) — ask if you need finer control.

## Layout: spacing and safe area

`mediaCommentsGap` (default `12`) controls the gap between the media header and the comments list, in case the default feels too tight or too loose for your design.

`commentsBottomInset` leaves extra scroll room below the last comment, so it doesn't end up hidden behind a system bar — e.g. Android's persistent gesture/nav bar. `GodiePost` has no way to know about that chrome itself (it doesn't know if it's rendered fullscreen, inside a modal, split with other UI, etc.), so it doesn't pull in `react-native-safe-area-context` to guess — you measure the inset in your own app (typically with `useSafeAreaInsets()`, if you already have that library — most RN apps already do, since `react-navigation` depends on it) and pass the number down:

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Post() {
  const insets = useSafeAreaInsets();

  return (
    <GodiePost
      media={media}
      comments={comments}
      commentsBottomInset={insets.bottom}
    />
  );
}
```

## Running the example app

`/example` is a bare React Native CLI app (real `android/`/`ios/` projects — no Expo/Expo Go involved), so any physical device or emulator works via the standard toolchain:

```sh
yarn install               # from the repo root
yarn example start         # Metro dev server
yarn example android       # build + install + launch on a connected device/emulator
yarn example ios           # (macOS only)
```

If `yarn example android` fails to invoke `gradlew.bat` on Windows (a known `@react-native-community/cli` quirk in some setups), build and install manually instead:

```sh
cd example/android && ./gradlew.bat assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb reverse tcp:8081 tcp:8081   # only needed over USB
# with `yarn example start` running in another terminal, launch the app from the device's home screen
```

## Docs

See [`/docs`](./docs) for architecture and usage details.

## License

MIT
