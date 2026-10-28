import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';
import { defineConfig } from 'vite';

const root = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(root, '../..');
// Optional overrides let the website build package the same devtool into an
// isolated directory with only the fixtures it ships.
const outputDir = process.env.TINY_DEVTOOL_OUT_DIR
  ? path.resolve(process.env.TINY_DEVTOOL_OUT_DIR)
  : path.join(root, 'dist');
const runtimeDir = process.env.TINY_DEVTOOL_RUNTIME_ROOT
  ? path.resolve(process.env.TINY_DEVTOOL_RUNTIME_ROOT)
  : path.join(root, 'static/runtime');

/**
 * The generated mini-program artifacts are not part of the bundle: they are
 * fetched at runtime from `./runtime`, so a production build has to ship the
 * fixture tree next to the entry documents (the previous rspack build used
 * CopyRspackPlugin for this).
 */
function copyRuntimeArtifacts() {
  return {
    name: 'devtool:copy-runtime-artifacts',
    apply: 'build',
    closeBundle() {
      if (!fs.existsSync(runtimeDir)) return;
      fs.cpSync(runtimeDir, path.join(outputDir, 'runtime'), { recursive: true });
    },
  };
}

/**
 * Serve `runtime/` from disk on every request during development.
 *
 * `publicDir` is not enough: Vite snapshots the public files when the server
 * starts and only learns about later additions through its file watcher. The
 * fixture compilers write the manifests, styles, and scripts after the dev
 * server is already running, so those requests would fall through to the SPA
 * fallback, return `index.html`, and fail as "not valid JSON". Serving from
 * disk also lets missing artifacts answer 404 instead of HTML.
 */
function serveRuntimeArtifacts() {
  return {
    name: 'devtool:serve-runtime-artifacts',
    apply: 'serve',
    configureServer(server) {
      const serve = sirv(runtimeDir, {
        dev: true,
        etag: true,
        extensions: [],
        setHeaders(res, filePath) {
          if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'text/javascript');
          res.setHeader('Cache-Control', 'no-cache');
        },
      });
      // Registered in `configureServer`, so this runs before Vite's HTML
      // fallback middleware.
      server.middlewares.use('/runtime', (req, res, next) => {
        serve(req, res, () => {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end(`Not found: /runtime${req.url}`);
        });
      });
    },
  };
}

export default defineConfig(({ command, isPreview }) => {
  const isDev = command === 'serve' && !isPreview;

  return {
    root,
    // A production build must stay relocatable: the website serves it from
    // /devtool/ (and GitHub Pages adds /<repo>/ in front of that), while the
    // dev server still needs root-absolute URLs for its HMR client.
    base: isDev ? '/' : './',
    // Compiled fixtures are served by `serveRuntimeArtifacts()` in development
    // and copied by `copyRuntimeArtifacts()` in production. Vite's publicDir
    // would only serve the files it saw when the dev server started.
    publicDir: false,
    resolve: {
      alias: {
        '@': path.join(root, 'src'),
        // These workspace packages are linked from the monorepo and some of
        // them only build to CommonJS. Vite loads ESM in the browser, so
        // resolve them from source the same way tests/host does.
        '@tiny/runtime': path.join(workspaceRoot, 'packages/runtime/src/index.ts'),
        '@tiny/host-browser': path.join(workspaceRoot, 'hosts/browser/src/index.ts'),
        '@tiny/host-web-components': path.join(workspaceRoot, 'hosts/web-components/src/index.ts'),
        '@tiny/manifest': path.join(workspaceRoot, 'packages/manifest/src/index.ts'),
      },
    },
    esbuild: {
      // Keep the classic React 17 transform the rspack build used.
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
    },
    plugins: [copyRuntimeArtifacts(), serveRuntimeArtifacts()],
    server: {
      port: Number(process.env.TINY_DEVTOOL_PORT || 8080),
      hot: true,
      // `scripts/dev-devtool.mjs` rewrites the compiled fixtures on every
      // source edit. They are served on demand, so watching them would only
      // add churn (and occasional full reloads for generated HTML).
      watch: {
        ignored: [
          `${path.join(root, 'static')}/**`,
          `${path.join(root, 'dist')}/**`,
        ],
      },
    },
    build: {
      outDir: outputDir,
      // `TINY_DEVTOOL_OUT_DIR` can point outside the package (website build).
      emptyOutDir: true,
      target: 'es2015',
      sourcemap: false,
      rollupOptions: {
        input: {
          // The entry names become the emitted `nextHost.js` / `nextService.js`
          // / `nextRender.js` that the site build and the service+render
          // iframes expect.
          nextHost: path.join(root, 'index.html'),
          nextService: path.join(root, 'service.html'),
          nextRender: path.join(root, 'render.html'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: 'chunks/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
  };
});
