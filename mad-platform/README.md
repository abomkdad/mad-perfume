# MAD Platform Release Prep

This folder captures the Codex-prepared mobile store release work for the `MAD PERFUME` project without disturbing the existing website content in this repository.

It includes:

- store-release documentation
- deploy-portal privacy, account-deletion, and support pages
- iOS profile xcconfig fix needed for Flutter/Xcode builds
- release-prep overlay files under `mad-platform/overlay/...`

Important current blockers:

- Android is not publishable yet from Google Play because the new Play Console account still needs final setup and app creation, and `com.madperfume.customer` is not yet present in Play Console.
- iOS is not publishable yet from this Mac because no Apple Developer account, team, or valid code-signing identities are configured in Xcode.
- The public store-policy pages were implemented, but the private Sites deployment used during preparation is not publicly accessible for store reviewers.
- The Flutter customer app still contains demo/skeleton content and likely needs product-readiness work before store submission.

Key reference document:

- `mad-platform/overlay/docs/mobile-store-release.md`

The files here are organized as an overlay patch. Apply them onto the local project rooted at `mad-perfume-platform-source/project`.
