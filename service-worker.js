/* ==========================================================================
   service-worker.js — a kill switch, on purpose. The real worker is sw.js.

   Every phone that has ever opened this shop registered a worker at THIS
   address. That worker serves the stylesheet and the script from its own
   store, and hands back a stored copy of the page whenever the network
   stumbles — which, on the connections this shop's customers actually have,
   is often. The result was a phone that kept drawing a design published
   months ago and had no way out: the instructions for clearing the old files
   lived inside the new page, and the old files were what stopped the new page
   arriving. Nothing shipped inside the shop could break that circle.

   One thing does escape it. A browser re-fetches the worker script itself
   from the network, on its own schedule, without asking the old worker's
   permission. So this address stops being a worker and becomes the way out:
   it throws away every stored file, unregisters itself, and reloads whatever
   tabs are open. A phone that runs this ends up with no worker and no store,
   which means the next thing it draws comes from the website.

   It deliberately has no fetch handler. While it is installed, every request
   goes straight to the network.

   The shop then registers the real worker at its new address, sw.js, and
   offline support returns on the next visit. This file has to stay here and
   stay a kill switch — deleting it would leave a 404, and a 404 does not
   replace a worker that is already installed.
   ========================================================================== */

self.addEventListener('install', () => {
  // Do not wait for the old worker's tabs to close; there may not be any.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (e) {}

    try { await self.registration.unregister(); } catch (e) {}

    /* Reload anything open. Without this the customer keeps looking at the
       stale page already on screen until they happen to navigate again. */
    try {
      const windows = await self.clients.matchAll({ type: 'window' });
      windows.forEach((client) => {
        if (client.navigate) client.navigate(client.url);
      });
    } catch (e) {}
  })());
});
