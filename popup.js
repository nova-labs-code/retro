// RetroStyle Web Popup Script v2.5
// Images are intended to remain unaffected by color filters.
// The content script must exclude img/picture/video/canvas elements
// when applying brightness, contrast, and hue-shift effects.

const toggleBtn = document.getElementById("toggleBtn");
const siteToggleBtn = document.getElementById("siteToggleBtn");
const pageToggleBtn = document.getElementById("pageToggleBtn");
const themeSelect = document.getElementById("themeSelect");
const fontSelect = document.getElementById("fontSelect");

const scanlinesInput = document.getElementById("scanlines");
const curvatureInput = document.getElementById("curvature");
const flickerInput = document.getElementById("flicker");
const pixelationInput = document.getElementById("pixelation");
const brightnessInput = document.getElementById("brightness");
const contrastInput = document.getElementById("contrast");
const hueShiftInput = document.getElementById("hueShift");
const noiseInput = document.getElementById("noise");

let currentHost = "";
let currentUrl = "";

// ------------------------------------------------------------
// Debounce helper
// ------------------------------------------------------------

let saveTimeouts = {};

function saveSettingDebounced(key, value) {
  if (saveTimeouts[key]) {
    clearTimeout(saveTimeouts[key]);
  }

  saveTimeouts[key] = setTimeout(() => {
    chrome.storage.sync.set({
      [key]: value
    });
  }, 150);
}

// ------------------------------------------------------------
// Get active tab
// ------------------------------------------------------------

chrome.tabs.query(
  {
    active: true,
    currentWindow: true
  },
  (tabs) => {
    if (tabs[0] && tabs[0].url) {
      try {
        const urlObj = new URL(tabs[0].url);

        currentHost = urlObj.hostname;
        currentUrl = tabs[0].url.split("#")[0];
      } catch (e) {
        console.warn("Could not parse tab URL:", e);
      }
    }

    loadSettings();
  }
);

// ------------------------------------------------------------
// Load settings
// ------------------------------------------------------------

function loadSettings() {
  chrome.storage.sync.get(
    {
      enabled: true,

      disabledSites: [],
      disabledPages: [],

      theme: "green_crt",
      font: "VT323",

      scanlines: 50,
      curvature: 30,
      flicker: 20,
      pixelation: 0,

      brightness: 100,
      contrast: 120,
      hueShift: 0,

      noise: 10,

      // IMPORTANT:
      // Keep images untouched by default.
      protectImages: true
    },
    (data) => {
      updateMasterUI(data.enabled);

      updateExclusionUI(
        data.disabledSites,
        data.disabledPages
      );

      // Theme / font
      themeSelect.value = data.theme;
      fontSelect.value = data.font;

      // Visual settings
      scanlinesInput.value = data.scanlines;
      curvatureInput.value = data.curvature;
      flickerInput.value = data.flicker;
      pixelationInput.value = data.pixelation;

      brightnessInput.value = data.brightness;
      contrastInput.value = data.contrast;
      hueShiftInput.value = data.hueShift;

      noiseInput.value = data.noise;

      updateLabelValues(data);
    }
  );
}

// ------------------------------------------------------------
// Update slider labels
// ------------------------------------------------------------

function updateLabelValues(data) {
  if (data.scanlines !== undefined) {
    document.getElementById("scanlinesVal").textContent =
      data.scanlines + "%";
  }

  if (data.curvature !== undefined) {
    document.getElementById("curvatureVal").textContent =
      data.curvature + "%";
  }

  if (data.flicker !== undefined) {
    document.getElementById("flickerVal").textContent =
      data.flicker + "%";
  }

  if (data.pixelation !== undefined) {
    document.getElementById("pixelationVal").textContent =
      data.pixelation + "px";
  }

  if (data.brightness !== undefined) {
    document.getElementById("brightnessVal").textContent =
      data.brightness + "%";
  }

  if (data.contrast !== undefined) {
    document.getElementById("contrastVal").textContent =
      data.contrast + "%";
  }

  if (data.hueShift !== undefined) {
    document.getElementById("hueShiftVal").textContent =
      data.hueShift + "°";
  }

  if (data.noise !== undefined) {
    document.getElementById("noiseVal").textContent =
      data.noise + "%";
  }
}

// ------------------------------------------------------------
// Master toggle UI
// ------------------------------------------------------------

function updateMasterUI(isEnabled) {
  toggleBtn.textContent = isEnabled ? "ON" : "OFF";

  toggleBtn.className = isEnabled
    ? "toggle-btn"
    : "toggle-btn off";
}

// ------------------------------------------------------------
// Site / page exclusion UI
// ------------------------------------------------------------

