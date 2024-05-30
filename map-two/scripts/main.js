function App() {

  let mapJson = null;
  let stateMap = null;
  let overallMap = null;
  let pestData = null;

  loadData().then(({ geojson, pestsData, allPests, pestVolumes }) => {
    mapJson = geojson;
    pestData = pestsData;


    const pests = pestVolumes.map((d) => {
      return {
        label: d.pest,
        value: d.pest
      }
    }).filter((d) => d.label !== 'Total search volume')
      .sort((a, b) => {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      });


    initDropdown({
      list: pests,
      id: "#categories_select",
      placeholder: 'Select Pest',
      searchPlaceholderValue: 'Search',
      searchEnabled: true,
      cb: (d) => {
        console.log(d)
      }
    });


    const newMapData = pestData.reduce((obj, d) => {
      obj[d['Name of US State'].trim()] = d.Ranking
      return obj
    }, {})

    const headers = [
      {
        label: 'Rank',
        icon: './images/newIcons/rank.svg',
        fieldValue: 'rank',
        width: "20%",

      },
      {
        label: 'Pest',
        icon: './images/newIcons/ants.svg',
        fieldValue: 'pest',
        width: "60%",
      },
      {
        label: 'Searches',
        icon: './images/newIcons/search.svg',
        fieldValue: 'volume',
        width: "20%",
      },
    ]

    drawTable(headers, pestVolumes)

    initMaps(newMapData);
    addEvents();
  });

  function loadData() {
    return Promise.all([
      d3.json("./data/map.json"),
      d3.csv('./data/allData.csv', d3.autoType),
      d3.csv('./data/Pest-by-states.csv', d3.autoType),
      d3.csv('./data/pests.csv', d3.autoType)
    ]).then(([geojson, pestsData, allPests, pestVolumes]) => {
      return { geojson, pestsData, allPests, pestVolumes }
    });
  }

  function initMaps(newMapData) {
    const getTooltipContent = (name, value, target, version) => {
      const nameAndRank = `
        <div class="name-and-rank">
       <span class='rank-value'> ${value}${get_ordinal_suffix(value)} </span> ${name}
        </div>
      `;

      if (version === "mini") {
        return nameAndRank;
      }
      return;
    };

    overallMap = USMap({
      container: "#overall_map",
      desktopHeight: 450,
      mobileHeight: 200,
      geojson: mapJson,
      data: newMapData,
      colors: ['#0255A3', '#0255A380', '#E0212680', '#E02126'],
      tooltipContent: ({ name, value }, version) => {
        return getTooltipContent(name, value, 'test', version)
      },
    }).render();
  }

  function addEvents() {
    d3.select(window).on("resize", () => {
      overallMap.resize();
      stateMap.resize();
    });
  }

  function drawTable(headers, data) {
    const table = d3.select('#table')

    const filteredData = data
      .sort((a, b) => b.volume - a.volume)
      .filter((d, index) => index <= 10)

    // Create headers
    const header = table
      .selectAll('div.table-header')
      .data(headers)
      .join('div')
      .attr('class', 'table-header')
      .style('flex', (d) => `1 1 ${d.width}`)
      .html(d => `
        <img src='${d.icon}'/>
        <div class='table-label'> ${d.label} </div>
      `)

    header.each(function (headerData) {
      const header = d3.select(this)
      const tableRows = header
        .selectAll('.table-row')
        .data(filteredData)
        .join('div')
        .attr('class', 'table-row')

      tableRows
        .selectAll('.table-cell')
        .data(d => [d[headerData.fieldValue]])
        .join('div')
        .attr('class', `table-cell ${headerData.fieldValue}`)
        .html(d => {
          if (headerData.fieldValue === 'volume') {
            return formatThousand(d)
          } else if (headerData.fieldValue === 'rank') {
            console.log(d)
            return `${d}${get_ordinal_suffix(d)}`
          } else return d
        })
    })
  }

}

window.addEventListener("DOMContentLoaded", App);