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
    const topTenStates = pestData.sort((a, b) => a.Ranking - b.Ranking).slice(0, 10)
    const headers = [
      {
        label: 'Rank',
        icon: './images/newIcons/rank.svg',
        fieldValue: 'Ranking'
      },
      {
        label: 'State',
        icon: './images/newIcons/state.svg',
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
      },
      {
        label: 'Landfills',
        icon: './images/newIcons/landfills.svg',
        fieldValue: 'Number of landfills '
      },
      {
        label: 'Searches',
        icon: './images/newIcons/search.svg',
        fieldValue: 'Total number of pest-related search queries'
      },
      {
        label: 'Pest Control Companies',
        icon: './images/newIcons/control.svg',
        fieldValue: 'Number of pest control companies'
      }
    ]
    drawTable(headers, topTenStates)

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

    const tableHeader = table
      .selectAll('.table-header-row')
      .data(['tr'])
      .join('tr')
      .attr('class', 'table-header-row')


    const tableHeaderCells = tableHeader.selectAll('th')
      .data(headers)
      .join('th')
      .html((d) => `<div class='header-box'> 
			  <img src= ${d.icon} class='table-icon' />
				<div class='header-label'> ${d.label} </div>
			</div>`)

    const tableRows = table
      .selectAll('.table-body-row')
      .data(data)
      .join('tr')
      .attr('class', 'table-body-row')

    const tableCells = tableRows
      .selectAll('td')
      .data((d) => {
        return headers.map((header) => d[header.fieldValue])
      })
      .join('td')
      .text((d) => d)
  }



}

window.addEventListener("DOMContentLoaded", App);