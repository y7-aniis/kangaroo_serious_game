# Wellington Road — 100-point challenge

A first-person kangaroo roadstrike learning game. Driving contributes 80 points and knowledge questions contribute up to 20, with a configurable safety override and 0–3 stars.

## Run locally

From this repository, run `python3 -m http.server 8768`, then open http://localhost:8768/game-100/. Use an HTTP server; opening index.html as a file will not load ES modules and models correctly.

## Included

- Driving scene, terrain, vegetation, cockpit and kangaroo animations.
- Opening and ending cinematics, sound, tutorial and results.
- Phone animation and wildlife rescue handover for severe injury and a joey found in the deceased animal's pouch, after the original response steps.

The folders beside game-100 contain runtime dependencies and must be kept when deploying. The root index redirects to the game. No build step is required. GitHub Pages is not automatically enabled by this upload.

## Continuing development

Edit files, test locally, commit and push updates. The local authoring project remains separate and includes Blender source files and independent art previews. This repository contains the playable web version.

## Assets

See game-100/art/ATTRIBUTION.md for available credits. Third-party models, fonts, photos and audio retain their original owners' rights; this repository does not grant a blanket license to redistribute them. Some supplied downloads had no license file.

Phone source and animation: user-supplied FPS arms asset; editable Blender scene retained in the local authoring project.
