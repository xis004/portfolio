let data = [];
let commits;
function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          configurable: false,
          writable: false,
          enumerable: true
        });
  
        return ret;
    });
}

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
}

function displayStats() {
    // Process commits first
    processCommits();
  
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // New statistics
    const numFiles = d3.groups(data, d => d.file).length; // Assuming 'file' is a property in data
    const maxFileLength = d3.max(data, d => d.length); // Assuming 'length' is a property in data
    const avgFileLength = d3.mean(data, d => d.length); // Assuming 'length' is a property in data
    const avgDepth = d3.mean(data, d => d.depth); // Assuming 'depth' is a property in data

    dl.append('dt').text('Number of files');
    dl.append('dd').text(numFiles);
  
    dl.append('dt').text('Maximum file length (in lines)');
    dl.append('dd').text(maxFileLength);
  
    dl.append('dt').text('Average file length (in lines)');
    dl.append('dd').text(Math.round(avgFileLength));
  
    dl.append('dt').text('Average depth');
    dl.append('dd').text(avgDepth);
}

const width = 1000;
const height = 600;

let xScale, yScale; // Declare xScale and yScale in a broader scope

function createScatterplot() {
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    
    // Create a square root scale for the radius
    const rScale = d3
        .scaleSqrt()
        .domain([minLines, maxLines])
        .range([2, 30]); // Adjust these values based on your experimentation

    xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

    yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);

    const dots = svg.append('g').attr('class', 'dots');

    // Sort commits by total lines in descending order
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    dots
        .selectAll('circle')
        .data(sortedCommits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines)) // Use the radius scale
        .style('fill', 'steelblue') // Change the dot color to blue
        .style('fill-opacity', 0.7) // Add transparency for overlapping dots
        .on('mouseenter', function (event, commit) {
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
            d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
        })
        .on('mouseleave', function () {
            updateTooltipContent({});
            updateTooltipVisibility(false);
            d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore transparency
        })
        .on('mousemove', (event) => {
            updateTooltipPosition(event);
        });

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    svg
        .append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    // Add Y axis
    svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

    // Add gridlines
    const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    brushSelector();
}

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const totalLines = document.getElementById('commit-lines');

    if (Object.keys(commit).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
    time.textContent = commit.datetime?.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    author.textContent = commit.author; // Assuming commit has an author property
    totalLines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

function brushSelector() {
    const svg = document.querySelector('svg');
    d3.select(svg).call(d3.brush());
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  await displayStats();
  createScatterplot();
});

let brushSelection = null;

function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
}

function isCommitSelected(commit) {
    if (!brushSelection) return false; 
    const min = { x: brushSelection[0][0], y: brushSelection[0][1] }; 
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] }; 
    const x = xScale(commit.date); const y = yScale(commit.hourFrac); 
    console.log(x >= min.x && x <= max.x && y >= min.y && y <= max.y);
    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

function updateSelection() {
    // Update visual state of dots based on selection
    d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
    updateSelectionCount();
    updateLanguageBreakdown();
}

function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
}

function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  
    // Update DOM with breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  
    return breakdown;
}