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
async function buildShop(fetchURL = "/api/products", refreshExisting) {
    let app = document.getElementById('app');
        app.setAttribute("hidden", "");

    let url = new URL(window.location);
    
    let obj;

    try { obj = await fetchData(fetchURL);

    }
    catch (e) { console.log("Error. " + e) }

    if(refreshExisting) {
        if (document.getElementById('main-grid')) {
            document.getElementById('main-grid').remove();
        }
    }

    let imagesAreLoadedPromise = getImages(obj.products);
    buildGrid(obj);
    
    if(!refreshExisting) {
        populateFilterMenu(obj);
    }

    await imagesAreLoadedPromise
        .then( () => { app.removeAttribute("hidden", "") })
        .then( () => { document.getElementsByTagName('footer')[0].removeAttribute("hidden")})
}

function extractMetaDataFromItems(obj) {
    
    // Lazy way to ensure uniqueness
    let collectedTags = new Set();
    let array = [];

    obj.products.forEach(product => {
        product.tag.forEach(tag => {
            collectedTags.add(tag[0] + ";" + tag[1] + ";" + tag[2]);
        });
    });

    collectedTags.forEach(t => {
        array.push(
            {
                "tag_id" : t.split(";")[0],
                "tagname_hr" : t.split(";")[1],
                "tagname_en" : t.split(";")[2]
            }
        );
    })

    return { tags: array };
}

function populateFilterMenu(obj) {
    let ulRef = document.getElementById("shop-filtering-menu");
    let lang = localStorage.getItem("lang");
    let template = document.querySelector('template.shop');
    let li;
    let label = null;
    let valueText = null;
    let input = null;
    let svgtick = null;
    let separator = document.createElement('div');
        separator.setAttribute("class", "separator");
    let metaobj = extractMetaDataFromItems(obj);

    metaobj.tags.forEach((c) => {
        li = document.createElement('li');
        label = insertElements('label', null, {
            "class" : "container",
            "for" : 'tagId' + c.tag_id,
        });

        valueText = document.createElement('p');
        valueText.innerHTML = lang === 'en' ? c.tagname_en : c.tagname_hr;
        label.appendChild(valueText);

        input = insertElements('input', null, {
            "type" : "checkbox",
            "id" : 'tagId' + c.tag_id,
            "value" : c.tag_id
        });
        svgtick = template.content.querySelector('svg').cloneNode(true);
        label.appendChild(input);
        label.appendChild(svgtick);
        li.appendChild(label);
        ulRef.appendChild(li);
    });

    ulRef.appendChild(separator.cloneNode(true));

    li = document.createElement('li');
    label = insertElements('label', null, {
        "class" : "container",
        "for" : 'tagId' + "reset",
    });

    valueText = document.createElement('p');
    valueText.innerHTML = lang === 'en' ? "Reset filters" : "Poništi odabir";
    label.appendChild(valueText);

    input = insertElements('input', null, {
        "type" : "checkbox",
        "id" : "filters-reset-button",
        "value" : "reset"
    });
    svgtick = template.content.querySelector('svg').cloneNode(true);
    label.appendChild(input);
    label.appendChild(svgtick);
    li.appendChild(label);
   
    li.addEventListener("click", () => {
        let checkbice = document.querySelectorAll('ul#shop-filtering-menu input[type="checkbox"]');
        checkbice.forEach(element => {
            element.checked = false;
        });

        let queryPath = assembleQueryPath() !== null ? queryPath : currentCategory.getApiPath();
        
        buildShop(queryPath, true);

        // Close filtering menu after resetting filtering
        document.getElementById('shop-filtering-menu').removeAttribute("active");
        // And remove a no-longer-needed listener
        document.documentElement.removeEventListener("click", filteringMenuHandler, true);
        // Re-enable clicking action
        document.body.classList.remove("disable-pointer-events");

    });

    ulRef.appendChild(li);

    let checkbice = document.querySelectorAll('ul#shop-filtering-menu input[type="checkbox"]');
    
    checkbice.forEach(c => {
        c.addEventListener("change", (e) => {
            let queryPath = assembleQueryPath();
            queryPath = assembleQueryPath() !== null ? queryPath : currentCategory.getApiPath();
            buildShop(queryPath, true);
        });
    })
        
    
    
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


function assembleQueryPath() {
    let checked = document.querySelectorAll('ul#shop-filtering-menu li input[type="checkbox"]:checked');
    //let queryPath = "/api/products";
    let queryPath = currentCategory.getApiPath();
        
    if (checked.length == 0) {
        return null;
    }

    let tags = [];

    checked.forEach((i) => {
        if (i.id.substring(0,3) === 'cat') {
            categories.push(i.value);
        } else if (i.id.substring(0,3) === 'tag') {
            tags.push(i.value);
        }
    });

    if (queryPath === '/api/products') {
        queryPath += "?";
    } else {        
        queryPath += "&";
    }

    if (tags.length > 0) {
        queryPath += "&";
        queryPath += "products_and_tags=" + tags.join(",");
    }

    return queryPath;
}

async function getImages(products) {
    let imagePromises = [];
    products.forEach(p => {
        imagePromises.push(fetch('/product-images/' + p.url[0]));
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
                    "src" : "/../product-images/" + o.url[0],
                }
            ));
        container.appendChild(insertElements("h3", localStorage.getItem('lang') == 'hr' ? o.naslov : o.title));
        container.appendChild(insertElements("p", o.price + " €"));
    });
    
    let footer = document.getElementsByTagName('footer')[0];
    app.appendChild(grid, footer);
    document.querySelector('main#app nav.shop-filter-menu').classList.remove('hidden');
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
    let button = document.getElementById("shop-filtering-icon");
    let menu = document.getElementById("shop-filtering-menu");

    // Handle the button press
    button.addEventListener("click", () => {

        // If it wasn't opened already - open it
        if (!menu.hasAttribute("active")) {
            menu.setAttribute("active", "");
            // Listen for any clicks outside of the menu in order to close it
            document.documentElement.addEventListener("click", filteringMenuHandler, true);
            // Prevent mouse cursor from turning "clickable" outside of the menu
            document.body.classList.add("disable-pointer-events");
        } else {
            // Menu was already open - close it
            menu.removeAttribute("active");
            // And remove a no-longer-needed listener
            document.documentElement.removeEventListener("click", filteringMenuHandler, true);
        }
    });
}



