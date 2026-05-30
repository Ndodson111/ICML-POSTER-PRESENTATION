(function () {
  let revealDeck = null;

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

    function navigate(url) {
      if (url) window.location.href = url;
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

      if ((event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") && next) {
        const fragments = revealDeck?.availableFragments?.();
        if (fragments?.next) {
          event.preventDefault();
          revealDeck.next();
          return;
        }

        event.preventDefault();
        navigate(next);
        return;
      }

      if ((event.key === "ArrowLeft" || event.key === "PageUp" || event.key === "Backspace") && prev) {
        const fragments = revealDeck?.availableFragments?.();
        if (fragments?.prev) {
          event.preventDefault();
          revealDeck.prev();
          return;
        }

        event.preventDefault();
        navigate(prev);
        return;
      }

      if ((event.key === "Home" || event.key === "Escape") && home) {
        event.preventDefault();
        navigate(home);
      }
    });
  }

  window.addEventListener("DOMContentLoaded", async () => {
    enableSnapshotMode();
    await initReveal();
    installKeyboardNav();
  });
})();
