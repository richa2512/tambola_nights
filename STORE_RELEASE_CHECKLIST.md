# Store Release Checklist

## App Identity

- Confirm final app name: `Tambola Housie`.
- Confirm permanent bundle/package ID before first submission: `com.tambola.housie`.
- Replace placeholder support email in `app/privacy/page.tsx`.
- Publish the privacy policy URL from the production domain and add it in App Store Connect and Play Console.

## Build Commands

```bash
npm run mobile:build
npm run mobile:ios
npm run mobile:android
```

`mobile:build` creates a static Next export and syncs it into Capacitor's native projects.

## iOS App Store

- Open `ios/App/App.xcworkspace` in Xcode.
- Set Signing & Capabilities with your Apple Developer team.
- Set version and build number.
- Replace default icons and launch assets with final production artwork.
- Archive from Xcode and upload to App Store Connect.
- Test through TestFlight before App Review.

## Google Play

- Open `android/` in Android Studio.
- Confirm signing config for a release App Bundle.
- Build a release `.aab`.
- Upload the bundle in Play Console.
- Complete Data Safety, privacy policy, content rating, target audience, and store listing.

## Store Readiness

- Test host, sub-admin, tickets, and player flows on real iOS and Android devices.
- Test poor network and reconnect behavior during an active game.
- Verify Firebase production rules and API-key domain/app restrictions.
- Replace placeholder legal text with final privacy and terms content.
- Use final PNG app icons and screenshots for every required store size.