// Open and close the filter menu in special cases
function filteringMenuHandler(event) {

    let menu = document.getElementById("shop-filtering-menu");

    // If a click occured inside of an opened menu
    if (menu.contains(event.target)) {
        // Do nothing - user is picking options
    }
    // If a click occured anywhere outside of the menu
    else {
        // Prevent a click event from doing anything else
        document.body.classList.remove("disable-pointer-events");
        // Close the menu
        menu.removeAttribute("active");
        // Remove a no-longer-needed listener
        document.documentElement.removeEventListener("click", filteringMenuHandler, true);
    }
}

async function getId(catgName) {
    let categoryIDs = {};
    const s = await structure;

    s.categories.categories.forEach((c) => {
        categoryIDs[c.categoryname_en.toLowerCase()] = c.category_id;
    });

    return categoryIDs[catgName.toLowerCase()];
}

async function lookUpURL() {
    let url = new URL(window.location.href);
    if (url.searchParams.get("category")) {
        let id = await getId(url.searchParams.get("category"));
        return "/api/products?products_and_categories=" + id;
    } else {
        return "/api/products";
    }
}


// Stores which category a user is viewing (global)
var currentCategory = (() => {
    let apiPath;
     return {
        setApiPath: (p) => { apiPath = p; },
        getApiPath: () => {
            if (apiPath === undefined) {
                throw new Error("Too soon... apiPath has not been set yet.");
            }
            return apiPath;
        }
    };
})();


filterButtonToggle();

// Entry point
(async () => {
    let apiPath = await lookUpURL();
    currentCategory.setApiPath(apiPath);
    buildShop(apiPath);

    // If, whatever is typed in as a category in the URL, IS a valid category, we will copy the category's
    // name from the main menu. In such case, apiPath ends with a category id (an integer value). Otherwise, we ignore it
    if (Number.isInteger(Number.parseInt(apiPath[apiPath.length-1]))) {
        let newTitle = document.querySelector('ul#nav-links div.submenu a[category-id="' + apiPath[apiPath.length-1] + '"] span').textContent;
        document.querySelector('main#app h1.shop-title').textContent = newTitle;
        document.title = newTitle;
    }
    

})();


