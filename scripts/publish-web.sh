#!/usr/bin/env bash
# Builds the web app and publishes it to GitHub Pages.
# Usage: scripts/publish-web.sh
# Publishes to https://<owner>.github.io/<repo>/ for PAGES_REPO (default chloezql/seal):
# the landing page from web/landing at the root, and the app itself under app/.
# LANDING_ONLY=1 republishes just the landing page and leaves the published app build as it is.
# A full publish keeps the hashed files of earlier builds, so a page that loaded before the publish can still
# fetch its lazy chunks, and every publish stamps the frame and asset URLs so browsers do not reuse cached copies.
# The two EXPO_PUBLIC values are public client values that end up in the bundle anyway.
set -euo pipefail
cd "$(dirname "$0")/.."

PAGES_REPO="${PAGES_REPO:-chloezql/seal}"
export WEB_BASE_URL="/${PAGES_REPO#*/}/app"
export EXPO_PUBLIC_CONVEX_URL="${EXPO_PUBLIC_CONVEX_URL:-https://merry-monitor-753.convex.cloud}"
export EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY="${EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:-pk_test_ZXhhY3QtdGVycmllci05MDk4LmNsZXJrLmFjY291bnRzLmRldiQ}"
export EXPO_PUBLIC_DEMO_MODE="${EXPO_PUBLIC_DEMO_MODE:-1}"

commit="$(git rev-parse --short HEAD)"
stamp_landing() {
  LC_ALL=C perl -pi -e 's#(data-src|href)="app/"#$1="app/?v='"$(date +%s)"'"#g; s#\.(png|jpg|woff2)(?=["\)])#.$1?v='"$(date +%s)"'#g' dist/index.html
}
rm -rf dist
if [ "${LANDING_ONLY:-}" = "1" ]; then
  git clone -q --depth 1 --branch gh-pages "https://github.com/$PAGES_REPO.git" dist
  find dist -mindepth 1 -maxdepth 1 ! -name app ! -name 404.html ! -name .nojekyll ! -name .git -exec rm -rf {} +
  cp -R web/landing/. dist/
  stamp_landing
  cd dist
  git add -A
  git commit -q -m "Publish landing page from $commit"
  git push -q origin gh-pages
else
  npx expo export --platform web --output-dir dist/app
  previous="$(mktemp -d)"
  if git clone -q --depth 1 --branch gh-pages "https://github.com/$PAGES_REPO.git" "$previous" 2>/dev/null; then
    for kept in _expo assets; do
      if [ -d "$previous/app/$kept" ]; then rsync -a --ignore-existing "$previous/app/$kept/" "dist/app/$kept/"; fi
    done
  fi
  rm -rf "$previous"
  cp -R web/landing/. dist/
  stamp_landing
  cp dist/app/index.html dist/404.html
  touch dist/.nojekyll
  cd dist
  git init -q -b gh-pages
  git add -A
  git commit -q -m "Publish web build from $commit"
  git push -f "https://github.com/$PAGES_REPO.git" gh-pages
fi
rm -rf .git
echo "Published https://${PAGES_REPO%%/*}.github.io/${PAGES_REPO#*/}/"
