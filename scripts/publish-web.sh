#!/usr/bin/env bash
# Builds the web app and publishes it to GitHub Pages.
# Usage: scripts/publish-web.sh
# Publishes to https://<owner>.github.io/<repo>/ for PAGES_REPO (default chloezql/seal):
# the landing page from web/landing at the root, and the app itself under app/.
# The two EXPO_PUBLIC values are public client values that end up in the bundle anyway.
set -euo pipefail
cd "$(dirname "$0")/.."

PAGES_REPO="${PAGES_REPO:-chloezql/seal}"
export WEB_BASE_URL="/${PAGES_REPO#*/}/app"
export EXPO_PUBLIC_CONVEX_URL="${EXPO_PUBLIC_CONVEX_URL:-https://merry-monitor-753.convex.cloud}"
export EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY="${EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:-pk_test_ZXhhY3QtdGVycmllci05MDk4LmNsZXJrLmFjY291bnRzLmRldiQ}"
export EXPO_PUBLIC_DEMO_MODE="${EXPO_PUBLIC_DEMO_MODE:-1}"

rm -rf dist
npx expo export --platform web --output-dir dist/app
cp web/landing/* dist/
cp dist/app/index.html dist/404.html
touch dist/.nojekyll

commit="$(git rev-parse --short HEAD)"
cd dist
git init -q -b gh-pages
git add -A
git commit -q -m "Publish web build from $commit"
git push -f "https://github.com/$PAGES_REPO.git" gh-pages
rm -rf .git
echo "Published https://${PAGES_REPO%%/*}.github.io/${PAGES_REPO#*/}/"
