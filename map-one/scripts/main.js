function App() {

  const scaleExtent = [0.5, 15]
  let mapJson = null;
  let stateMap = null;
  let overallMap = null;
  let stateData = null;
  let currentZoom = 1
  let zoomDiff = 0.2

  loadData().then(({ geojson, statesData, pestsData }) => {
    mapJson = geojson;
    stateData = statesData

    function cleanKeys(data) {
      return data.map(obj => {
        const cleanedObj = {};
        for (let key in obj) {
          if (obj.hasOwnProperty(key)) {
            const cleanedKey = key.trim();
            cleanedObj[cleanedKey] = obj[key];
          }
        }
        return cleanedObj;
      });
    }

    const newPestsData = cleanKeys(pestsData)


    const states = stateData.map((d) => {
      return {
        label: d['Name of US State'].trim(),
        value: d['Name of US State'].trim()
      }
    }).sort((a, b) => {
      if (a.label < b.label) {
        return -1;
      }
      if (a.label > b.label) {
        return 1;
      }
      return 0;
    });


    const topTenStates = stateData.sort((a, b) => a.Ranking - b.Ranking).slice(0, 10)

    const headers = [
      {
        label: 'Rank',
        icon: './images/newIcons/rank.svg',
        fieldValue: 'Ranking',
        width: '10%'
      },
      {
        label: 'State',
        icon: './images/newIcons/state.svg',
        fieldValue: 'Name of US State',
        width: '15%'
      },
      {
        label: 'Restaurants',
        icon: './images/newIcons/restaurants.svg',
        fieldValue: 'Number of restaurants ',
        width: '10%'
      },
      {
        label: 'Farms',
        icon: './images/newIcons/farms.svg',
        fieldValue: 'Number of farms (2022)',
        width: '15%'
      },
      {
        label: 'Landfills',
        icon: './images/newIcons/landfills.svg',
        fieldValue: 'Number of landfills ',
        width: '10%'
      },
      {
        label: 'Searches',
        icon: './images/newIcons/search.svg',
        fieldValue: 'Total number of pest-related search queries',
        width: '10%'
      },
      {
        label: 'Pest Control Companies',
        icon: './images/newIcons/control.svg',
        fieldValue: 'Number of pest control companies',
        width: '30%'
      }
    ]


    const stateTableHeader = [{
      label: 'Rank',
      icon: './images/newIcons/rank.svg',
      fieldValue: 'Ranking',
      width: '20%'
    },
    {
      label: 'Pest',
      icon: './images/newIcons/control.svg',
      fieldValue: 'pest',
      width: '60%'
    },
    {
      label: 'Searches',
      icon: './images/newIcons/search.svg',
      fieldValue: 'Total number of pest-related search queries',
      width: '20%'
    }
    ]

    const newMapData = stateData.reduce((obj, d) => {
      obj[d['Name of US State'].trim()] = d.Ranking
      return obj
    }, {})

    const getTooltipContent = (name, value, target, version) => {
      const nameAndRank = `
        <div class="name-and-rank">
       <span class='rank-value'> ${ordinal_suffix_of(value)} </span> ${name}
        </div>
      `;

      if (version === "mini") {
        return nameAndRank;
      }
      return;
    };

    function initMaps(newMapData) {
      overallMap = USMap({
        container: "#overall_map",
        desktopHeight: 450,
        mobileHeight: 200,
        geojson: mapJson,
        data: newMapData,
        colors: ['#E02126', '#E0212680', '#0255A380', '#0255A3'],
        tooltipContent: ({ name, value }, version) => {
          return getTooltipContent(name, value, 'test', version)
        },
      }).render();

    }

    initDropdown({
      list: states,
      id: "#categories_select",
      placeholder: `<div class='choice-label'>
				<svg width="19" height="25" viewBox="0 0 19 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9.50001 0.844666C4.38931 0.844666 0.225006 5.00897 0.225006 10.1197C0.225006 14.1447 4.18036 19.2554 6.80536 22.65L6.98036 22.8606C7.57508 23.6658 8.5198 24.1211 9.50008 24.1211C10.4804 24.1211 11.4251 23.6658 12.0198 22.8606C12.1948 22.6158 12.3698 22.4053 12.5804 22.1606C15.2054 18.8 18.775 14.1802 18.775 10.1213C18.775 5.01056 14.6107 0.844666 9.50001 0.844666ZM11.8106 21.5643C11.6356 21.809 11.425 22.0538 11.25 22.2643C10.8303 22.8249 10.2 23.1393 9.50001 23.1393C8.80001 23.1393 8.16973 22.8249 7.75001 22.2643L7.57501 22.0538C5.01973 18.7643 1.20536 13.7931 1.20536 10.1181C1.20536 5.56807 4.91606 1.82342 9.50001 1.82342C14.0857 1.82342 17.7947 5.53412 17.7947 10.1181C17.7947 13.8641 14.3304 18.3104 11.8106 21.5643Z" fill="#324C3D"/>
<path d="M9.5 6.13037C7.33028 6.13037 5.58035 7.88037 5.58035 10.05C5.58035 12.2197 7.33035 13.9697 9.5 13.9697C11.6697 13.9697 13.4197 12.2197 13.4197 10.05C13.4197 7.88037 11.6697 6.13037 9.5 6.13037ZM9.5 12.9897C7.88944 12.9897 6.56056 11.6594 6.56056 10.0502C6.56056 8.43967 7.89084 7.11079 9.5 7.11079C11.1106 7.11079 12.4394 8.44107 12.4394 10.0502C12.4394 11.6608 11.1105 12.9897 9.5 12.9897Z" fill="#324C3D"/>
</svg>
			<div>	Select State </div>
				</div>`,
      searchPlaceholderValue: 'Search',
      searchEnabled: true,
      cb: (state) => {

        // show tooltip
        const specificPathNode = d3.select(`path[data-state='${state}']`).node();
        const foundStateObject = stateData.find((d) => d['Name of US State'].trim() === state)
        const foundRank = foundStateObject.Ranking
        const foundState = foundStateObject['Name of US State']
        const version = "mini"
        if (specificPathNode) {
          tippy(specificPathNode, {
            content: getTooltipContent(foundState, foundRank, 'test', version),
            allowHTML: true,
            arrow: true,
            theme: 'light',
            animation: 'scale',
            placement: 'top',
            trigger: 'manual'
          }).show();
        } else {
          console.error(`Path node for county '${state}' not found.`);
        }
        // redraw table
        const chosenStatePests = newPestsData.filter((d) => d.Keyword !== "Total search volume").slice()
          .sort((a, b) => {
            return b[state] - a[state]
          }
          )
          .slice(0, 10).map((d, index) => {
            return {
              'Name of US State': state,
              Ranking: index + 1,
              'Total number of pest-related search queries': d[state],
              pest: d.Keyword

            }
          })
        drawTable(stateTableHeader, chosenStatePests, `Top 10 most common pest searches in ${state}`, '400px')
      }
    });


    drawTable(headers, topTenStates, 'Top 10 States most affected by pest infestations', '798px')
    initMaps(newMapData);
    addEvents();
  });

  function loadData() {
    return Promise.all([
      d3.json("./data/map.json"),
      d3.csv('./data/AllData.csv', d3.autoType),
      d3.csv('./data/Pest-by-states.csv', d3.autoType)
    ]).then(([geojson, statesData, pestsData]) => {
      return { geojson, statesData, pestsData }
    });
  }

  function addEvents() {
    d3.select(window).on("resize", () => {
      overallMap.resize();
      stateMap.resize();
    });
  }

  function drawTable(headers, data, title, width) {


    d3.select('.table-box').style('width', window.innerWidth < 576 ? '100%' : width)

    d3.select('.table-title').html(title)
    const table = d3.select('#table')

    const tableHeader = table
      .selectAll('.table-header-row')
      .data(['tr'])
      .join('tr')
      .attr('class', 'table-header-row')


    const tableHeaderCells = tableHeader.selectAll('th')
      .data(headers)
      .join('th')
      .style('width', (d) => d.width)
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
      .text((d, index) => {
        return index === 0 ? ordinal_suffix_of(d) : d
      })
  }

  d3.select('#zoom_in').on('click', () => {
    if (currentZoom + zoomDiff <= scaleExtent[1]) {
      currentZoom = currentZoom + zoomDiff
    }
    overallMap.zoom(currentZoom)
  })

  d3.select("#zoom_out").on('click', () => {
    if (currentZoom - zoomDiff >= scaleExtent[0]) {
      currentZoom = currentZoom - zoomDiff
    }
    overallMap.zoom(currentZoom)
  })


}

window.addEventListener("DOMContentLoaded", App);