function App() {
  let showMore = true;

  loadData().then(({ data }) => {
    let tableData = []
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
        width: "25%",
      },
      {
        label: 'Avg. monthly searches',
        icon: './images/newIcons/search.svg',
        fieldValue: 'Avg. monthly searches',
        width: "30%",
      },
      {
        label: 'Year-on-year - change',
        icon: './images/newIcons/change.svg',
        fieldValue: 'Year-on-year- change',
        width: "25%",
      }
    ]

    drawTable(headers, data.filter((d, i) => i <= 9))

    d3.select('#show_more')
      .on('click', function () {
        showMore = !showMore
        if (!showMore) {
          d3.select(this).html('SHOW LESS')
          tableData = data
        } else {
          d3.select(this).html('SHOW MORE')
          tableData = data.filter((d, i) => i <= 9)
        }
        drawTable(headers, tableData)
      })

    addEvents();
  });

  function loadData() {
    return Promise.all([
      d3.csv('./data/data.csv', d3.autoType)
    ]).then(([data]) => {
      return { data }
    });
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

}

window.addEventListener("DOMContentLoaded", App);