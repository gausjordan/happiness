'use strict';

// Display splash screen (4 seconds, unhide content "below" after 3s)
function displaySplashScreen() {
    let splash = document.getElementById("splashscreen");
    splash.removeAttribute("hidden");
}


// If there is a token stored locally, return an authorization header object
function authRequestObject($method) {
    let initObject = {};
    if (localStorage.getItem("access_token")) {
        initObject["method"] = $method;
        initObject["headers"] =
        {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        };
    }
    return initObject;
}

// window.addEventListener("resize", () => { swapMainLogo(); console.log("Gay") });

// If access token had expired, but there is a refresh token
async function getRefreshToken() {
    const response = await fetch('/api/refresh.php', {
        method: 'POST',
        body: JSON.stringify({
            token: localStorage.getItem("refresh_token")
        })
    });
    const json = await response.text();
    const obj = JSON.parse(json);

    if (response.status == 200) {
        localStorage.setItem("access_token", obj.access_token);
        localStorage.setItem("refresh_token", obj.refresh_token);
    }
    else {
        // Refresh token is invalid, log out
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigateTo("/home");
    }
}

// Check if a token has expired (client-side)
function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
    const expiry = payload.exp * 1000; // Convert expiry to milliseconds
    return Date.now() >= expiry;
}

// Do an API call
async function fetchData(fetchURL, method="GET", body) {

    let response;
    let data;

    // If there is a stored token, and it expired, get a fresh one before even trying
    if (localStorage.getItem("access_token") && isTokenExpired(localStorage.getItem("access_token"))) {
        await getRefreshToken();
    }

    try { 
        let authObject = authRequestObject(method);
        let bodyString = { body: JSON.stringify(body) };
        let bodyObject = body ? {...authObject, ...bodyString } : authObject;
        response = await fetch(fetchURL, bodyObject);
    }
    catch { console.log("Initial fetch failed."); }

    if (response.status == 204 || response.status == 201) {
        
        try {
            let resp = await response.json();
            if (resp.message === "Product created") {
            data = Number.parseInt(resp.id);
        } else {
            data = null;
        }
        } catch {
            data = null;
        }
        
        return data;
    } else if (response.ok) {
        data = await response.json();
        return data;
    }
    else if (response.status == 401 && data.message == "Token expired.") {
        
        // This may happen if a token had just expired mid-transaction within the very last seconds
        await getRefreshToken();
        
        let authObject = authRequestObject(method);
        let bodyString = { body: JSON.stringify(body) };
        let bodyObject = body ? {...authObject, ...bodyString } : authObject;
        response = await fetch(fetchURL, bodyObject);

        if (response.status == 204 || response.status == 201) {
            data = null;
            return data;
        } else if (response.ok) {
            data = await response.json();
            return data;
        }
        else {
            // If a refresh token also expired, just log out
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigateTo("/home");
        }
    } else {
        throw new Error("API connection error");
    }
}

// Check if language is already chosen and display only one flag icon
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
document.documentElement.lang = localStorage.getItem('lang') == "en" ? "en" : "hr";


// Disable all interactive elements while the menu is shown
document.getElementById('menu-toggle').addEventListener('change', (e) => {

    // Prevent menu from being CSS animated immediately on load
    // Enable "close" animation once the menu is opened for the first time
    document.querySelector('nav.mainmenu ul').classList.add('unsealed');

    let hamburgerIcon = document.getElementById('menu-icon');
    let mainMenu = document.getElementById('nav-links');

    document.body.classList.add('disable-pointer-events');
    mainMenu.classList.add('menu');
    hamburgerIcon.classList.add('menu');
    
    document.addEventListener("click", closeMainMenu);
    document.addEventListener("keydown", closeMainMenu);

    function closeMainMenu(e) {

        if (e.type === "keydown" && e.key !== "Escape") {
            return;
        }

        e.stopPropagation();
        e.preventDefault();
        document.body.classList.remove('disable-pointer-events');
        mainMenu.classList.remove('menu');
        hamburgerIcon.classList.remove('menu');
        document.getElementById('menu-toggle').checked = false;
        document.removeEventListener("click", closeMainMenu);
        document.removeEventListener("keydown", closeMainMenu);
    }
});



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
        document.documentElement.lang = "en"
    } else {
        localStorage.setItem('lang', 'hr');
        flag[0].style.opacity = "1";
        flag[1].style.opacity = "0";
        document.documentElement.lang = "hr"
    }
    
    structure.then((c) => buildMainMenu(c.categories.categories));

    let url = new URL(window.location.origin + window.location.pathname + window.location.search);
    // navigateTo(window.location.pathname || "/home");
    navigateTo(url.pathname + url.search || "/home");

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

