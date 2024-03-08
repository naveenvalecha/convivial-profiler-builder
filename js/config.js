/**
 * Default URLs for the Convivial Profiler's sources, processors, and destinations.
 */
const defaultUrls = {
  sources: 'https://raw.githubusercontent.com/eleonel/Convivial-Profiler/1.0.x/convivial_profiler.profiler_source.yml',
  processors: 'https://raw.githubusercontent.com/eleonel/Convivial-Profiler/1.0.x/convivial_profiler.profiler_processor.yml',
  destinations: 'https://raw.githubusercontent.com/eleonel/Convivial-Profiler/1.0.x/convivial_profiler.profiler_destination.yml'
};

/**
 * Runtime URLs that might be updated with user-defined values from local storage.
 */
let urls = { ...defaultUrls };

/**
 * Updates the URLs for fetching profiler configurations based on settings from local storage.
 */
function updateFetchURLs() {
  const settings = JSON.parse(localStorage.getItem('profiler_settings')) || {};
  urls.sources = settings.sources || defaultUrls.sources;
  urls.processors = settings.processors || defaultUrls.processors;
  urls.destinations = settings.destinations || defaultUrls.destinations;
}

/**
 * Initializes the configuration by loading existing settings and setting up event listeners.
 */
function initConfiguration() {
  loadConfiguration();

  document.getElementById('configForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const profilerSettings = {
      sources: document.getElementById('sourceUrl').value || defaultUrls.sources,
      processors: document.getElementById('processorUrl').value || defaultUrls.processors,
      destinations: document.getElementById('destinationUrl').value || defaultUrls.destinations,
      import_url: document.getElementById('importUrl').value
    };

    localStorage.setItem('profiler_settings', JSON.stringify(profilerSettings));
    updateFetchURLs();
  });
}

/**
 * Loads the profiler configuration from local storage into the form fields.
 */
function loadConfiguration() {
  const profilerSettings = JSON.parse(localStorage.getItem('profiler_settings'));
  if (profilerSettings) {
    document.getElementById('sourceUrl').value = profilerSettings.sources || '';
    document.getElementById('processorUrl').value = profilerSettings.processors || '';
    document.getElementById('destinationUrl').value = profilerSettings.destinations || '';
    document.getElementById('importUrl').value = profilerSettings.import_url || '';
  }
}

/**
 * Fetches YAML data for a given category using updated URLs.
 * @param {string} category - The category to fetch ('sources', 'processors', 'destinations').
 * @returns {Promise<Object|null>} The loaded YAML data as an object, or null in case of failure.
 */
async function fetchYAMLData(category) {
  const settings = JSON.parse(localStorage.getItem('profiler_settings')) || {};
  const url = settings[category] || defaultUrls[category];

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const yamlText = await response.text();
    return jsyaml.load(yamlText);
  } catch (error) {
    console.error(`Failed to fetch YAML data for ${category}:`, error);
    return null;
  }
}

/**
 * Captures configuration data from dynamic form fields related to profiler categories.
 * @param {Element} cell - The table cell containing dynamic form elements.
 * @returns {Array<Object>} An array of configuration objects for the selected category.
 */
function captureCategoryConfig(cell) {
  const configs = [];
  if (cell) {
    const selects = cell.querySelectorAll('select:not(.example-data-select)');
    selects.forEach(select => {
      const selectedType = select.value;
      if (selectedType) {
        const config = { type: selectedType };
        let nextSiblingContainer = select.nextSibling;

        while (nextSiblingContainer && !nextSiblingContainer.matches('select')) {
          const inputs = nextSiblingContainer.querySelectorAll('input, textarea, select');
          inputs.forEach(input => {
            const value = input.type === 'checkbox' ? input.checked : input.value;
            if (input.name && value !== undefined) {
              config[input.name] = value;
            }
          });

          const exampleDataSelect = nextSiblingContainer.querySelector('.example-data-select');
          if (exampleDataSelect && exampleDataSelect.value !== '') {
            config['example_data'] = exampleDataSelect.value;
          }

          nextSiblingContainer = nextSiblingContainer.nextSibling;
        }
        configs.push(config);
      }
    });
  }
  return configs;
}
