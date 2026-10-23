import { bootServiceThread, listenForRuntimePort } from '@tiny/runtime';

const appId = new URLSearchParams(window.location.search).get('app') || 'demo';
const generatedBase = `/runtime/apps/${appId}/generated`;
const manifestPromise = fetch(`${generatedBase}/manifest.json`).then((response) => response.json());
const importGenerated = (url) => new Function('url', 'return import(url)')(url);

// Wait for the manifest before announcing readiness: the host delivers the
// message port as soon as it sees the ready message, and any frame that
// arrives before `bootServiceThread` installs its connection is lost.
manifestPromise.then((manifest) => {
  listenForRuntimePort('service', (transport) => {
    bootServiceThread({
      transport,
      manifest,
      initialPath: manifest.pages[0].path,
      loadArtifacts: () => importGenerated(`${generatedBase}/service.js`),
    });
  });
});
