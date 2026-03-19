(() => {
  const PAGE_OPTIONS = [
    { label: "Home", value: "index.html" },
    { label: "Technology", value: "technology.html" },
    { label: "Impact & Partners", value: "impact.html" },
    { label: "Team", value: "team.html" },
    { label: "Contact", value: "contact.html" },
  ];

  const BREAKPOINTS = {
    desktop: 1440,
    tablet: 1024,
    mobile: 430,
  };

  const state = {
    page: "index.html",
    breakpoint: "desktop",
    overrides: { pages: {} },
    history: [],
    selectedId: "",
    selectedElement: null,
    selectedType: "",
    frameScrollHandler: null,
    frameResizeHandler: null,
  };

  const refs = {
    pageSelect: document.querySelector("#studio-page"),
    breakpoints: document.querySelector("#studio-breakpoints"),
    elementList: document.querySelector("#studio-element-list"),
    previewLabel: document.querySelector("#studio-preview-label"),
    frameShell: document.querySelector("#studio-frame-shell"),
    frame: document.querySelector("#studio-frame"),
    overlay: document.querySelector("#studio-overlay"),
    selectionBox: document.querySelector("#studio-selection-box"),
    selectionLabel: document.querySelector("#studio-selection-label"),
    selectedId: document.querySelector("#studio-selected-id"),
    selectedType: document.querySelector("#studio-selected-type"),
    status: document.querySelector("#studio-status"),
    undo: document.querySelector("#studio-undo"),
    reset: document.querySelector("#studio-reset"),
    export: document.querySelector("#studio-export"),
    save: document.querySelector("#studio-save"),
    fields: {
      text: document.querySelector("#field-text"),
      x: document.querySelector("#field-x"),
      y: document.querySelector("#field-y"),
      width: document.querySelector("#field-width"),
      maxWidth: document.querySelector("#field-maxWidth"),
      minHeight: document.querySelector("#field-minHeight"),
      fontSize: document.querySelector("#field-fontSize"),
      lineHeight: document.querySelector("#field-lineHeight"),
      padding: document.querySelector("#field-padding"),
      gap: document.querySelector("#field-gap"),
      textAlign: document.querySelector("#field-textAlign"),
    },
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const asNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const ensurePageStore = () => {
    if (!state.overrides.pages) state.overrides.pages = {};
    if (!state.overrides.pages[state.page]) {
      state.overrides.pages[state.page] = { desktop: {}, tablet: {}, mobile: {} };
    }
    const pageStore = state.overrides.pages[state.page];
    if (!pageStore.desktop) pageStore.desktop = {};
    if (!pageStore.tablet) pageStore.tablet = {};
    if (!pageStore.mobile) pageStore.mobile = {};
    return pageStore;
  };

  const getBreakpointStore = () => {
    const pageStore = ensurePageStore();
    return pageStore[state.breakpoint];
  };

  const getCurrentOverride = () => {
    if (!state.selectedId) return {};
    const store = getBreakpointStore();
    return store[state.selectedId] || {};
  };

  const setStatus = (message) => {
    refs.status.textContent = message;
  };

  const pushHistory = () => {
    state.history.push(clone(state.overrides));
    if (state.history.length > 60) {
      state.history.shift();
    }
  };

  const removeEmptyOverride = (editId) => {
    const store = getBreakpointStore();
    const current = store[editId];
    if (!current) return;
    if (Object.keys(current).length === 0) {
      delete store[editId];
    }
  };

  const setOverrideValue = (editId, key, value, options = {}) => {
    const { keepEmptyText = false } = options;
    const store = getBreakpointStore();
    if (!store[editId]) store[editId] = {};

    if (value === "" || value === null || value === undefined) {
      if (key === "text" && keepEmptyText) {
        store[editId][key] = "";
      } else {
        delete store[editId][key];
      }
    } else {
      store[editId][key] = value;
    }

    removeEmptyOverride(editId);
  };

  const getPreviewWindow = () => refs.frame.contentWindow;
  const getPreviewDocument = () => refs.frame.contentDocument;

  const applyOverridesToPreview = () => {
    const previewWindow = getPreviewWindow();
    if (!previewWindow || !previewWindow.SubvisionLayout) return;
    previewWindow.SubvisionLayout.setLayoutOverrides(clone(state.overrides));
    window.requestAnimationFrame(syncSelectionBox);
  };

  const setBreakpointWidth = () => {
    refs.frameShell.style.width = `${BREAKPOINTS[state.breakpoint]}px`;
  };

  const clearSelection = () => {
    state.selectedId = "";
    state.selectedElement = null;
    state.selectedType = "";
    refs.selectedId.textContent = "None";
    refs.selectedType.textContent = "-";
    refs.selectionLabel.textContent = "No selection";
    refs.overlay.hidden = true;
    Array.from(refs.elementList.querySelectorAll(".studio-element-button")).forEach((button) => {
      button.classList.remove("is-active");
    });
    syncInspector();
  };

  const selectElementById = (editId) => {
    const doc = getPreviewDocument();
    if (!doc) return;
    const element = Array.from(doc.querySelectorAll("[data-edit-id]")).find((node) => node.dataset.editId === editId);
    if (!element) {
      clearSelection();
      return;
    }

    state.selectedId = editId;
    state.selectedElement = element;
    state.selectedType = element.dataset.editType || "block";
    refs.selectedId.textContent = editId;
    refs.selectedType.textContent = state.selectedType;
    refs.selectionLabel.textContent = editId;
    refs.overlay.hidden = false;

    Array.from(refs.elementList.querySelectorAll(".studio-element-button")).forEach((button) => {
      button.classList.toggle("is-active", button.dataset.editId === editId);
    });

    syncInspector();
    syncSelectionBox();
  };

  const buildElementList = () => {
    const doc = getPreviewDocument();
    if (!doc) return;
    const elements = Array.from(doc.querySelectorAll("[data-edit-id]"));
    refs.elementList.innerHTML = "";

    elements.forEach((element) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "studio-element-button";
      button.dataset.editId = element.dataset.editId;

      const title = document.createElement("strong");
      title.textContent = element.dataset.editId;
      const meta = document.createElement("span");
      meta.textContent = `${element.dataset.editType || "block"} · ${element.tagName.toLowerCase()}`;

      button.append(title, meta);
      button.addEventListener("click", () => {
        selectElementById(element.dataset.editId);
        element.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      });

      refs.elementList.append(button);
    });
  };

  const syncSelectionBox = () => {
    const previewWindow = getPreviewWindow();
    const frame = refs.frame;
    if (!state.selectedElement || !previewWindow || !frame) return;

    const rect = state.selectedElement.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      refs.overlay.hidden = true;
      return;
    }

    refs.overlay.hidden = false;
    refs.selectionBox.style.left = `${rect.left}px`;
    refs.selectionBox.style.top = `${rect.top}px`;
    refs.selectionBox.style.width = `${rect.width}px`;
    refs.selectionBox.style.height = `${rect.height}px`;
    refs.overlay.style.width = `${frameRect.width}px`;
    refs.overlay.style.height = `${frameRect.height}px`;
  };

  const getComputedValue = (property) => {
    if (!state.selectedElement) return "";
    const computed = getPreviewWindow().getComputedStyle(state.selectedElement);
    if (property === "text") return state.selectedElement.textContent;
    if (property === "align" || property === "textAlign") return computed.textAlign;
    if (property === "lineHeight") {
      const parsed = parseFloat(computed.lineHeight);
      const fontSize = parseFloat(computed.fontSize);
      if (Number.isFinite(parsed) && Number.isFinite(fontSize) && fontSize > 0) {
        return (parsed / fontSize).toFixed(2);
      }
      return "";
    }
    const raw = computed[property];
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? String(Math.round(parsed * 100) / 100) : raw;
  };

  const syncInspector = () => {
    const override = getCurrentOverride();
    const hasSelection = Boolean(state.selectedElement);
    const isText = state.selectedType === "text";

    Object.entries(refs.fields).forEach(([key, field]) => {
      field.disabled = !hasSelection;
      if (!hasSelection) {
        field.value = "";
      }
    });

    refs.fields.text.disabled = !hasSelection || !isText;
    if (!hasSelection) return;

    refs.fields.text.value = isText
      ? (override.text !== undefined ? override.text : getComputedValue("text"))
      : "";
    refs.fields.x.value = override.x !== undefined ? override.x : "0";
    refs.fields.y.value = override.y !== undefined ? override.y : "0";
    refs.fields.width.value = override.width !== undefined ? override.width : "";
    refs.fields.maxWidth.value = override.maxWidth !== undefined ? override.maxWidth : "";
    refs.fields.minHeight.value = override.minHeight !== undefined ? override.minHeight : "";
    refs.fields.fontSize.value = override.fontSize !== undefined ? override.fontSize : (isText ? getComputedValue("fontSize") : "");
    refs.fields.lineHeight.value = override.lineHeight !== undefined ? override.lineHeight : (isText ? getComputedValue("lineHeight") : "");
    refs.fields.padding.value = override.padding !== undefined ? override.padding : "";
    refs.fields.gap.value = override.gap !== undefined ? override.gap : "";
    refs.fields.textAlign.value = override.align || override.textAlign || (isText ? getComputedValue("textAlign") : "");
  };

  const handleInspectorInput = (key, value) => {
    if (!state.selectedId) return;
    setOverrideValue(state.selectedId, key, value, { keepEmptyText: key === "text" });
    applyOverridesToPreview();
    syncInspector();
  };

  const bindInspector = () => {
    const fields = refs.fields;
    const beginFieldEdit = () => {
      if (state.selectedId) pushHistory();
    };

    Object.values(fields).forEach((field) => {
      field.addEventListener("focus", beginFieldEdit);
    });

    fields.text.addEventListener("input", (event) => {
      handleInspectorInput("text", event.target.value);
    });

    ["x", "y", "width", "maxWidth", "minHeight", "fontSize", "lineHeight"].forEach((key) => {
      fields[key].addEventListener("input", (event) => {
        handleInspectorInput(key, event.target.value === "" ? "" : Number(event.target.value));
      });
    });

    ["padding", "gap", "textAlign"].forEach((key) => {
      fields[key].addEventListener("input", (event) => {
        const overrideKey = key === "textAlign" ? "align" : key;
        handleInspectorInput(overrideKey, event.target.value);
      });
    });
  };

  const bindFrameInteractions = () => {
    const doc = getPreviewDocument();
    const win = getPreviewWindow();
    if (!doc || !win) return;

    doc.addEventListener(
      "click",
      (event) => {
        const target = event.target.closest("[data-edit-id]");
        if (!target) return;
        event.preventDefault();
        event.stopPropagation();
        selectElementById(target.dataset.editId);
      },
      true,
    );

    doc.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
      },
      true,
    );

    doc.querySelectorAll("a, button").forEach((element) => {
      element.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
        },
        true,
      );
    });

    if (state.frameScrollHandler) {
      win.removeEventListener("scroll", state.frameScrollHandler);
    }
    if (state.frameResizeHandler) {
      win.removeEventListener("resize", state.frameResizeHandler);
    }

    state.frameScrollHandler = () => syncSelectionBox();
    state.frameResizeHandler = () => syncSelectionBox();
    win.addEventListener("scroll", state.frameScrollHandler, { passive: true });
    win.addEventListener("resize", state.frameResizeHandler);
  };

  const beginOverlayInteraction = (mode, event) => {
    if (!state.selectedId || !state.selectedElement) return;
    event.preventDefault();

    const currentOverride = getCurrentOverride();
    const rect = state.selectedElement.getBoundingClientRect();
    const isText = state.selectedType === "text";

    const start = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: asNumber(currentOverride.x, 0),
      y: asNumber(currentOverride.y, 0),
      width: asNumber(
        isText ? currentOverride.maxWidth : currentOverride.width,
        rect.width,
      ),
      minHeight: asNumber(currentOverride.minHeight, rect.height),
    };

    pushHistory();

    const handleMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - start.pointerX;
      const deltaY = moveEvent.clientY - start.pointerY;

      if (mode === "move") {
        setOverrideValue(state.selectedId, "x", Math.round(start.x + deltaX));
        setOverrideValue(state.selectedId, "y", Math.round(start.y + deltaY));
      }

      if (mode === "e" || mode === "se") {
        const nextWidth = Math.max(80, Math.round(start.width + deltaX));
        setOverrideValue(state.selectedId, isText ? "maxWidth" : "width", nextWidth);
      }

      if (mode === "s" || mode === "se") {
        const nextHeight = Math.max(40, Math.round(start.minHeight + deltaY));
        setOverrideValue(state.selectedId, "minHeight", nextHeight);
      }

      applyOverridesToPreview();
      syncInspector();
    };

    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const bindOverlay = () => {
    refs.selectionBox.addEventListener("pointerdown", (event) => {
      const handle = event.target.closest("[data-resize-handle]");
      beginOverlayInteraction(handle ? handle.dataset.resizeHandle : "move", event);
    });
  };

  const exportJson = () => {
    const blob = new Blob([`${JSON.stringify(state.overrides, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "layout-overrides.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("Exported layout-overrides.json");
  };

  const saveJsonToLocalServer = async () => {
    const response = await fetch("/__studio/save-overrides", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(state.overrides, null, 2),
    });

    if (!response.ok) {
      throw new Error(`Local save endpoint returned ${response.status}`);
    }

    return response.json().catch(() => ({}));
  };

  const saveJson = async () => {
    const content = `${JSON.stringify(state.overrides, null, 2)}\n`;

    try {
      await saveJsonToLocalServer();
      setStatus("Saved overrides directly into assets/data/layout-overrides.json via the local dev server.");
      return;
    } catch (error) {
      // Fall through to browser-based saving when the custom dev server is not running.
    }

    if ("showSaveFilePicker" in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: "layout-overrides.json",
          types: [
            {
              description: "JSON files",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        setStatus("Saved overrides. Point the dialog at assets/data/layout-overrides.json to update the live site file.");
        return;
      } catch (error) {
        setStatus(`Save cancelled. ${error && error.message ? error.message : ""}`.trim());
        return;
      }
    }

    exportJson();
    setStatus("File picker not available in this browser, so the overrides were downloaded instead.");
  };

  const resetSelected = () => {
    if (!state.selectedId) return;
    pushHistory();
    const store = getBreakpointStore();
    delete store[state.selectedId];
    applyOverridesToPreview();
    syncInspector();
    setStatus(`Reset ${state.selectedId} for ${state.breakpoint}.`);
  };

  const undo = () => {
    if (state.history.length === 0) {
      setStatus("Nothing to undo yet.");
      return;
    }
    state.overrides = state.history.pop();
    applyOverridesToPreview();
    if (state.selectedId) {
      selectElementById(state.selectedId);
    }
    setStatus("Undid the last change.");
  };

  const loadOverrides = async () => {
    try {
      const response = await fetch("assets/data/layout-overrides.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Failed to load overrides (${response.status})`);
      state.overrides = await response.json();
    } catch (error) {
      state.overrides = { pages: {} };
      setStatus(`Started with empty overrides. ${error.message}`);
      return;
    }
    setStatus("Loaded overrides from assets/data/layout-overrides.json");
  };

  const loadPreview = () => {
    clearSelection();
    setBreakpointWidth();
    refs.previewLabel.textContent = PAGE_OPTIONS.find((item) => item.value === state.page).label;
    refs.frame.src = `${state.page}?studioPreview=1&ts=${Date.now()}`;
    setStatus(`Loading ${state.page} (${state.breakpoint})...`);
  };

  const bindTopControls = () => {
    PAGE_OPTIONS.forEach((option) => {
      const node = document.createElement("option");
      node.value = option.value;
      node.textContent = option.label;
      refs.pageSelect.append(node);
    });
    refs.pageSelect.value = state.page;
    refs.pageSelect.addEventListener("change", (event) => {
      state.page = event.target.value;
      loadPreview();
    });

    Object.keys(BREAKPOINTS).forEach((name) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `studio-breakpoint${name === state.breakpoint ? " is-active" : ""}`;
      button.dataset.breakpoint = name;
      button.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      button.addEventListener("click", () => {
        state.breakpoint = name;
        Array.from(refs.breakpoints.children).forEach((child) => {
          child.classList.toggle("is-active", child.dataset.breakpoint === name);
        });
        loadPreview();
      });
      refs.breakpoints.append(button);
    });

    refs.undo.addEventListener("click", undo);
    refs.reset.addEventListener("click", resetSelected);
    refs.export.addEventListener("click", exportJson);
    refs.save.addEventListener("click", saveJson);
  };

  const bindFrameLoad = () => {
    refs.frame.addEventListener("load", () => {
      const previewWindow = getPreviewWindow();
      if (!previewWindow || !previewWindow.SubvisionLayout) {
        setStatus("Preview loaded, but the runtime editor helpers were not found.");
        return;
      }

      previewWindow.SubvisionLayout.assignAutoEditHooks(getPreviewDocument());
      applyOverridesToPreview();
      bindFrameInteractions();
      buildElementList();
      if (state.selectedId) {
        selectElementById(state.selectedId);
      }
      syncInspector();
      setStatus(`Preview ready for ${state.page} at ${state.breakpoint}.`);
    });
  };

  const init = async () => {
    bindTopControls();
    bindInspector();
    bindOverlay();
    bindFrameLoad();
    await loadOverrides();
    loadPreview();
  };

  init();
})();