// SPA routes
const routes = {
    "/": '/frontend/home.html',
    "/home": '/frontend/home.html',
    "/about": '/frontend/about.html',
    "/shop": '/frontend/shop.html',
    "/cart": '/frontend/cart.html',
    "/product": '/frontend/product.html',
    "/inventory": '/frontend/inventory.html',
    "/account": '/frontend/account.html',
    "/register": '/frontend/register.html',
    "/404": '/frontend/404.html',
    "/orders" : '/frontend/orders.html',
    "/editor" : '/frontend/edit.html'
};

// Re-route from 'view cart' to login if logged off
document.querySelector("header a[href='/cart']").addEventListener("click", () => {
    if (!localStorage.getItem('access_token')) {
        navigateTo("/account");
    }
});

// Override default <a> behavior
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('a[data-link]').forEach(anchor => {
        anchor.addEventListener('click', overrideLinkBehavior);
    });
});

// Don't reload page on links, fetch data instead
function overrideLinkBehavior(e) {
    e.preventDefault();
    let link = e.target.closest('a');
    let path = link?.getAttribute('href');
    navigateTo(path);
}

// Override "shop" menu item behavior
document.querySelector('#nav-links a[href="/shop"]').addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    let subItems = document.querySelector('#nav-links div.submenu');

    let arrowsymbol = document.querySelector('#nav-links .expand-arrow');
    
    if (subItems.classList.contains("folded")) {
        arrowsymbol.classList.add('open');
        subItems.classList.remove("folded");        
        subItems.style.maxHeight = subItems.scrollHeight + "px";
    } else {
        arrowsymbol.classList.remove('open');
        subItems.style.maxHeight = "0px";
        subItems.classList.add("folded");
    }
});


// Navigation handling
const navigateTo = async (path, doNotPushState = false) => {

    //document.getElementsByTagName("main")[0].style.padding = 0;

    // Close the main menu if it fails to close itself due to some glitch
    document.getElementById('menu-toggle').checked = false;

    // Manage browser history
    let currentPath = window.location.pathname + window.location.search;
    if (!doNotPushState) {
        if (currentPath !== path) {
            history.pushState({}, "", path);
        }
    } else {
        history.replaceState({}, "", path);
    }

    let url = new URL(window.location.origin + path);
    
    let app = document.getElementById("app");
    
    // Experimental - potential bugs
    app.innerHTML = "";
    
    // Only evaluate the first path segment (add a slash at the beginning)
    let target = routes["/" + url.pathname.split("/")[1]];
    if (!target) {
        url = new URL(window.location.origin + "/404");
        target = routes[url.pathname];
        console.log(target);
    }

    // Good old worky
    const page = await loadPage(url.origin + target + url.search);
    
    if (!page) {
        // There are two cases where we fetch 404. If the path is not on the
        // valid paths routing list, or if the html actually isn't there
        // This particular one happens when the file cannot be found
        navigateTo("/404");
    }

    
    // Parse the loaded HTML to extract the title and body content
    const parser = new DOMParser();
    const parsedPage = parser.parseFromString(page, 'text/html');

    // Set the document title and replace the app's innerHTML with the new page content
    document.title = parsedPage.title;
    app.innerHTML = parsedPage.body.innerHTML;

    // Get the base URL for stylesheets and scripts
   const baseUrl = new URL(target, window.location.origin).href; // Won't work if .htaccess works

    // Load stylesheets and execute scripts
    loadStylesheets(parsedPage, baseUrl);
    executeScripts(parsedPage);
};


