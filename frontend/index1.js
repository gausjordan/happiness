// Prevent main menu to load pre-opened
const cbxTemp = document.querySelector('nav input[type="checkbox"]');
const menuTemp = document.querySelector('nav ul');
cbxTemp.addEventListener('change', () => {
  if (!cbxTemp.checked) {
    menuTemp.style.animationName = 'main-menu-slide-out';
  } else {
    menuTemp.style.animationName = 'main-menu-slide-in';
  }
});

// SVG splashscreen loader
const svgElements = [
    { url: 'frontend/graphics/icon.svg', target: 'icon' },
    { url: 'frontend/graphics/logo1.svg', target: 'logo1' }
];
svgElements.forEach(({ url, target }) => {
    fetch(url)
        .then(response => response.text())
        .then(svgContent => {
            if (document.getElementById(target)) {
                document.getElementById(target).innerHTML = svgContent;
                // console.log(document.getElementById(target));
            }
        });
});

// Faux-SPA routing
const routes = {
    "/home": '/frontend/home.html',
    "/about" : '/frontend/about.html',
    "/shop": '/frontend/shop.html'
};

// Clicking on links hides the menu


// Navigation handling via URI
const navigateTo = async (path) => {
    const app = document.getElementById("app");
    const view = routes[path];
    const page = await loadPage(view);
    const parser = new DOMParser();
    const parsedPage = parser.parseFromString(page, 'text/html');
    document.title = "Proba " + parsedPage.title;
    document.getElementById("app").innerHTML = page;
};

// Loaad and inject page content
async function loadPage(view) {
    try {
    const response = await fetch(view);
    const text = await response.text();
    return text;
    } catch (error) {
    return `<h1>Hardcoded Error</h1>`;
    }
}

// Event listener for navigation & quick menu hide
document.addEventListener("click", (event) => {
    if (event.target.matches("[data-link]")) {
        event.preventDefault();
        let root = document.querySelector(':root');
        let menu = document.getElementById("menu-icon");
        const old = getComputedStyle(root,null).getPropertyValue('--menu-animation-speed');
        root.style.setProperty('--menu-animation-speed', "0s");
        menu.click();
        setTimeout( () => root.style.setProperty('--menu-animation-speed', old), 500);
        const path = event.target.getAttribute("href");
        history.pushState({ path }, null, path);
        navigateTo(path);
    }
});

// back/forward navigation
window.addEventListener("popstate", (event) => {
    // Navigate to the path in the current history state
    const path = event.state?.path || window.location.pathname;
    navigateTo(path);
});

// Initialize the app on first load
const initialPath = window.location.pathname === '/' ? '/home' : window.location.pathname;    
history.replaceState({ path: initialPath }, null, initialPath);
navigateTo(initialPath);

// Temporary splashscreen removal
document.getElementsByTagName("aside")[0].style.display = "none";

