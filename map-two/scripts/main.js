function App() {

  const scaleExtent = [0.5, 15]
  let mapJson = null;
  let stateMap = null;
  let overallMap = null;
  let pestData = null;
  let currentZoom = 1
  let zoomDiff = 0.2

  loadData().then(({ geojson, pestsData, allPests, pestVolumes }) => {
    mapJson = geojson;
    pestData = pestsData;

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
    const newPestsData = cleanKeys(allPests)

    function getFirst10StatesForKeyword(keywordObject) {
      const keyword = keywordObject.Keyword;
      const stateEntries = Object.entries(keywordObject)
        .filter(([key]) => key !== 'Keyword' && key !== 'Total')
        .map(([state, value]) => ({ state, value }))
        .sort((a, b) => b.value - a.value)
        .map(({ state, value }) => {
          return {
            searches: value,
            state: state
          }
        })
        .slice(0, 10)
      return {
        [keyword]: stateEntries
      };
    }

    const first10StatesForEachKeyword = newPestsData.map(getFirst10StatesForKeyword)


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
      placeholder: `<div class='choice-label'>
			<svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.8856 3.39578C16.0948 3.5407 16.2903 3.71023 16.4721 3.90572C16.9219 4.3897 17.3389 5.23737 17.6588 6.15339L21.6058 5.13209L22.0966 3.43816L23.0837 2.25282C23.3052 1.98758 23.6989 1.95203 23.9642 2.17215C24.2294 2.39363 24.2649 2.78738 24.0448 3.05261L23.2245 4.03699L22.6093 6.16296L18.0113 7.3524C18.1139 7.77485 18.189 8.18365 18.2328 8.55142L20.5228 8.50221C21.3459 8.48307 22.1416 8.79068 22.739 9.35533L24.2867 10.8196L25.967 11.484C26.2869 11.6112 26.4441 11.9748 26.3184 12.2961C26.1912 12.6161 25.8276 12.7747 25.5063 12.6475L23.6031 11.8942L21.8805 10.2645C21.5209 9.9241 21.0438 9.74089 20.5502 9.75185L18.2177 9.80243C18.2 9.89814 18.1781 9.99384 18.1508 10.0868C18.1275 10.1675 18.0892 10.2399 18.04 10.3015C18.1672 10.4245 18.2806 10.5544 18.3791 10.6884C18.7824 11.2421 19.064 11.9544 19.2486 12.8198L22.7459 14.4372L22.9578 19.4891C22.9592 19.5205 22.9674 19.5493 22.981 19.5766L24.958 23.3734C25.1166 23.6796 24.9976 24.057 24.6914 24.217C24.3865 24.3756 24.0078 24.2566 23.8492 23.9504L21.8723 20.1536C21.7738 19.9649 21.7178 19.7557 21.7096 19.5424L21.5291 15.2521L19.4619 14.2965C19.4715 14.4058 19.4811 14.5179 19.4893 14.6314C19.5508 15.5146 19.5535 16.3131 19.5235 17.5736C19.5057 18.2804 19.5057 18.3297 19.5057 18.5361C19.5057 22.1537 16.8328 26.459 13.6526 26.459H12.9294C9.74933 26.459 7.07774 22.1537 7.07774 18.5361C7.07774 18.3296 7.07638 18.2804 7.05997 17.5736C7.02989 16.313 7.03263 15.5146 7.09415 14.6314C7.10099 14.522 7.11056 14.414 7.11876 14.3074L5.07756 15.2521L4.89709 19.5424C4.88752 19.7557 4.83284 19.9649 4.73303 20.1535L2.75746 23.9503C2.5975 24.2566 2.22014 24.3755 1.91389 24.217C1.60764 24.057 1.48871 23.6796 1.64865 23.3734L3.62423 19.5766C3.63927 19.5492 3.64747 19.5205 3.64747 19.4891L3.86075 14.4372L7.33205 12.8321C7.51662 11.9612 7.79825 11.2448 8.20432 10.6884C8.38342 10.4423 8.61449 10.2139 8.88654 10.0034C8.8551 9.93916 8.82775 9.87216 8.80451 9.80244L6.43655 9.75185C5.94438 9.74091 5.46586 9.92412 5.10764 10.2645L3.38497 11.8942L1.48048 12.6475C1.16056 12.7747 0.796898 12.6161 0.669743 12.2961C0.542595 11.9749 0.699822 11.6112 1.02111 11.484L2.70139 10.8196L4.24905 9.35534C4.8465 8.79068 5.64223 8.48307 6.46389 8.50221L8.74844 8.55143C8.79356 8.17273 8.87423 7.75024 8.98497 7.31274L4.54172 6.16292L3.92649 4.03695L3.10616 3.05258C2.88604 2.78735 2.92159 2.3936 3.18682 2.17212C3.45205 1.952 3.8458 1.98755 4.06728 2.25278L5.05439 3.43813L5.54519 5.13206L9.35004 6.11643C9.66313 5.24416 10.0665 4.43752 10.4985 3.96036C10.694 3.74435 10.9004 3.55979 11.1192 3.40253L10.8061 3.00332C10.102 2.11054 9.08067 1.52538 7.95412 1.36952C7.61233 1.32167 7.37305 1.00584 7.42094 0.664063C7.46742 0.322267 7.78326 0.0829931 8.12503 0.130873C9.57151 0.330482 10.884 1.08382 11.7878 2.23087L12.2786 2.85429C12.645 2.75586 13.0374 2.708 13.4571 2.708C13.9028 2.708 14.3225 2.75722 14.7149 2.86113L15.2112 2.23085C16.1149 1.08379 17.4274 0.330454 18.874 0.130849C19.2158 0.0829967 19.5316 0.322257 19.5781 0.664039C19.6259 1.00583 19.3867 1.32165 19.0449 1.3695C17.9183 1.52536 16.897 2.11052 16.1929 3.0033L15.8856 3.39578ZM10.2597 10.6075C10.1995 10.6581 10.1298 10.6964 10.0574 10.721C9.68821 10.937 9.39564 11.1763 9.21378 11.4251C8.72844 12.0895 8.44679 13.2161 8.34151 14.7173C8.28272 15.5512 8.27999 16.3196 8.31007 17.5432C8.32647 18.2665 8.32784 18.3143 8.32784 18.5358C8.32784 21.5518 10.5974 25.2075 12.9296 25.2075H13.6529C15.9853 25.2075 18.2547 21.5518 18.2547 18.5358C18.2547 18.3143 18.256 18.2665 18.2738 17.5432C18.3025 16.3196 18.2998 15.5512 18.241 14.7173C18.1371 13.2161 17.8541 12.0895 17.3687 11.4251C16.8602 10.7278 15.4943 10.1167 14.0054 9.84191L13.8701 9.8173L13.8619 9.81183C13.84 9.8091 13.814 9.80773 13.7867 9.80499C13.6541 9.79679 13.4763 9.79132 13.2918 9.79132C13.1072 9.79132 12.9294 9.79679 12.7968 9.80499C12.7681 9.80773 12.7435 9.8091 12.7203 9.81183L12.7134 9.8173L12.5767 9.84191C11.7154 10.0005 10.8964 10.2726 10.2593 10.6075L10.2597 10.6075ZM16.9944 9.5466C17.0149 9.43313 17.0245 9.31418 17.0245 9.18978C17.0245 8.02631 16.2916 5.54488 15.5575 4.75738C15.0434 4.20641 14.3516 3.95756 13.4575 3.95756C12.5948 3.95756 11.9604 4.20912 11.4258 4.79973C10.6916 5.60911 9.95885 8.03996 9.95885 9.16668C9.95885 9.24051 9.96295 9.30203 9.97389 9.35125C10.6766 9.02039 11.4969 8.77018 12.3501 8.61296L12.3528 8.6239C12.8313 8.51452 13.7514 8.51452 14.23 8.6239L14.2327 8.61296C15.2471 8.80027 16.2138 9.11866 16.9944 9.5466Z" fill="#051C34"/>
</svg>
			<div>	Select Pest </div>
				</div>`,
      searchPlaceholderValue: 'Search',
      searchEnabled: true,
      cb: (pest) => {
        // Redraw table
        function findObjectByPest(data, pest) {
          for (const obj of data) {
            if (pest in obj) {
              return obj[pest];
            }
          }
          return null;
        }
        const selectedPest = pest.toLowerCase();
        const foundObject = findObjectByPest(first10StatesForEachKeyword, selectedPest)
          .map((d, index) => {
            return {
              ...d,
              pest: pest.toLowerCase(),
              rank: index + 1,
            }
          })
        drawTable(stateHeaders, foundObject, `Top 10 States most affected by ${pest} infestations`)


        // Map tooltip show
        const firstState = foundObject[0].state
        const foundRank = foundObject[0].rank
        const foundSearches = foundObject[0].searches

        const specificPathNode = d3.select(`path[data-state='${firstState}']`).node();
        if (specificPathNode) {
          tippy(specificPathNode, {
            content: getTooltipContent(firstState, foundRank, foundSearches, 'test', 'mini'),
            allowHTML: true,
            arrow: true,
            theme: 'light',
            animation: 'scale',
            placement: 'top',
            trigger: 'manual'
          }).show();
        } else {
          console.error(`Path node for county '${firstState}' not found.`);
        }
      }
    });

    const getTooltipContent = (name, value, searches, target, version) => {
      const nameAndRank = `
        <div class="name-and-rank">
       <span class='rank-value'> ${value}${get_ordinal_suffix(value)} </span> ${name} 
       <span class='search-value'> ${searches}  </span>
       <span class='search-text'> SEARCHES </span>
        </div>
      `;

      if (version === "mini") {
        return nameAndRank;
      }
      return;
    };

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

    const stateHeaders = [
      {
        label: 'Rank',
        icon: './images/newIcons/rank.svg',
        fieldValue: 'rank',
        width: "20%",
      },
      {
        label: 'state',
        icon: './images/newIcons/state.svg',
        fieldValue: 'state',
        width: "60%",
      },
      {
        label: 'Searches',
        icon: './images/newIcons/search.svg',
        fieldValue: 'searches',
        width: "20%",
      },
    ]



    drawTable(headers, pestVolumes, 'Top 10 pest searches')

    initMaps(newMapData);
    addEvents();
  });

  function loadData() {
    return Promise.all([
      d3.json("./data/map.json"),
      d3.csv('./data/AllData.csv', d3.autoType),
      d3.csv('./data/Pest-by-states.csv', d3.autoType),
      d3.csv('./data/pests.csv', d3.autoType)
    ]).then(([geojson, pestsData, allPests, pestVolumes]) => {
      return { geojson, pestsData, allPests, pestVolumes }
    });
  }

  function initMaps(newMapData) {

    overallMap = USMap({
      container: "#overall_map",
      desktopHeight: 450,
      mobileHeight: 200,
      geojson: mapJson,
      data: newMapData,
      colors: ['#E02126', '#E0212680', '#0255A3', '#0255A380']
    }).render();
  }

  function addEvents() {
    d3.select(window).on("resize", () => {
      overallMap.resize();
      stateMap.resize();
    });
  }

  function drawTable(headers, data, title) {

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
				<div class=
        'header-label'> ${d.label} </div>
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