function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
const baseURL = "portfolio/";
const devURL = "http://localhost:5500/";
let pages = [
    { url: baseURL + 'index.html', title: 'Home' },
    { url: baseURL + 'projects/index.html', title: 'Projects' },
    { url: baseURL + 'contact/index.html', title: 'Contact' },
    { url: baseURL + 'contact/resume.html', title: "Resume"},
    { url: 'https://github.com/xiangyshi', title: "GitHub"},
];
console.log(pages);
let nav = document.createElement('nav');
const ARE_WE_HOME = document.documentElement.classList.contains('home');
document.body.prepend(nav);
for (let p of pages) {
    let url = p.url;
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }
    console.log(url);
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