window.addEventListener("popstate", (event) => {
    const path = window.location.pathname + window.location.search;
    if (path) {
        navigateTo(path);
        // Reset blur/dim effect (maybe we navigated back/forward while modal was opened)
        document.getElementById('modal').style.display = "none";
        document.querySelectorAll('*').forEach(i => i.classList.remove('blurred'));
    }
});


// Inject, execute and remove scripts appended from the fetched HTML content
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
                try {
                    newScript.parentNode.removeChild(newScript);
                }
                catch {
                    // All good, this only happens if a user spam-clicks the cart button
                }
            };
        } else {
            // If no src, just add the script content
            newScript.textContent = script.textContent;

            // Execute immediately by appending it to the <head>, then remove it
            document.head.appendChild(newScript);
            newScript.parentNode.removeChild(newScript);
        }
        document.head.appendChild(newScript);
    });
}

// Load stylesheets from fetched HTML content
function loadStylesheets(container, baseUrl) {

    const stylesheets = container.querySelectorAll('link[rel="stylesheet"]');
    document.querySelectorAll('link[data-dynamic="true"]').forEach(link => link.remove());

    stylesheets.forEach(link => {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.setAttribute('data-dynamic', 'true');
        const href = link.getAttribute('href');
        newLink.href = href.startsWith('/') ? href : new URL(href, baseUrl).href;

        // See if the CSS element is already in the DOM, only append if it's not
        let justTheFilenameAndExtension = newLink.href.split("/").slice(-1)[0];
        let linkElement = document.querySelector('link[href$=\"' + justTheFilenameAndExtension + '"]');
        if (!linkElement) {
            document.head.appendChild(newLink);
        }
    });
}


// Load page content
async function loadPage(target) {
    try {
        const response = await fetch(target);

        // Back-end SPA serves index.html as a fallback page if path is not found
        // If a user actually wanted index.html - that's simply what he's getting
        if (target.includes("home.html")) {
            return await response.text();
        }
        
        // Otherwise, check if the response is actually the fallback page
        // If it is - redirect to 404. Otherwise, proceed and return whatever
        const text = await response.text();
        if (text.startsWith("<!DOCTYPE html")) {
            return null;
        }

        return text;

    } catch (e) {
        
    }
}


// Searching feature input toggle
document.querySelector('header div.block.left *').addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    let searchBar = document.getElementById('search-input-bar');
    let searchIcon = document.querySelector('div.block.left a img');

    if (searchBar.getAttribute("hidden") !== null) {
        openSearchBar(searchBar, searchIcon);
        document.body.addEventListener("click", clickAnywhereToCloseSearchBar, { capture: true });
        document.body.addEventListener("keydown", pressEscapeToCloseSearchBar, { capture: true });
    } else {
        closeSearchBar(searchBar);
        document.body.removeEventListener("click", clickAnywhereToCloseSearchBar, { capture: true });
        document.body.removeEventListener("keydown", pressEscapeToCloseSearchBar, { capture: true });
    }

    function clickAnywhereToCloseSearchBar (e) {
        //if (!(searchBar.contains(e.target) || searchIcon.contains(e.target))) {
        if (!(searchBar.contains(e.target))) {
            e.stopPropagation();
            e.preventDefault();
            closeSearchBar(searchBar);
            document.body.removeEventListener("click", clickAnywhereToCloseSearchBar, { capture: true });
            document.body.removeEventListener("keydown", pressEscapeToCloseSearchBar, { capture: true });
        }
    }

    function pressEscapeToCloseSearchBar (e) {
        if (e.key === "Escape") {
            closeSearchBar(searchBar);
            document.body.removeEventListener("click", clickAnywhereToCloseSearchBar, { capture: true });
            document.body.removeEventListener("keydown", pressEscapeToCloseSearchBar, { capture: true });
        }
    }

}, true);

