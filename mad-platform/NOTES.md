# Additional Release Context

This GitHub overlay intentionally focuses on the release-preparation files and documentation that were directly edited for store readiness.

Local context that still matters:

- `apps/customer_app/ios/Runner.xcodeproj/project.pbxproj` was adjusted locally so the Flutter iOS profile configuration resolves correctly with the added `Profile.xcconfig`.
- A locally built Android artifact existed during preparation at `apps/customer_app/releases/app-release.aab`, but build artifacts were not mirrored into this repository overlay.
- Google Play publishing is still blocked until the new Play Console account is fully set up and the `com.madperfume.customer` app record exists.
- Apple publishing is still blocked until Xcode has an Apple Developer account, a selected Team, and valid signing identities on the Mac.
- The current Flutter customer app still contains demo/skeleton content and needs product-readiness work before store submission.
