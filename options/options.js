const DEFAULT_LANGUAGE = 'en',
    DEFAULT_TRIGGER_KEY = 'none',
    IS_HISTORY_ENABLED_BY_DEFAULT = true,

    SAVE_STATUS = document.querySelector("#save-status"),

    SAVE_OPTIONS_BUTTON = document.querySelector("#save-btn"),
    RESET_OPTIONS_BUTTON = document.querySelector("#reset-btn"),

    CLEAR_HISTORY_BUTTON = document.querySelector("#clear-history-btn"),
    DOWNLOAD_HISTORY_BUTTON = document.querySelector("#download-history-btn"),

    OS_MAC = 'mac',

    KEY_COMMAND = 'Command',
    KEY_META = 'meta';



function saveOptions(e) {
    browser.storage.local.set({
        language: document.querySelector("#language-selector").value,
        interaction: {
            dblClick: {
                key: document.querySelector("#popup-dblclick-key").value
            }
        },
        history: {
            enabled: document.querySelector("#store-history-checkbox").checked
        }
    }).then(showSaveStatusAnimation);

    e.preventDefault();
  }
  
  function restoreOptions() {
    let storageItem = browser.storage.local.get();

    storageItem.then((results) => {
        let language = results.language,
            interaction = results.interaction || {},
            history = results.history || { enabled: IS_HISTORY_ENABLED_BY_DEFAULT },
            definitions = results.definitions || {};
        
        // language
        document.querySelector("#language-selector").value = language || DEFAULT_LANGUAGE;

        // interaction
        // document.querySelector("#popup-dblclick-checkbox").checked = interaction.dblClick.enabled;
        document.querySelector("#popup-dblclick-key").value = (interaction.dblClick && interaction.dblClick.key) || DEFAULT_TRIGGER_KEY;
        
        // document.querySelector("#popup-select-checkbox").checked = interaction.select.enabled;
        // document.querySelector("#popup-select-key").value = interaction.select.key;

        // history
        document.querySelector("#store-history-checkbox").checked = history.enabled;
        document.querySelector("#num-words-in-history").innerText = Object.keys(definitions).length;
    });
  }
  
  function downloadHistory (e) {
    let fileContent = "" 
        storageItem = browser.storage.local.get("definitions"),
        anchorTag = document.querySelector("#download-history-link");

    storageItem.then((results) => {
        let definitions = results.definitions || {};

        for (definition in definitions) {
            if (!definitions.hasOwnProperty(definition)) { return; }

            fileContent += definition;
            fileContent += "\t";
            fileContent += "\t";
            fileContent += definitions[definition];
            fileContent += "\n";
        }

        anchorTag.href = window.URL.createObjectURL(new Blob([fileContent],{
            type: "text/plain"
        }));

        anchorTag.dispatchEvent(new MouseEvent('click'));
    });

    e.preventDefault();
  }

  function resetOptions (e) {
    browser.storage.local.set({
        language: DEFAULT_LANGUAGE,
        interaction: {
            dblClick: {
                key: DEFAULT_TRIGGER_KEY
            }
        },
        history: {
            enabled: IS_HISTORY_ENABLED_BY_DEFAULT
        }
    }).then(restoreOptions);

    e.preventDefault();
  }

  function clearHistory(e) {
    browser.storage.local.set({ definitions: {} });

    e.preventDefault();
  }

  function showSaveStatusAnimation () {
    SAVE_STATUS.style.setProperty("-webkit-transition", "opacity 0s ease-out");
    SAVE_STATUS.style.opacity = 1;
    window.setTimeout(function() {
        SAVE_STATUS.style.setProperty("-webkit-transition", "opacity 0.4s ease-out");
        SAVE_STATUS.style.opacity = 0
    }, 1500);
  }

  document.addEventListener('DOMContentLoaded', restoreOptions);

  CLEAR_HISTORY_BUTTON.addEventListener("click", clearHistory);
  DOWNLOAD_HISTORY_BUTTON.addEventListener("click", downloadHistory);

  SAVE_OPTIONS_BUTTON.addEventListener("click", saveOptions);
  RESET_OPTIONS_BUTTON.addEventListener("click", resetOptions);

  if (window.navigator.platform.toLowerCase().includes(OS_MAC)) {
    document.getElementById("popup-dblclick-key-ctrl").textContent = KEY_COMMAND;
    document.getElementById("popup-dblclick-key-ctrl").value = KEY_META;
  }
