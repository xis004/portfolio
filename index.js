import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');
if (projectsContainer) {
    renderProjects(latestProjects, projectsContainer, 'h2');
} else {
    console.error("Projects container not found");
}

const githubData = await fetchGitHubData('xiangyshi');  

const profileStats = document.querySelector('#profile-stats');
console.log(githubData);

const deltaYearMonths = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const delta = today - date;
    const months = Math.floor(delta / (1000 * 60 * 60 * 24 * 30));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
}

const getCompanyLink = async (company) => {
    if (!company) return null;
    const normalizedCompany = company.trim().toLowerCase().replace(/ /g, '-').replace(/@/g, '');
    const link = `https://www.github.com/${normalizedCompany}`;
    
    try {
        const response = await fetch(link, {
            method: 'HEAD',
            mode: 'no-cors'
        });
        return link;
    } catch (error) {
        console.error('Error checking company link:', error);
    }
    return "https://www.google.com/search?q=" + encodeURIComponent(company);
}


if (profileStats) {

    profileStats.innerHTML = `

          <dl>
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Professional Experience:</dt><dd>${deltaYearMonths(githubData.created_at)}</dd>
            <dt>Working At:</dt><dd><a href="${await getCompanyLink(githubData.company)}">${githubData.company}</a></dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
          </dl>
      `;

  }