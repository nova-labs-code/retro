// RetroStyle Web Content Script v3.0
// Dynamic Real-Time CRT Engine
//
// PURPOSE
// ------------------------------------------------------------
// Applies a retro CRT appearance to normal webpage content
// while protecting:
//
//   - images
//   - videos
//   - canvas
//   - <picture>
//   - SVG <image>
//   - iframes
//
// The retro theme is a TINT / DISPLAY EFFECT.
// It does NOT replace webpage backgrounds with a solid color.
//
// Popup controls supported:
//
//   theme
//   font
//   scanlines
//   curvature
//   flicker
//   pixelation
//   brightness
//   contrast
//   hueShift
//   noise
//


(function () {
  "use strict";


  /* ==========================================================
     ROOT
     ========================================================== */

  const htmlEl = document.documentElement;


  /* ==========================================================
     MEDIA PROTECTION
     ========================================================== */

  const MEDIA_SELECTOR = [
    "img",
    "video",
    "canvas",
    "picture",
    "svg image",
    "iframe"
  ].join(",");


  /*
   * Store original inline styles so they can be restored.
   */
  const protectedMedia = new WeakMap();


  function protectMedia(root = document) {

    try {

      const media = root.querySelectorAll
        ? root.querySelectorAll(MEDIA_SELECTOR)
        : [];


      media.forEach((el) => {

        /*
         * Don't save our own values twice.
         */
        if (!protectedMedia.has(el)) {

          protectedMedia.set(el, {
            filter:
              el.style.getPropertyValue("filter"),

            filterPriority:
              el.style.getPropertyPriority("filter"),

            mixBlendMode:
              el.style.getPropertyValue("mix-blend-mode"),

            mixBlendModePriority:
              el.style.getPropertyPriority("mix-blend-mode"),

            opacity:
              el.style.getPropertyValue("opacity"),

            opacityPriority:
              el.style.getPropertyPriority("opacity")
          });

        }


        el.classList.add(
          "retro-media-protected"
        );


        /*
         * Media must remain completely original.
         */

        el.style.setProperty(
          "filter",
          "none",
          "important"
        );

        el.style.setProperty(
          "mix-blend-mode",
          "normal",
          "important"
        );

        el.style.setProperty(
          "opacity",
          "1",
          "important"
        );

      });

    } catch (error) {

      console.debug(
        "RetroStyle media protection error:",
        error
      );

    }

  }


  function restoreInlineProperty(
    el,
    property,
    value,
    priority
  ) {

    if (value) {

      el.style.setProperty(
        property,
        value,
        priority || ""
      );

    } else {

      el.style.removeProperty(
        property
      );

    }

  }


  function unprotectMedia() {

    try {

      const media = document.querySelectorAll(
        ".retro-media-protected"
      );


      media.forEach((el) => {

        const original =
          protectedMedia.get(el);


        el.classList.remove(
          "retro-media-protected"
        );


        if (original) {

          restoreInlineProperty(
            el,
            "filter",
            original.filter,
            original.filterPriority
          );

          restoreInlineProperty(
            el,
            "mix-blend-mode",
            original.mixBlendMode,
            original.mixBlendModePriority
          );

          restoreInlineProperty(
            el,
            "opacity",
            original.opacity,
            original.opacityPriority
          );

          protectedMedia.delete(el);

        } else {

          el.style.removeProperty(
            "filter"
          );

          el.style.removeProperty(
            "mix-blend-mode"
          );

          el.style.removeProperty(
            "opacity"
          );

        }

      });

    } catch (error) {

      console.debug(
        "RetroStyle media cleanup error:",
        error
      );

    }

  }


  /* ==========================================================
     CLEAR RETRO SETTINGS
     ========================================================== */

  function clearRetroStyles() {

    htmlEl.classList.remove(
      "retro-filter-active"
    );


    htmlEl.removeAttribute(
      "data-retro-theme"
    );


    const properties = [

      "--retro-scanlines",
      "--retro-curvature",
      "--retro-flicker",
      "--retro-pixelation",
      "--retro-brightness",
      "--retro-contrast",
      "--retro-hue",
      "--retro-noise",

      "--retro-font",

      "--retro-text-color",
      "--retro-text-rgb",

      "--retro-tint",
      "--retro-tint-opacity",
      "--retro-glow"

    ];


    properties.forEach(
      (property) => {

        htmlEl.style.removeProperty(
          property
        );

      }
    );


    unprotectMedia();

  }


  /* ==========================================================
     APPLY SETTINGS
     ========================================================== */

  function applySettings(settings) {

    settings =
      settings || {};


    const currentHost =
      window.location.hostname;


    const currentUrl =
      window.location.href.split("#")[0];


    const disabledSites =
      Array.isArray(
        settings.disabledSites
      )
        ? settings.disabledSites
        : [];


    const disabledPages =
      Array.isArray(
        settings.disabledPages
      )
        ? settings.disabledPages
        : [];


    const isSiteDisabled =
      disabledSites.includes(
        currentHost
      );


    const isPageDisabled =
      disabledPages.includes(
        currentUrl
      );


    /* ========================================================
       DISABLED
       ======================================================== */

    if (
      !settings.enabled ||
      isSiteDisabled ||
      isPageDisabled
    ) {

      clearRetroStyles();

      return;

    }


    /* ========================================================
       ENABLE
       ======================================================== */

    htmlEl.classList.add(
      "retro-filter-active"
    );


    htmlEl.setAttribute(
      "data-retro-theme",
      settings.theme ||
        "green_crt"
    );


    /* ========================================================
       HARDWARE VARIABLES
       ======================================================== */

    htmlEl.style.setProperty(
      "--retro-scanlines",
      clamp(
        settings.scanlines ?? 50,
        0,
        100
      ) / 100
    );


    htmlEl.style.setProperty(
      "--retro-curvature",
      clamp(
        settings.curvature ?? 30,
        0,
        100
      ) / 100
    );


    htmlEl.style.setProperty(
      "--retro-flicker",
      clamp(
        settings.flicker ?? 20,
        0,
        100
      ) / 100
    );


    htmlEl.style.setProperty(
      "--retro-pixelation",
      `${clamp(
        settings.pixelation ?? 0,
        0,
        5
      )}px`
    );


    htmlEl.style.setProperty(
      "--retro-brightness",
      `${clamp(
        settings.brightness ?? 100,
        50,
        150
      )}%`
    );


    htmlEl.style.setProperty(
      "--retro-contrast",
      `${clamp(
        settings.contrast ?? 120,
        50,
        200
      )}%`
    );


    htmlEl.style.setProperty(
      "--retro-hue",
      `${clamp(
        settings.hueShift ?? 0,
        0,
        360
      )}deg`
    );


    htmlEl.style.setProperty(
      "--retro-noise",
      clamp(
        settings.noise ?? 10,
        0,
        100
      ) / 100
    );


    /* ========================================================
       FONT
       ======================================================== */

    const font =
      settings.font ||
      "VT323";


    /*
     * Basic escaping for the CSS variable.
     */
    const safeFont =
      String(font)
        .replace(/\\/g, "")
        .replace(/'/g, "");


    htmlEl.style.setProperty(
      "--retro-font",
      `'${safeFont}', monospace`
    );


    /* ========================================================
       IMPORTANT
       ========================================================

       The theme colors are primarily defined by CSS.

       We intentionally do NOT set:

           background-color: themeColor

       here.

       The theme is a tint.
       ======================================================== */


    /* ========================================================
       PROTECT MEDIA
       ======================================================== */

    protectMedia();

  }


  /* ==========================================================
     CLAMP
     ========================================================== */

  function clamp(
    value,
    min,
    max
  ) {

    value =
      Number(value);


    if (!Number.isFinite(value)) {
      return min;
    }


    return Math.min(
      max,
      Math.max(
        min,
        value
      )
    );

  }


  /* ==========================================================
     LOAD SETTINGS
     ========================================================== */

  chrome.storage.sync.get(

    {

      enabled:
        true,

      disabledSites:
        [],

      disabledPages:
        [],


      theme:
        "green_crt",


      scanlines:
        50,

      curvature:
        30,

      flicker:
        20,

      pixelation:
        0,


      brightness:
        100,

      contrast:
        120,

      hueShift:
        0,


      noise:
        10,


      font:
        "VT323"

    },


    (items) => {

      applySettings(
        items
      );

    }

  );


  /* ==========================================================
     LIVE POPUP CHANGES
     ========================================================== */

  chrome.storage.onChanged.addListener(
    (changes, area) => {

      if (
        area !== "sync"
      ) {
        return;
      }


      /*
       * Don't wait for individual values.
       * Get the complete current settings.
       */

      chrome.storage.sync.get(
        null,
        (allSettings) => {

          applySettings(
            allSettings
          );

        }
      );

    }
  );


  /* ==========================================================
     MUTATION OBSERVER
     ========================================================== */

  let mutationTimer =
    null;


  const observer =
    new MutationObserver(
      () => {

        if (mutationTimer) {
          return;
        }


        mutationTimer =
          setTimeout(
            () => {

              mutationTimer =
                null;


              if (
                htmlEl.classList.contains(
                  "retro-filter-active"
                )
              ) {

                protectMedia();

              }

            },
            100
          );

      }
    );


  observer.observe(
    document.documentElement,
    {

      childList:
        true,

      subtree:
        true

    }
  );


  /* ==========================================================
     INITIAL MEDIA PROTECTION
     ========================================================== */

  if (
    htmlEl.classList.contains(
      "retro-filter-active"
    )
  ) {

    protectMedia();

  }


})();
