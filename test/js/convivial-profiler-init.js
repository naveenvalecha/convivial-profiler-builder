// convivial-profiler-init.js
(function (window, ConvivialProfiler) {
  document.addEventListener('DOMContentLoaded', function () {
    const jsonData = JSON.parse(localStorage.getItem('profilersData')) || {};
    const tbody = document.querySelector('#profilersTable tbody');
  
    Object.entries(jsonData.config.profilers).forEach(([name, profiler], index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <th scope="row">
              <h5>Profiler: ${name}</h5>
              <button type="button" class="btn btn-success execute-profiler mt-2 btn-sm disabled">Execute</button>
              <textarea id="testingProfiler" class="form-control mt-4" style="height: 600px;"></textarea>

            </th>
            <td>${generateAccordion(name, profiler.sources, 'sources-' + index)}</td>
            <td>${generateAccordion(name, profiler.processors, 'processors-' + index)}</td>
            <td>${generateAccordion(name, profiler.destinations, 'destinations-' + index)}</td>
        `;
    });
  });
  
  function generateAccordion(profiler_name, items, parentId) {
    let accordion = `<div class="accordion" id="${parentId}">`;
    items.forEach((item, idx) => {
        const collapseId = `collapse${parentId}${idx}`;
        accordion += `
            <div class="accordion-item">
                <h5 class="accordion-header" id="heading${collapseId}">${item.type}</h5>
                <div id="${collapseId}">
                    <div class="accordion-body">
                      ${Object.entries(item).filter(([key, value]) => key !== 'type' && value !== '' && key !== 'example_data').map(([key, value]) => {
                        // Create the input name, remove spaces and convert to lowercase
                        let inputName = `${profiler_name}_${item.type}_${key}_${value}`.replace(/\s+/g, '_').toLowerCase();
                        return `
                            <div class="mb-3">
                                <label class="form-label">${value} (${key})</label>
                                <input type="text" class="form-control" name="${inputName}" placeholder="Enter a test value for '${value}'">
                            </div>`;
                      }).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    accordion += `</div>`;
    return accordion;
}
  
  window.testBuilder.onConfigReady = function () {
    window.convivialProfiler = new ConvivialProfiler(window.testBuilder.convivialProfiler.config, window.testBuilder.convivialProfiler.site);
    //window.convivialProfiler.collect();
  };
})(window, window.ConvivialProfiler.default);