// This executes when the search icon is clicked. Opens up a user input field and sets some listeners
async function openSearchBar(searchBar, searchIcon) {
    // This will (un)hide the search bar, the "erase search string" button and their common wrapper
    Array.from(searchBar.children).forEach(c => {
        if (c.id !== 'search-results') {
            c.removeAttribute("hidden", "");
        }
    });
    searchBar.removeAttribute("hidden", "");
    let input = searchBar.querySelector('input');
    input.focus();

    const waitInterval = 2000;
    let waiting = false;    // No search requests can be made while we're waiting
    let locked = false;     // Prevents creating more than one additional request per interval
    let somethingWasLeftOut = false;


    if (!input.getAttribute("listenerExists")) {

        // Limit the number of search requests to [one every "waitInterval"] milliseconds as the user types.
        // Last 'n' search string changes may be lost, since the event listener only fires on value change.
        // If changes were made while 'waiting' was true, 'somethingWasLeftOut' flag is raised.
        input.addEventListener("input", (e) => {
            input.setAttribute("listenerExists", true);
            if (input.value.length > 1) {
                if (waiting === false) {
                    waiting = true;
                    locked = false;
                    setTimeout(() => { waiting = false }, waitInterval);
                    sendSearchRequest(input);
                } else if (waiting === true) {
                    if (somethingWasLeftOut && !locked) {
                        locked = true;
                        setTimeout(() => { sendSearchRequest(input) }, waitInterval);
                        somethingWasLeftOut = false;
                    }
                    somethingWasLeftOut = true;
                }
            }
            else {
                document.getElementById('search-results').setAttribute("hidden", "");
            }
        });

    }
}

function closeSearchBar(searchBar) {
    Array.from(searchBar.children).forEach(c => c.setAttribute("hidden", ""));
    searchBar.setAttribute("hidden", "");
}

async function sendSearchRequest(input) {
    let result = await fetchData("/api/products?search=" + encodeURIComponent(input.value) + "&lang=" + localStorage.getItem('lang') + "&limit=0,15", "GET");
    let display = document.getElementById('search-results');
    display.innerHTML = "";
    
    if (result.products.length > 0) {
        result.products.forEach(r => {
            let link = document.createElement("a");
            link.href = "product/" + r.id;
            localStorage.lang == 'hr' ? link.innerText = r.naslov : link.innerText = r.title;
            display.appendChild(link);
            display.removeAttribute("hidden");
        });
    }
    else {
        display.setAttribute("hidden", "");
    }
    
}

document.getElementById("search-cancel-x").addEventListener("click", (e) => {
    let searchBar = document.getElementById('search-input-bar');
    searchBar.children[0].value = "";
    document.getElementById('search-results').setAttribute("hidden", "");
    document.getElementById('search-results').innerHTML = "";
    searchBar.querySelector('input').focus();
});




/* Blurs everything and pops up a dialog window */
async function openDialogModal(text, buttons) {
    document.getElementById('modal').style.display = "flex";
    document.querySelectorAll(' body *:not(#app):not(#modal):not(#modal *) ').forEach(i => {
        i.classList.add('blurred');
    });
    document.getElementById('modal').querySelector('p').textContent = text;
    
    return new Promise(resolve => {
        if (buttons) {
            buttons.forEach(async b => {
                let button = document.createElement('div');
                button.innerHTML = b;
                document.getElementById('modal-buttons').appendChild(button);
                button.addEventListener("click", async () => { removeModal(); resolve(b); });
            });
        }
    })
}

/* Un-blurs everything and closes dialog window */
function removeModal() {
    document.querySelectorAll('div #modal-buttons *').forEach(i => i.remove());
    document.querySelectorAll('.blurred').forEach(i => i.classList.remove('blurred'));
    document.getElementById('modal').style.display = "none";
}

// Initialize the app on first load
if (window.location.pathname === '/') {
    displaySplashScreen();
}

let structure = (async function getDataStructure() {
    let menu = document.querySelector('.mainmenu');// .menu-toggle');
    let categories = await fetchData("api/products?structure=1");
    return { categories };
})();

