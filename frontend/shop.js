"use strict";

// Load a single image
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    });
}

// Build the page (<app>)
async function buildShop(rebuild) {
    let app = document.getElementById('app');
        app.setAttribute("hidden", "");

    let obj;
    let fetchURL = "/api/products";

    try { obj = await fetchData(fetchURL) }     
    catch (e) { console.log("Error. " + e) }

    let imagesAreLoadedPromise = getImages(obj.products);
    buildGrid(obj);
    populateFilterMenu(obj);

    await imagesAreLoadedPromise
        .then( () => { app.removeAttribute("hidden", "") })
        .then( () => { document.getElementsByTagName('footer')[0].removeAttribute("hidden")})
}

function populateFilterMenu(obj) {
    let ulRef = document.getElementById("shop-filtering-menu");
    let lang = localStorage.getItem("lang");
    let template = document.querySelector('template.shop');
    let li;
    let label = null;
    let input = null;
    let svgtick = null;
    let separator = document.createElement('div');
        separator.setAttribute("class", "separator");

    obj.categories.forEach((c) => {
        li = document.createElement('li');
        label = insertElements('label', lang === 'en' ? c.categoryname_en : c.categoryname_hr, {
            "class" : "container",
            "for" : 'catId' + c.category_id,
        });
        input = insertElements('input', null, {
            "type" : "checkbox",
            "id" : 'catId' + c.category_id,
            "value" : c.category_id
        });
        svgtick = template.content.querySelector('svg').cloneNode(true);
        li.appendChild(input);
        li.appendChild(label);
        li.appendChild(svgtick);
        ulRef.appendChild(li);
    });

    ulRef.appendChild(separator.cloneNode(true));

    obj.tags.forEach((c) => {
        li = document.createElement('li');
        label = insertElements('label', lang === 'en' ? c.tagname_en : c.tagname_hr, {
            "class" : "container",
            "for" : 'tagId' + c.tag_id,
        });
        input = insertElements('input', null, {
            "type" : "checkbox",
            "id" : 'tagId' + c.tag_id,
            "value" : c.tag_id
        });
        svgtick = template.content.querySelector('svg').cloneNode(true);
        li.appendChild(input);
        li.appendChild(label);
        li.appendChild(svgtick);
        ulRef.appendChild(li);
    });

    ulRef.appendChild(separator.cloneNode(true));

    input = insertElements('input', null, {
        "type" : "checkbox",
    });
    svgtick = template.content.querySelector('svg').cloneNode(true);
    li.appendChild(input);
    li = document.createElement('li');
    label = insertElements('label', lang === 'en' ? "Reset filters" : "Poništi odabir", {
        "class" : "container shop-filter-reset"
    });
    li.appendChild(label);
    li.appendChild(svgtick);
    ulRef.appendChild(li);

    li.addEventListener("click", () => {
        let checkbice = document.querySelectorAll('ul#shop-filtering-menu input[type="checkbox"]');
        checkbice.forEach(element => {
            element.checked = false;
        });
    });

    let okButton = document.createElement('button');
        okButton.textContent = "debug: manual fetch trigger";
    ulRef.appendChild(okButton);

    
    // Prevent "mouse over" styling on touch-based devices, keep it for mouse users only
    let items = document.querySelectorAll('ul#shop-filtering-menu li');
    items.forEach(element => {
        let isTouched = false;
        element.addEventListener('pointerenter', (event) => {
            if (event.pointerType === 'mouse') {
                element.classList.add('hovered');
            }
        });
        element.addEventListener('pointerleave', (event) => {
            if (event.pointerType === 'mouse') {
                element.classList.remove('hovered');
            }
        });
    });

    /* Prevent window closing animation on page load by targeting a classname provided after onload event */
    function oneTimeEvent() {
        document.getElementById('shop-filtering-menu').setAttribute("loaded", "");
        document.getElementById('shop-filtering-icon').removeEventListener("click", oneTimeEvent);
    }
    document.getElementById('shop-filtering-icon').addEventListener("click", oneTimeEvent);
    
}

async function getImages(products) {
    let imagePromises = [];
    products.forEach(p => {
        imagePromises.push(fetch('/img/' + p.url[0]));
    });
    return Promise.all(imagePromises);
}

// Build a grid filled with as many elements as needed
function buildGrid(obj) {

    // let grid = document.getElementById('main-grid');
    let grid = document.createElement('div');
    grid.setAttribute("class", "shop");
    grid.setAttribute("id", "main-grid");
    //grid.style.display = "none";
    
    obj.products.forEach(o => {
        let div = grid.appendChild(
            insertElements("div", null, { "class" : "item" })
        );
        let container = div.appendChild(insertElements("a", null,
            {
                "href" : "/product/" + o.id,
                "onclick" : "{ event.preventDefault(); navigateTo(\"" + "/product/" + o.id + "\"); }"
            }
        ))
        container.appendChild(
            insertElements("img", null, {
                    "src" : "/../img/" + o.url[0],
                }
            ));
        container.appendChild(insertElements("h3", localStorage.getItem('lang') == 'hr' ? o.naslov : o.title));
        container.appendChild(insertElements("p", o.price + " €"));
    });
    
    let footer = document.getElementsByTagName('footer')[0];
    // console.log(footer);
    document.getElementById('app');
    //app.insertBefore(grid, footer);
    app.appendChild(grid, footer);
}

// Simplify appending an element
function insertElements(tag, content, attributes = {}) {
    const element = document.createElement(tag);
    element.textContent = content;
    Object.keys(attributes).forEach(attr => {
        element.setAttribute(attr, attributes[attr]);
    });
    return element;
}

function filterButtonToggle() {
    let body = document.body;
    let button = document.getElementById("shop-filtering-icon");
    let menu = document.getElementById("shop-filtering-menu");

    // Handle the button press
    button.addEventListener("click", (e) => {

        // If it wasn't opened already - open it
        if (!menu.hasAttribute("active")) {
            menu.setAttribute("active", "");
            // Listen for any clicks outside of the menu in order to close it
            body.addEventListener("click", filteringMenuHandler, true);
        } else {
            // Menu was already open - close it
            // TODO - apply settings
            menu.removeAttribute("active");
            // And remove a no-longer-needed listener
            body.removeEventListener("click", filteringMenuHandler, true);
        }
    });
}

// Open and close the filter menu in special cases
function filteringMenuHandler(event) {

    let body = document.body;
    let menu = document.getElementById("shop-filtering-menu");

    // If a click occured inside of an opened menu
    if (event.target.parentNode.id == 'shop-filtering-menu' ||
        event.target.parentNode.parentNode.id == 'shop-filtering-menu' ||
        event.target.parentNode.parentNode.parentNode.id == 'shop-filtering-menu') {
        // Do nothing - user is picking options
    }
    // If a click occured anywhere outside of the menu
    else {
        // Prevent a click event from doing anything else
        event.preventDefault();
        event.stopPropagation();
        // Close the menu
        menu.removeAttribute("active");
        // Remove a no-longer-needed listener
        body.removeEventListener("click", filteringMenuHandler, true);
        // TODO - Apply settings
    }
}

filterButtonToggle();
buildShop();
// console.log(document.querySelector('main#app > div#main-grid.shop'));