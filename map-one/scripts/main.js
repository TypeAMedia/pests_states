function App() {

  let mapJson = null;
  let stateMap = null;
  let overallMap = null;
  let pestData = null;

  loadData().then(({ geojson, pestsData }) => {
    mapJson = geojson;
    pestData = pestsData;

    const states = pestData.map((d) => {
      return {
        label: d['Name of US State'],
        value: d['Name of US State']
      }
    })

    initDropdown({
      list: states,
      id: "#categories_select",
      placeholder: 'Select State',
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

    console.log(pestData)
    const headers = [
      {
        label: 'Rank',
        icon: './images/newIcons/rank.svg',
        fieldValue: 'Ranking'
      },
      {
        label: 'State',
        icon: './images/newIcons/search.svg',
        fieldValue: 'Name of US State'
      },
      {
        label: 'Restaurants',
        icon: './images/newIcons/restaurants.svg',
        fieldValue: 'Number of restaurants '
      },
      {
        label: 'Farms',
        icon: './images/newIcons/farms.svg',
        fieldValue: 'Number of farms (2022)'
      }
    ]
    drawTable(headers, pestData)

    initMaps(newMapData);
    addEvents();
  });

  function loadData() {
    return Promise.all([
      d3.json("./data/map.json"),
      d3.csv('./data/allData.csv', d3.autoType),
    ]).then(([geojson, pestsData,]) => {
      return { geojson, pestsData }
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
      .sort((a, b) => a.Ranking - b.Ranking)
      .filter((d, index) => index <= 10)

    const header = table
      .selectAll('div')
      .data(headers)
      .join('div')
      .attr('class', 'table-header')
      .html(
        d =>
          `<img src='${d.icon}'/>
          <div class='table-label'> ${d.label} </div>
        `
      )

    const tableRows = header
      .selectAll('.table-row')
      .data(filteredData)
      .join('div')
      .attr('class', 'table-row')

    console.log(tableRows.node())


    tableRows
      .selectAll('.table-cell')
      .data(d =>
        headers.map(head => {
          return d[head.fieldValue]
        })
      )
      .join('div')
      .attr('class', 'table-cell')
      .html(d => d)
  }


}

window.addEventListener("DOMContentLoaded", App);