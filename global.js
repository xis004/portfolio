function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
const baseURL = "portfolio/";
const devURL = "";
let pages = [
    { url: 'index.html', title: 'Home' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'contact/index.html', title: 'Contact' },
    { url: 'contact/resume.html', title: "Resume"},
    { url: 'https://github.com/xiangyshi', title: "GitHub"},

    // { url: devURL + 'index.html', title: 'Home' },
    // { url: devURL + 'projects/index.html', title: 'Projects' },
    // { url: devURL + 'contact/index.html', title: 'Contact' },
    // { url: devURL + 'contact/resume.html', title: "Resume"},
    // { url: 'https://github.com/xiangyshi', title: "GitHub"},
];
let nav = document.createElement('nav');
const ARE_WE_HOME = document.documentElement.classList.contains('home');
document.body.prepend(nav);
for (let p of pages) {
    let url = p.url;
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }
    let title = p.title;
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }
    if (a.host != location.host) {
        a.target="_blank"
    }
    nav.append(a);
}

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select>
              <option value="light dark"> Automatic </option>
              <option value="light"> Light </option>
              <option value="dark"> Dark </option>
          </select>
      </label>`
);

if (localStorage.colorScheme) {
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
}

let select = document.querySelector(".color-scheme");

select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value
});

let form = document.querySelector("form");
form?.addEventListener('submit', (event) => {
    event.preventDefault();
    let data = new FormData(form);
    let params = [];
    for (let [name, value] of data) {
        let param = `${name}=${encodeURIComponent(value)}`;
        params.push(param);
    }
    let url = `mailto:xiangy.shi@gmail.com?${params.join('&')}`;
    window.location.href = url;
})

export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data; 
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = '';
    for (let proj of project) {
        const article = document.createElement('article');
        article.innerHTML = `
            <${headingLevel}>${proj.title}</${headingLevel}>
            <img src="${proj.image}" alt="${proj.title}">
            <div class="proj_description">
                <p>${proj.description}</p>
            </div>
            <div class="proj_year">
                <p> ${proj.year} </p>
            </div>
        `;
        containerElement.appendChild(article);
    }
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}