function updateExclusionUI(disabledSites, disabledPages) {
  const isSiteDisabled =
    currentHost &&
    disabledSites.includes(currentHost);

  const isPageDisabled =
    currentUrl &&
    disabledPages.includes(currentUrl);

  if (isSiteDisabled) {
    siteToggleBtn.textContent =
      `Enable on this site (${currentHost})`;

    siteToggleBtn.classList.add("active-disabled");
  } else {
    siteToggleBtn.textContent =
      "Disable on this site";

    siteToggleBtn.classList.remove("active-disabled");
  }

  if (isPageDisabled) {
    pageToggleBtn.textContent =
      "Enable on this page";

    pageToggleBtn.classList.add("active-disabled");
  } else {
    pageToggleBtn.textContent =
      "Disable on this page";

    pageToggleBtn.classList.remove("active-disabled");
  }
}

// ------------------------------------------------------------
// Master ON/OFF
// ------------------------------------------------------------

toggleBtn.addEventListener("click", () => {
  chrome.storage.sync.get(
    {
      enabled: true
    },
    (data) => {
      const newState = !data.enabled;

      chrome.storage.sync.set(
        {
          enabled: newState
        },
        () => {
          updateMasterUI(newState);
        }
      );
    }
  );
});

// ------------------------------------------------------------
// Disable / enable site
// ------------------------------------------------------------

siteToggleBtn.addEventListener("click", () => {
  if (!currentHost) return;

  chrome.storage.sync.get(
    {
      disabledSites: []
    },
    (data) => {
      let sites = [...data.disabledSites];

      if (sites.includes(currentHost)) {
        sites = sites.filter(
          (site) => site !== currentHost
        );
      } else {
        sites.push(currentHost);
      }

      chrome.storage.sync.set(
        {
          disabledSites: sites
        },
        () => {
          chrome.storage.sync.get(
            {
              disabledPages: []
            },
            (d) => {
              updateExclusionUI(
                sites,
                d.disabledPages
              );
            }
          );
        }
      );
    }
  );
});

// ------------------------------------------------------------
// Disable / enable page
// ------------------------------------------------------------

pageToggleBtn.addEventListener("click", () => {
  if (!currentUrl) return;

  chrome.storage.sync.get(
    {
      disabledPages: []
    },
    (data) => {
      let pages = [...data.disabledPages];

      if (pages.includes(currentUrl)) {
        pages = pages.filter(
          (page) => page !== currentUrl
        );
      } else {
        pages.push(currentUrl);
      }

      chrome.storage.sync.set(
        {
          disabledPages: pages
        },
        () => {
          chrome.storage.sync.get(
            {
              disabledSites: []
            },
            (d) => {
              updateExclusionUI(
                d.disabledSites,
                pages
              );
            }
          );
        }
      );
    }
  );
});

// ------------------------------------------------------------
// Theme
// ------------------------------------------------------------

themeSelect.addEventListener("change", (e) => {
  chrome.storage.sync.set({
    theme: e.target.value
  });
});

// ------------------------------------------------------------
// Font
// ------------------------------------------------------------

fontSelect.addEventListener("change", (e) => {
  chrome.storage.sync.set({
    font: e.target.value
  });
});

// ------------------------------------------------------------
// Generic slider setup
// ------------------------------------------------------------

const setupSlider = (
  inputEl,
  valElId,
  key,
  suffix
) => {
  if (!inputEl) return;

  inputEl.addEventListener("input", (e) => {
    const val = e.target.value;

    const label = document.getElementById(
      valElId
    );

    if (label) {
      label.textContent = val + suffix;
    }

    saveSettingDebounced(
      key,
      Number(val)
    );
  });
};

// ------------------------------------------------------------
// Sliders
// ------------------------------------------------------------

setupSlider(
  scanlinesInput,
  "scanlinesVal",
  "scanlines",
  "%"
);

setupSlider(
  curvatureInput,
  "curvatureVal",
  "curvature",
  "%"
);

setupSlider(
  flickerInput,
  "flickerVal",
  "flicker",
  "%"
);

setupSlider(
  pixelationInput,
  "pixelationVal",
  "pixelation",
  "px"
);

setupSlider(
  brightnessInput,
  "brightnessVal",
  "brightness",
  "%"
);

setupSlider(
  contrastInput,
  "contrastVal",
  "contrast",
  "%"
);

setupSlider(
  hueShiftInput,
  "hueShiftVal",
  "hueShift",
  "°"
);

setupSlider(
  noiseInput,
  "noiseVal",
  "noise",
  "%"
);

// ------------------------------------------------------------
// Force image protection setting
// ------------------------------------------------------------
//
// This ensures the extension remembers that images should
// remain visually unchanged.
//
// The actual filtering code in content.js must also honor
// protectImages.

chrome.storage.sync.set({
  protectImages: true
});
