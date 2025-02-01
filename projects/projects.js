import { fetchJSON, renderProjects } from '../global.js';
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
