(function () {
  let revealDeck = null;
  const CACHE_PARAM = "v";

  function shouldBypassCache() {
    return window.location.protocol !== "file:";
  }

  function buildCacheStamp() {
    const now = new Date();
    const parts = [
      now.getUTCFullYear(),
      String(now.getUTCMonth() + 1).padStart(2, "0"),
      String(now.getUTCDate()).padStart(2, "0"),
      String(now.getUTCHours()).padStart(2, "0"),
      String(now.getUTCMinutes()).padStart(2, "0"),
    ];

    return parts.join("");
  }

  function ensureCacheVersion() {
    if (!shouldBypassCache()) return false;

    const url = new URL(window.location.href);
    if (url.searchParams.has(CACHE_PARAM)) return false;

    url.searchParams.set(CACHE_PARAM, buildCacheStamp());
    window.location.replace(url.toString());
    return true;
  }

  function getCacheVersion() {
    return new URLSearchParams(window.location.search).get(CACHE_PARAM);
  }

  function isLocalAssetUrl(url) {
    return (
      url.origin === window.location.origin &&
      !url.pathname.startsWith("/cdn-cgi/") &&
      !url.pathname.endsWith(".json")
    );
  }

  function applyCacheVersion(urlString, version) {
    if (!version) return urlString;
    if (!urlString) return urlString;
    if (
      urlString.startsWith("data:") ||
      urlString.startsWith("blob:") ||
      urlString.startsWith("javascript:") ||
      urlString.startsWith("mailto:") ||
      urlString.startsWith("tel:")
    ) {
      return urlString;
    }

    const resolved = new URL(urlString, window.location.href);
    if (!isLocalAssetUrl(resolved)) return urlString;

    resolved.searchParams.set(CACHE_PARAM, version);
    return resolved.toString();
  }

  function propagateCacheVersion() {
    const version = getCacheVersion();
    if (!version) return;

    document.querySelectorAll("a[href]").forEach((link) => {
      link.href = applyCacheVersion(link.getAttribute("href"), version);
    });

    document.querySelectorAll("img[src]").forEach((image) => {
      image.src = applyCacheVersion(image.getAttribute("src"), version);
    });
  }

  function isSnapshotMode() {
    return new URLSearchParams(window.location.search).get("snapshot") === "1";
  }

  function enableSnapshotMode() {
    if (isSnapshotMode()) {
      document.documentElement.classList.add("snapshot");
      document.body.classList.add("snapshot");
    }
  }

  async function initReveal() {
    if (!document.querySelector(".reveal")) return;
    if (typeof Reveal === "undefined") return;

    const deck = new Reveal({
      hash: false,
      controls: false,
      progress: false,
      center: false,
      embedded: false,
      slideNumber: "c/t",
      transition: "none",
      width: 1400,
      height: 875,
      margin: 0.04,
      disableLayout: false,
    });

    await deck.initialize();
    revealDeck = deck;
  }

  function installKeyboardNav() {
    const next = document.body.dataset.next;
    const prev = document.body.dataset.prev;
    const home = document.body.dataset.home || "index.html";
    const version = getCacheVersion();

    function navigate(url) {
      if (url) window.location.href = applyCacheVersion(url, version);
    }

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const isEditable =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (isEditable) return;

      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        const fragments = revealDeck?.availableFragments?.();
        if (fragments?.next) {
          event.preventDefault();
          revealDeck.next();
          return;
        }

        if (next) {
          event.preventDefault();
          navigate(next);
          return;
        }
      }

      if (event.key === "ArrowLeft" || event.key === "PageUp" || event.key === "Backspace") {
        const fragments = revealDeck?.availableFragments?.();
        if (fragments?.prev) {
          event.preventDefault();
          revealDeck.prev();
          return;
        }

        if (prev) {
          event.preventDefault();
          navigate(prev);
          return;
        }
      }

      if ((event.key === "Home" || event.key === "Escape") && home) {
        event.preventDefault();
        navigate(home);
      }
    });
  }

  if (ensureCacheVersion()) return;

  window.addEventListener("DOMContentLoaded", async () => {
    propagateCacheVersion();
    enableSnapshotMode();
    await initReveal();
    installKeyboardNav();
  });
})();
