import { bootServiceThread, listenForRuntimePort } from '@tiny/runtime';

const manifestPromise = fetch('/runtime/generated/manifest.json').then((response) => response.json());
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
      loadArtifacts: () => importGenerated('/runtime/generated/service.js'),
    });
  });
});
