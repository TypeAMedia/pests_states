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
  let statesSwiper = null;
  let duplicatesOverall = {};
  let duplicatesStates = {};

  loadData().then(({ geojson, data }) => {
    mapJson = geojson;
    allData = data;

    initDropdown({
      list: categories,
      id: "#categories_select",
      cb: onCategoryChange_State,
    });

    initMaps();
    initCategoriesSwiper();

    onCategoryChange(catObj.value);
    onCategoryChange_State(catObjState.value);
    addEvents();
  });

  function loadData() {
    return Promise.all([
      d3.json("./data/map.json"),
      d3.csv("./data/Raw_data.csv", d3.autoType),
      d3.csv("./data/Rankings.csv", d3.autoType),
    ]).then(([ geojson, rawData, rankings ]) => {
      const data = rawData.map(d => {
        return {
          ...d,
          rank: rankings.find(x => x.State === d.State),
        }
      })
      return {
        geojson,
        data
      }
    });
  }

  function initMaps() {
    const getTooltipContent = (name, value, target, version) => {
      const duplicates = target === "overall-map" ? duplicatesOverall : duplicatesStates;
      const nameAndRank = `
        <div class="name-and-rank ${version}">
          <div class="name">${name}</div>
          <div class="rank">${duplicates[name] ? "=" : ""}${ordinal_suffix_of(value)} ${catObj.label.toLowerCase()}</div>
        </div>
      `;

      if (version === "mini") {
        return nameAndRank;
      }
      return `
        <div class="map-tooltip">
          ${value > 1 ? `<div class="h-100 btn-wrap">
            <button class="btn btn-light left-arrow tooltip-arrow-btn" data-value="${name}" data-target="${target}">${ARROW_LEFT}</button>
          </div>` : ''}
          ${nameAndRank}
          <div class="h-100 btn-wrap">
            <button class="btn btn-light right-arrow tooltip-arrow-btn" data-value="${name}" data-target="${target}">${ARROW_RIGHT}</button>
          </div>
        </div>
      `;
    };

    overallMap = USMap({
      container: "#overall_map",
      desktopHeight: 450,
      mobileHeight: 250,
      geojson: mapJson,
      data: {},
      colors: [],
      tooltipContent: ({ name, value }, version) => {
        return getTooltipContent(name, value, "overall-map", version)
      },
    }).render();

    stateMap = USMap({
      container: "#state_map",
      desktopHeight: 300,
      mobileHeight: 300,
      geojson: mapJson,
      data: {},
      colors: [],
      tooltipContent: ({ name, value }) => {
        return `
          <div class="states-tooltip">
            <span class="text-bold">${duplicatesStates[name] ? "=" : ""}${value < 10 ? "0" + value : value}</span> ${name}
          </div>
        `
      },
      hideClickTooltip: true,
      onStateClick: (name) => {
        const sortedData = stateMap.getDataArr();
        const index = sortedData.findIndex((d) => d.name === name);
        statesSwiper && statesSwiper.slideTo(index, 0);
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

  function initCategoriesSwiper() {
    const container = "#categories_swiper";
    const el = d3.select(container).select(".swiper-wrapper").html("");

    const slide = el.patternify({
      tag: "button",
      selector: "swiper-slide",
      data: categories,
    })
    .attr("data-value", d => d.value)
    .classed("category-slide", true)
    .style("border", d => `1.5px solid ${d.mainColor}`)
    .html(d => `
      <span class="category-icon"><img src="./images/icons/${d.icon}" /></span>
      <span class="category-label">${d.label}</span>
    `)

    const swiper = new Swiper(container, {
      direction: "horizontal",
      loop: true,

      effect: "slide",

      pagination: {
        el: ".swiper-pagination",
        dynamicBullets: true,
        dynamicMainBullets: 2,
        clickable: true,
      },

      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },

      slidesPerView: "auto",
      spaceBetween: 8,

      centeredSlides: true,
      grabCursor: true,
      noSwipingClass: "no-swiper",

      on: {
        slideChange: (e) => {
          const slide = e.slides[e.activeIndex];
          onCategoryChange(slide.getAttribute("data-value"));
        },
      },
    });

    // slide.on("click", (e, d) => {
    //   let index = -1;

    //   swiper.slides.forEach((x, i) => {
    //     if (x.getAttribute("data-value") === d.value) {
    //       index = i;
    //     }
    //   });

    //   console.log(index);

    //   if (index > -1) {
    //     swiper.slideTo(index, 0);
    //   }
    // });
  }

  function initStatesSwiper(data) {
    const container = "#states_swiper";
    const el = d3.select(container).select(".swiper-wrapper").html("");

    const slide = el.patternify({
      tag: "div",
      selector: "swiper-slide",
      data: data,
    })
    .attr("data-value", d => d.State)
    .classed("states-slide", true)

    slide
      .patternify({
        tag: "div",
        selector: "overlay",
        data: (d) => [d],
      })
      .classed("no-export", true);
    
    slide.each(createCard);

    if (statesSwiper) {
      statesSwiper.destroy();
    }

    statesSwiper = new Swiper(container, {
      direction: "horizontal",
      loop: false,

      effect: "slide",

      pagination: {
        el: ".swiper-pagination",
        type: "fraction",
        // dynamicBullets: true,
        // dynamicMainBullets: 2,
        // clickable: true,
      },

      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },

      slidesPerView: "auto",
      spaceBetween: 22,

      centeredSlides: true,
      grabCursor: true,
      noSwipingClass: "no-swiper",

      on: {
        slideChange: (e) => {
          const slide = e.slides[e.activeIndex];
          const state = slide.getAttribute("data-value");
          stateMap.highlight(state, true);
        },
      },
    });
  }

  function createCard() {
    const el = d3.select(this);

    el.patternify({
      tag: "div",
      selector: "card-header",
      data: d => [d]
    })
    .html(d => `
      <div class="card-header-content">
        <div class="rank">${duplicatesStates[d.State] ? "=" : ""}${d.rank}</div>
        <div class="state-name">${d.State}</div>
      </div>
    `);

    const cardBodyContent = el.patternify({
      tag: "div",
      selector: "card-body-content",
      data: d => [d]
    });

    const cardRows = categories
    .filter(d => d.value !== "overall")
    .slice()
    .sort((a, b) => {
      if (a.value === catObjState.value) {
        return -1;
      }
      if (b.value === catObjState.value) {
        return 1;
      }
      return 0;
    });

    cardBodyContent.patternify({
      tag: "div",
      selector: "stat-row",
      data: d => {
        return cardRows.map(x => {
            return {
              category: x,
              value: x.getValue(d, x)
            }
          })
      } 
    })
    .style("background-color", d => d.category.secondaryColor)
    .html(d => `
      <div class="icon">
        <img src="./images/icons/${d.category.icon}" />
      </div>
      <div>
        <div class="label">${d.category.label}</div>
        <div class="value">${d.value}</div>
      </div>
    `)
  }

  function onCategoryChange(value) {
    const category = categories.find(d => d.value === value);
    duplicatesOverall = {};

    if (category) {
      catObj = category;

      updateCssVar("--current-main-color", catObj.mainColor);

      // update top 10
      d3.select("#category_chip img").attr("src", `./images/icons/${catObj.icon}`);
      d3.select("#category_chip .label").html(catObj.label);

      const mapData = allData.reduce((obj, d, index, arr) => {
        obj[d.State] = d.rank[catObj.rankField];
        duplicatesOverall[d.State] = arr.filter(x => x.rank[catObj.rankField] === d.rank[catObj.rankField]).length > 1;
        return obj;
      }, {});
      
      const top10 = allData.slice().sort((a, b) => {
        return a.rank[catObj.rankField] - b.rank[catObj.rankField];
      }).slice(0, 10).map((d, i) => {
        return {
          ...d,
          rank: d.rank[catObj.rankField]
        }
      });

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
        // trigger: "manual",
        offset: [0, 0],
        hideOnClick: true,
      };

      tableRows.each(function (d) {
        if (this._tippy) {
          this._tippy.destroy();
        }
        if (catObj.getValue) {
          const content = `
            <div class="top-10-table-tooltip">
              <div class="stat-row" style="background-color: ${catObj.secondaryColor}">
                <div class="icon">
                  <img src="./images/icons/${catObj.icon}" />
                </div>
                <div>
                  <div class="label">${catObj.label}</div>
                  <div class="value">${catObj.getValue(d, catObj)}</div>
                </div>
              </div>
            </div>
          `;
    
          if (content) {
            tippy(this, {
              ...tooltipOptions,
              borderRadius: 40,
              content,
            });
          }
        }
      });

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

      overallMap.update(mapData, colors);

      // update overall map legend
      addLegend({
        container: "#overall_map_legend",
        colors,
        labels: catObj.legendLabels
      });
    }
  }

  function onCategoryChange_State(value) {
    const category = categories.find(d => d.value === value);

    duplicatesStates = {};

    if (category) {
      catObjState = category;

      updateCssVar("--current-main-color-state", catObjState.mainColor);
      updateCssVar("--current-secondary-color-state", catObjState.secondaryColor);

      const color = d3.color(catObjState.mainColor);

      let colors = [
        color.copy({ opacity: 1.0 }).toString(),
        color.copy({ opacity: 0.75 }).toString(),
        color.copy({ opacity: 0.5 }).toString(),
        color.copy({ opacity: 0.25 }).toString(),
        color.copy({ opacity: 0.1 }).toString(),
      ];

      if (catObjState.reverse) {
        colors = colors.reverse()
      }

      const mapData = allData.reduce((obj, d, index, arr) => {
        obj[d.State] = d.rank[catObjState.rankField];
        duplicatesStates[d.State] = arr.filter(x => x.rank[catObjState.rankField] === d.rank[catObjState.rankField]).length > 1;
        return obj;
      }, {});

      stateMap.update(mapData, colors);

      addLegend({
        container: "#state_map_legend",
        colors,
        labels: catObjState.legendLabels
      });
      // States swiper data

      const swiperData = allData.slice().sort((a, b) => {
        return a.rank[catObjState.rankField] - b.rank[catObjState.rankField];
      }).map(d => {
        return {
          ...d,
          rank: d.rank[catObjState.rankField],
        }
      });

      initStatesSwiper(swiperData);
    }
  }

  function addEvents() {
    d3.select(window).on("resize", () => {
      overallMap.resize();
      stateMap.resize();
    });

    document.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      if (e.target.classList.contains("tooltip-arrow-btn")) {
        const state = e.target.getAttribute("data-value");
        const target = e.target.getAttribute("data-target");

        if (!state) return;

        const map = target === "overall-map" ? overallMap : stateMap;
        const sortedList = map.getDataArr()

        let index = null;
        let curIndex = sortedList.findIndex((d) => d.name === state);

        if (e.target.classList.contains("left-arrow")) {
          if (curIndex > -1) {
            if (curIndex === 0) {
              index = sortedList.length - 1;
            } else {
              index = curIndex - 1;
            }
          }
        }

        if (e.target.classList.contains("right-arrow")) {
          if (curIndex > -1) {
            if (curIndex === sortedList.length - 1) {
              index = 0;
            } else {
              index = curIndex + 1;
            }
          }
        }

        if (index !== null) {
          map.highlight(sortedList[index].name, true);
        }
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", App);