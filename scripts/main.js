function App() {
  const categories = [
    {
      label: "Overall rank",
      value: "overall",
      mainColor: "#0355A3",
      secondaryColor: "#E6EEF6",
      icon: "overall.svg",
      rankField: "Overall",
      legendLabels: [
        "Best overall",
        "Worst overall",
      ],
    },
    {
      label: "Organic farm ratio",
      value: "organic_farm",
      mainColor: "#AAD155",
      secondaryColor: "#F7FAEE",
      icon: "organic-farm.svg",
      rankField: "Organic Farm Ratio",
      legendLabels: [
        "Most organic farms",
        "Least organic farms",
      ],
      field: "Farms per Organic Farm",
      getValue: (d, col) => {
        return `<span class="text-bold">1 in ${d[col.field]}</span> farms are organic`
      }
    },
    {
      label: "National park coverage",
      value: "national_park",
      mainColor: "#006A34",
      secondaryColor: "#D9E9E1",
      icon: "national-park.svg",
      rankField: "National Park Coverage",
      legendLabels: [
        "More coverage",
        "Less coverage",
      ],
      field: "National Park Coverage",
      getValue: (d, col) => {
        return `<span class="text-bold">${d[col.field]}</span>`;
      }
    },
    {
      label: "Air quality",
      value: "air_quality",
      mainColor: "#4393CF",
      secondaryColor: "#EBF3F9",
      icon: "air-quality.svg",
      rankField: "Air Quality",
      legendLabels: [
        "Better air quality",
        "Worse air quality",
      ],
      field: "Air Quality Index",
      getValue: (d, col) => {
        return `<span class="text-bold">${d[col.field]}</span>`;
      }
    },
    {
      label: "Lowest carbon footprint",
      value: "lowest_carbon_footprint",
      mainColor: "#E34053",
      secondaryColor: "#FBE2E5",
      icon: "carbon-footprint.svg",
      rankField: "Carbon Footprint in 2020",
      legendLabels: [
        "Lower footprint (better)",
        "Higher footprint (worse)",
      ],
      reverse: true,
      field: "Carbon Footprint in 2020 (million tonnes)",
      getValue: (d, col) => {
        return `<span class="text-bold">${d[col.field]} million tonnes</span>`
      }
    },
    {
      label: "Change in carbon footprint",
      value: "change_in_carbon_footprint",
      mainColor: "#FF881B",
      secondaryColor: "#FFF3E8",
      icon: "change-in-footprint.svg",
      rankField: "Carbon Footprint Change YoY",
      legendLabels: [
        "Most change (better)",
        "Least change (worse)"
      ],
      valueLabel: "YoY change in carbon footprint",
      field: "Carbon Footprint Change YoY",
      getValue: (d, col) => {
        return `<span class="text-bold">${d[col.field]} vs 2019</span>`
      }
    },
    {
      label: "Solar energy usage",
      value: "solar_energy_usage",
      mainColor: "#FBCD66",
      secondaryColor: "#FEF5E0",
      icon: "solar-energy.svg",
      rankField: "Solar Thermal & Photovoltaic Energy Consumption",
      legendLabels: [
        "Most solar usage",
        "Least solar usage"
      ],
      field: "Solar Thermal & Photovoltaic Energy Consumption (Trillion Btu)",
      getValue: (d, col) => {
        return `<span class="text-bold">${d[col.field]} trillion BTU</span>`
      }
    },
    {
      label: "Total renewable energy usage",
      value: "total_renewable_energy_usage",
      mainColor: "#ACA7E9",
      secondaryColor: "#F7F6FD",
      icon: "total-energy.svg",
      rankField: "Total Renewable Energy Consumption",
      legendLabels: [
        "Most usage",
        "Least usage"
      ],
      field: "Total Renewable Energy Consumption (Trillion Btu)",
      getValue: (d, col) => {
        return `<span class="text-bold">${d[col.field]} trillion BTU</span>`
      }
    },
    {
      label: "Demand for electric cars",
      value: "demand_for_electric_cars",
      mainColor: "#AAAFC7",
      secondaryColor: "#F7F7F9",
      icon: "electric-cars.svg",
      rankField: "Search Demand for 'Electric Cars'",
      legendLabels: [
        "Highest demand",
        "Lowest demand",
      ],
      field: "Electric Car' Search Popularity",
      getValue: (d, col) => {
        return `<span class="text-bold">${ordinal_suffix_of(d[col.field])}</span> highest`;
      }
    }
  ];

  let catObj = categories[0];
  let catObjState = categories[0];
  let mapJson = null;
  let stateMap = null;
  let overallMap = null;
  let allData = null;
  let pestData = null;
  let statesSwiper = null;
  let duplicatesOverall = {};
  let duplicatesStates = {};

  loadData().then(({ geojson, data, pestsData }) => {
    mapJson = geojson;
    pestData = pestsData;
    allData = data

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
    console.log(states)
    initMaps();

    onCategoryChange(catObj.value);
    addEvents();

  });

  function loadData() {
    return Promise.all([
      d3.json("./data/map.json"),
      d3.csv("./data/Raw_data.csv", d3.autoType),
      d3.csv('./data/allData.csv', d3.autoType),
      d3.csv("./data/Rankings.csv", d3.autoType),
    ]).then(([geojson, rawData, pestsData, rankings,]) => {
      const data = rawData.map(d => {
        return {
          ...d,
          rank: rankings.find(x => x.State === d.State),
        }
      })
      return {
        geojson,
        data,
        pestsData
      }
    });
  }

  function initMaps() {
    const getTooltipContent = (name, value, target, version) => {
      const nameAndRank = `
        <div class="name-and-rank">
       <span class='rank-value'> ${value}${get_ordinal_suffix(value)} </span> ${name}
        </div>
      `;

      if (version === "mini") {
        return nameAndRank;
      }
      return
    };

    overallMap = USMap({
      container: "#overall_map",
      desktopHeight: 450,
      mobileHeight: 200,
      geojson: mapJson,
      data: {},
      colors: [],
      tooltipContent: ({ name, value }, version) => {
        return getTooltipContent(name, value, 'test', version)
      },
    }).render();


    $('#state-tab').on('shown.bs.tab', function (e) {
      stateMap.resize();
    });
    $('#overall-tab').on('shown.bs.tab', function (e) {
      overallMap.resize();
    });
  }

  function addLegend({ labels, colors, container }) {
    const el = d3.select(container);

    const gradient = `linear-gradient(to right, ${colors[0]} 0%, ${colors[colors.length - 1]} 100%)`;

    el.patternify({
      tag: "div",
      selector: "legend"
    })
      .html(d => `
      <div class="legend-rect" style="background: ${gradient};"></div>
      <div class="legend-labels">
        ${labels.map(d => `<div class="legend-label">${d}</div>`).join("")}
      </div>
    `)
  }


  function onCategoryChange(value) {
    const category = categories.find(d => d.value === value);
    duplicatesOverall = {};

    if (category) {
      catObj = category;

      const mapData = allData.reduce((obj, d, index, arr) => {
        obj[d.State] = d.rank[catObj.rankField];
        duplicatesOverall[d.State] = arr.filter(x => x.rank[catObj.rankField] === d.rank[catObj.rankField]).length > 1;
        return obj;
      }, {});

      console.log(mapData)

      const newMapData = pestData.reduce((obj, d) => {
        obj[d['Name of US State'].trim()] = d.Ranking
        return obj
      }, {})

      console.log(newMapData)

      const top10 = allData.slice().sort((a, b) => {
        return a.rank[catObj.rankField] - b.rank[catObj.rankField];
      }).slice(0, 10).map((d, i) => {
        return {
          ...d,
          rank: d.rank[catObj.rankField]
        }
      });

      const topTen = pestData.slice(0, 10)

      const tableRows = d3.select("#top_10_table").patternify({
        tag: "div",
        selector: "table-row",
        data: top10
      })
        .attr("data-value", catObj.value)
        .html(d => `
        <div class="rank">${duplicatesOverall[d.State] ? '=' : ''}${getRankValue(d.rank)}</div>
        <div class="name">${d.State}</div>
      `);

      const tooltipOptions = {
        allowHTML: true,
        arrow: true,
        maxWidth: 300,
        duration: 0,
        placement: "top-end",
        popperOptions: {
          modifiers: [
            {
              name: "computeStyles",
              options: {
                gpuAcceleration: false,
              },
            },
          ],
        },
        theme: "light",
        offset: [0, 0],
        hideOnClick: true,
      };

      // tableRows.each(function (d) {
      //   if (this._tippy) {
      //     this._tippy.destroy();
      //   }
      //   if (catObj.getValue) {
      //     const content = `
      //       <div class="top-10-table-tooltip">
      //         <div class="stat-row" style="background-color: ${catObj.secondaryColor}">
      //           <div class="icon">
      //             <img src="./images/searchIcons.svg" />
      //           </div>
      //           <div>
      //             <div class="label">${catObj.label}</div>
      //             <div class="value">${catObj.getValue(d, catObj)}</div>
      //           </div>
      //         </div>
      //       </div>
      //     `;

      //     if (content) {
      //       tippy(this, {
      //         ...tooltipOptions,
      //         borderRadius: 40,
      //         content,
      //       });
      //     }
      //   }
      // });

      const color = d3.color(catObj.mainColor);

      let colors = [
        color.copy({ opacity: 1.0 }).toString(),
        color.copy({ opacity: 0.75 }).toString(),
        color.copy({ opacity: 0.5 }).toString(),
        color.copy({ opacity: 0.25 }).toString(),
        color.copy({ opacity: 0.1 }).toString(),
      ];

      if (catObj.reverse) {
        colors = colors.reverse()
      }

      overallMap.update(newMapData, colors);

      // update overall map legend
      addLegend({
        container: "#overall_map_legend",
        colors,
        labels: catObj.legendLabels
      });
    }
  }

  function addEvents() {
    d3.select(window).on("resize", () => {
      overallMap.resize();
      stateMap.resize();
    });

  }
}

window.addEventListener("DOMContentLoaded", App);