async function buildMainMenu(categories) {

    function decodeUserRole() {
        let token = localStorage.getItem("access_token");
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
            return `${payload.role}`;
        }
        else {
            return "user";
        }
    }

    let userRole = decodeUserRole();
    let fullMenu = document.getElementById('nav-links');
    let categoriesSubMenu = document.querySelector('div.submenu');
        
     // Wipe old categories
    categoriesSubMenu.innerHTML = "";
    Array.from(fullMenu.children).forEach((menuItem, idx) => {
        if (idx > 2) { fullMenu.removeChild(menuItem); }
    });

    if (localStorage.getItem('lang') === 'hr') {
        fullMenu.querySelector('a[href="/home"] li span').innerHTML = "Naslovna stranica"
        fullMenu.querySelector('a[href="/shop"] li span').innerHTML = "Trgovina"
        fullMenu.querySelector('a[href="/about"] li span').innerHTML = "O nama"
    } else {
        fullMenu.querySelector('a[href="/home"] li span').innerHTML = "Home Page"
        fullMenu.querySelector('a[href="/shop"] li span').innerHTML = "Shop"
        fullMenu.querySelector('a[href="/about"] li span').innerHTML = "About Us"
    }

    // Add submenu item "all articles"
    let a = document.createElement("a");
        a.setAttribute('data-link', '');
        a.href = "/shop";
    let li = document.createElement("li");
    let span = document.createElement("span");
        span.innerHTML = localStorage.getItem('lang') === 'hr' ? "Svi artikli" : "All products";
    li.appendChild(span);
    a.appendChild(li);
    categoriesSubMenu.appendChild(a);

    // Add as many submenu item as there are categories
    categories.forEach(c => {
        let a = document.createElement("a");
            a.setAttribute('data-link', '');
            a.setAttribute('category-id', c.category_id);
            a.href = "/shop?category=" + (String)(c.categoryname_en).toLowerCase();
        let li = document.createElement("li");
        let span = document.createElement("span");
            span.innerHTML = localStorage.getItem('lang') === 'hr' ? c.categoryname_hr : c.categoryname_en;
            li.appendChild(span);
            a.appendChild(li);
        categoriesSubMenu.appendChild(a);
    });

    if (userRole === 'employee' || userRole === 'admin') {
        let div = document.createElement("div");
        let a = document.createElement("a");
            a.setAttribute('data-link', '');
            a.href = "/orders";
            a.addEventListener('click', (e) => overrideLinkBehavior(e) );
        let li = document.createElement("li");
        let span = document.createElement("span");
            span.innerHTML = localStorage.getItem('lang') === 'hr' ? "Narudžbe" : "Orders";
            li.appendChild(span);
            a.appendChild(li);
            div.appendChild(a);
        fullMenu.appendChild(div);
    }

    if (userRole === 'admin') {
        let div = document.createElement("div");
        let a = document.createElement("a");
            a.setAttribute('data-link', '');
            a.href = "/inventory";
            a.addEventListener('click', (e) => overrideLinkBehavior(e) );
        let li = document.createElement("li");
        let span = document.createElement("span");
            span.innerHTML = localStorage.getItem('lang') === 'hr' ? "Ponuda" : "Inventory";
            li.appendChild(span);
            a.appendChild(li);
            div.appendChild(a);
        fullMenu.appendChild(div);
    }
    
    if (userRole === 'admin') {
        let div = document.createElement("div");
        let a = document.createElement("a");
            a.setAttribute('data-link', '');
            a.href = "/users";
            a.addEventListener('click', (e) => overrideLinkBehavior(e) );
        let li = document.createElement("li");
        let span = document.createElement("span");
            span.innerHTML = localStorage.getItem('lang') === 'hr' ? "Korisnici" : "Users";
            li.appendChild(span);
            a.appendChild(li);
            div.appendChild(a);
        fullMenu.appendChild(div);
    }

    // Modify link behavior to avoid reloading (only affect subcategories added after the DOM)
    document.querySelectorAll('ul#nav-links .submenu a[data-link]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            overrideLinkBehavior(e);
        });
    });
    

};

structure.then((c) => buildMainMenu(c.categories.categories));

// Entry point
navigateTo(window.location.pathname + window.location.search, true);



