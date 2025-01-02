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
    navigateTo(window.location.pathname);
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
    "/account" : '/frontend/account.html',
    "/404" : '/frontend/404.html'
};

// Override default <a> behavior
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('a[data-link]').forEach(anchor => {
        anchor.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the browser from following the link
            const path = anchor.getAttribute('href');
            navigateTo(path); // Use custom SPA navigation logic
        });
    });
});


// Navigation handling
const navigateTo = async (path, isInitial = false) => {

    let url = new URL(window.location.origin + path);
    const app = document.getElementById("app");

    // Only evaluate the first path segment, and add a slash at the beginning
    let target = routes["/" + url.pathname.split("/")[1]];

    if (!target) {
        url = new URL(window.location.origin + "/404");
        target = routes[url.pathname];
    }

    // Load the page content
    const page = await loadPage(url.origin + target + url.search);

    // Parse the loaded HTML to extract the title and body content
    const parser = new DOMParser();
    const parsedPage = parser.parseFromString(page, 'text/html');
    
    // Set the document title and replace the app's innerHTML with the new page content
    document.title = parsedPage.title;
    app.innerHTML = parsedPage.body.innerHTML;

    // Get the base URL for stylesheets and scripts
    const baseUrl = new URL(target, window.location.origin).href;

    // Load stylesheets and execute scripts
    loadStylesheets(parsedPage, baseUrl);
    executeScripts(parsedPage);

    // Update the browser's address bar using pushState, ensuring the query parameters are included
    if (!isInitial && window.location.pathname !== path) {
        history.pushState({ path: url.pathname }, parsedPage.title, url.href);
    }
};


// Fetch, inject, execute and remove scripts loaded from HTML content
function executeScripts(container) {
    const existingDynamicScripts = document.head.querySelectorAll('script[data-dynamic="true"]');
    existingDynamicScripts.forEach(script => script.remove());
    const scripts = container.querySelectorAll('script');
    scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.setAttribute('data-dynamic', 'true');

        // If the script has a src, set the new script's src
        if (script.src) {
            newScript.src = script.src;

            // Add an event listener to remove the script after it's loaded and executed
            newScript.onload = () => {
                newScript.parentNode.removeChild(newScript);
            };
        } else {
            // If no src, just add the script content
            newScript.textContent = script.textContent;

            // Execute immediately by appending it to the <head>, and remove it
            document.head.appendChild(newScript);
            newScript.parentNode.removeChild(newScript);
        }
        document.head.appendChild(newScript);
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

        let justTheFilenameAndExtension = newLink.href.split("/").slice(-1)[0];
        let linkElement = document.querySelector('link[href$=\"' + justTheFilenameAndExtension + '"]');
        
        if (!linkElement) {
            document.head.appendChild(newLink);
        }

        // if (linkElement === newLink) {
        //     document.head.removeChild(newLink); // BRIŠE ŠTO TREBA I NE TREBA, PROBLEM JE PATH VS FULL URL
        // }
    });
}


// Load and inject page content
async function loadPage(target) {
    try {
        const response = await fetch(target);
        const text = await response.text();
        return text;
    } catch (error) {
        return `<h1>Server Error</h1>`;
    }
}


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

// HISTORY ne radi kako treba! I klikanje na proizvod ne radi.


window.addEventListener("popstate", (event) => {
    const path = event.state?.path || window.location.pathname + window.location.search;
    navigateTo(path, true);
});


// Initialize the app on first load
if (window.location.pathname === '/') {
    // displaySplashScreen();
}



const initialPath = window.location.pathname === '/' ? '/home' : window.location.pathname + window.location.search;

// console.log(history.state);


// GPT fix attempt
// if (!history.state) {
//     history.replaceState({ path: initialPath }, document.title, initialPath);
// }

navigateTo(initialPath);