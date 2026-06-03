#!/bin/sh
# Launcher for the preview server. Uses webpack instead of Turbopack: Turbopack
# spawns a child "node pooled process" for PostCSS/Tailwind that fails under the
# preview spawner's environment. Webpack compiles CSS in-process and is reliable.
export PATH="$HOME/.local/node/bin:$PATH"
cd /Users/sabianlopez/lifted-platform
exec node node_modules/next/dist/bin/next dev --webpack
