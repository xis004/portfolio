import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";


const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
if (projectsContainer) {
    renderProjects(projects, projectsContainer, "h2");
} else {
    console.error("Projects container not found");
}

const headerContainer = document.querySelector('.header');
headerContainer.innerHTML = `
    <h3> ${projects.length} Projects </h3>
`;

function renderPieChart(projectsGiven) {
    // re-calculate rolled data
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    );
    // re-calculate data
    let data = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    // re-calculate slice generator, arc data, arc, etc.
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let arcs = arcData.map((d) => arcGenerator(d));
    let total = 0;

    for (let d of data) {
        total += d;
    }
    
    let angle = 0;
    
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    for (let d of data) {
        let endAngle = angle + (d / total) * 2 * Math.PI;
        arcData.push({ startAngle: angle, endAngle });
        angle = endAngle;
    }
    let newSVG = d3.select('svg'); 
    newSVG.selectAll('path').remove();
    let legend = d3.select('.legend');
    legend.selectAll('li').remove();

    data.forEach((d, idx) => {
        legend.append('li')
              .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameter
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`) // set the inner html of <li>
    })

    let selectedIndex = -1;
    arcs.forEach((arc, idx) => {
        d3.select('svg')
          .append('path')
          .attr('d', arc)
          .attr('fill', colors(idx))
          .on('click', () => {
            selectedIndex = selectedIndex === idx ? -1 : idx;
            newSVG.selectAll('path')
                .attr('class', (_, idx) => (
                    selectedIndex == idx ? "selected" : ""
                ));
            legend.selectAll('li')
                .attr('class', (_, idx) => (
                    selectedIndex == idx ? "selected" : ""
                ));
            if (selectedIndex === -1) {
                renderProjects(projects, projectsContainer, "h2");
            } else {
                let filteredProjects = projects.filter((project) => (project.year === data[selectedIndex].label));
                renderProjects(filteredProjects, projectsContainer, 'h2');
            }
            });
    })
    
}

renderPieChart(projects);

let query = '';

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('change', (event) => {
    // update query value
    query = event.target.value;
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
    renderProjects(filteredProjects, projectsContainer, "h2");
    renderPieChart(filteredProjects);
});