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
async function buildShop() {
    let obj;
    let fetchURL = "http://192.168.1.12/api/products";
    try { obj = await fetchData(fetchURL) }     
    catch (e) { console.log("Greska. " + e) }

    let imagesAreLoadedPromise = getImages(obj.products);
    buildGrid(obj);
    await imagesAreLoadedPromise;
    document.getElementById('main-grid').style.display = "grid";
}

async function getImages(products) {
    let imagePromises = [];
    products.forEach(p => {
        imagePromises.push(fetch('http://192.168.1.12/img/' + p.url[0]));
    });
    return Promise.all(imagePromises);
}

// Build a grid filled with as many elements as needed
function buildGrid(obj) {
    let grid = document.getElementById('main-grid');
    grid.style.display = "none";
    
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
                    "style" : "opacity: 0",
                    "onload" : "this.style.opacity = 1"
                }
            ));
        container.appendChild(insertElements("h3", localStorage.getItem('lang') == 'hr' ? o.naslov : o.title));
        container.appendChild(insertElements("p", o.price + " €"));
    });
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


buildShop();