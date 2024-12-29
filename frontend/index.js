'use strict';

// Display splash screen (4 seconds, unhide content "below" after 3s)
function displaySplashScreen() {
    document.getElementById("app").style.display = "none";
    document.getElementById("splashscreen").removeAttribute("style", "display: none");
    setTimeout( () => document.getElementById("app").style.display = "block", 3000);
}




// Check if language is already chosen and show a single flag only
if (!localStorage.getItem('lang')) {
    localStorage.setItem('lang', 'hr');
 }

let flags = document.getElementsByClassName("lang-flag");
let lang = localStorage.getItem('lang');
for (let flag of flags) {
    if (lang === flag.getAttribute('id')) {
        flag.style.opacity = "0";
    } else {
        flag.style.opacity = "1";
    }
}

 // Translate main menu by hiding irrelevant language
renderMainMenu();
function renderMainMenu() {
    if (localStorage.getItem('lang') === 'hr') {
        Array.from(document.getElementsByClassName("en")).forEach(e => { e.style.display = "none"; });
        Array.from(document.getElementsByClassName("hr")).forEach(e => { e.style.display = "block"; });
    } else {
        Array.from(document.getElementsByClassName("hr")).forEach(e => { e.style.display = "none"; });
        Array.from(document.getElementsByClassName("en")).forEach(e => { e.style.display = "block"; });
    }
}

 // Language selector icon funcionality
let flag = document.getElementsByClassName("lang-flag");
    flag[1].addEventListener("click", () => {
    flag[0].style.transition = "opacity 0.5s ease-in-out";
    flag[1].style.transition = "opacity 0.5s ease-in-out";
    const lang = localStorage.getItem('lang');
    if (lang === 'hr') {
        localStorage.setItem('lang', 'en');
        flag[0].style.opacity = "0";
        flag[1].style.opacity = "1";

    } else {
        localStorage.setItem('lang', 'hr');
        flag[0].style.opacity = "1";
        flag[1].style.opacity = "0";
    }
    renderMainMenu();
    navigateTo(window.location.href);
});


// Prevent main menu from being pre-opened on load
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
    { url: 'frontend/graphics/icon-anim.svg', target: 'icon' },
    { url: 'frontend/graphics/logo1.svg', target: 'logo1' }
];
svgElements.forEach(({ url, target }) => {
    fetch(url)
        .then(response => response.text())
        .then(svgContent => {
            if (document.getElementById(target)) {
                document.getElementById(target).innerHTML = svgContent;
            }
        });
});

// Faux-SPA routing
const routes = {
    "/home": '/frontend/home.html',
    "/about": '/frontend/about.html',
    "/shop": '/frontend/shop.html',
    "/product": '/frontend/product.html',
};


// Navigation handling via URI
const navigateTo = async (path) => {

    const url = new URL(path, window.location.origin);
    const queryParams = url.search; // Parameters
    const basePath = "/" + path.split('/')[3];
    const app = document.getElementById("app");
    let view = routes[basePath];
    
    if (!view) {
        view = '/frontend/404.html';
    }

    const pageUrl = view + queryParams;
    const page = await loadPage(pageUrl);

    const parser = new DOMParser();
    const parsedPage = parser.parseFromString(page, 'text/html');
    
    document.title = parsedPage.title;
    app.innerHTML = parsedPage.body.innerHTML;
    
    const baseUrl = new URL(view, window.location.origin).href;

    loadStylesheets(parsedPage, baseUrl);
    executeScripts(parsedPage);

};


// Fetch, inject, execute and remove scripts loaded from HTML content
function executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
            newScript.src = script.src;
        } else {
            newScript.textContent = script.textContent;
        }
        document.body.appendChild(newScript);
        document.body.removeChild(newScript);
    });
}

// Load stylesheets from fetched HTML content
function loadStylesheets(container, baseUrl) {
    const stylesheets = container.querySelectorAll('link[rel="stylesheet"]');
    stylesheets.forEach(link => {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        const href = link.getAttribute('href');
        newLink.href = href.startsWith('/') ? href : new URL(href, baseUrl).href;
        document.head.appendChild(newLink);
    });
}


// Loaad and inject page content
async function loadPage(view) {
    try {
        const response = await fetch(view);
        const text = await response.text();
        return text;
    } catch (error) {
        return `<h1>Server Error</h1>`;
    }
}

// .addEventListener("contextmenu", (e) => {e.preventDefault()});

// Event listener for navigation & quick menu hide
// document.addEventListener("click", (event) => collapseMenu(event));
// function collapseMenu(event) {

//     if (event.target.matches("[data-link]")) {
//         event.preventDefault();
//         alert("Opa");
//         let root = document.querySelector(':root');
//         let menu = document.getElementById("menu-icon");
//         const old = getComputedStyle(root, null).getPropertyValue('--menu-animation-speed');
//         root.style.setProperty('--menu-animation-speed', "0s");
//         menu.click();
//         setTimeout(() => root.style.setProperty('--menu-animation-speed', old), 500);
//         const path = event.target.getAttribute("href");
//         history.pushState({ path }, null, path);
//         debugger;
//         navigateTo(path);
//     }
// }


// Event listeners to close the main menu when anything else gets clicked or touched
document.addEventListener("click", (event) => anyThingButTheMainMenu(event));
document.addEventListener("contextmenu", (event) => anyThingButTheMainMenu(event));
function anyThingButTheMainMenu(event) {
    if (document.getElementById("menu-toggle").checked
        && event.target.getAttribute('id') !== 'menu-toggle'
        && event.target.getAttribute('id') !== 'menu-icon'
        && event.target.getAttribute('id') !== 'nav-links') {
        document.getElementById("menu-toggle").click();
    }
}
document.addEventListener("touchstart", (event) => {
    const menuToggle = document.getElementById("menu-toggle");
    const menuIcon = document.getElementById("menu-icon");
    const navLinks = document.getElementById("nav-links");
    // Check if the menu is open and the touch target is anywhere outside the menu and menu icon
    if (menuToggle.checked && !navLinks.contains(event.target) && event.target !== menuIcon) {
        menuToggle.click();
    }
});


// DAFAQ - provjeri ovo i ne brisi
window.addEventListener("popstate", (event) => {
    const path = event.state?.path || window.location.pathname;
    navigateTo(path);
});


// Initialize the app on first load
if (window.location.pathname === '/') { displaySplashScreen(); }
const initialPath = window.location.pathname === '/' ? window.location.origin + '/home' : window.location.href; //window.location.pathname;
history.replaceState({ path: initialPath }, null, initialPath);
navigateTo(initialPath);