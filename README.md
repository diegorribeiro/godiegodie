# godieGodie

A dynamic React Native component: a top area that toggles between media (photos/videos) and informational blocks/forms, plus a scrollable bottom area for comments or complementary content — similar in spirit to an Instagram post.

> 🚧 Work in progress — API not stable yet, not published to npm.

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

Each comment (and each reply) gets a "Reply" link. Tapping it opens an inline composer (a `TextInput` + Send/Cancel) built into the component. `GodiePost` never mutates your `comments` itself — when the user sends a reply, `onReplySubmit` fires with everything you need to build the new reply and update your own state:

```tsx
const [comments, setComments] = useState(initialComments);

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
                author: currentUser, // whoever's logged in
                text,
                createdAt: Date.now(),
                replyingToAuthorId: replyingToUserId,
              },
            ],
          }
    )
  );
}

<GodiePost media={media} comments={comments} onReplySubmit={handleReplySubmit} />;
```

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
