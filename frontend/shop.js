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

async function getRefreshToken() {

    const response = await fetch('http://localhost/api/refresh.php', {
        method: 'POST',
        body: JSON.stringify({
            token: localStorage.getItem("refresh_token")
        })
    });
    
    const json = await response.text();
    console.log(json);			
    const obj = JSON.parse(json);

    if (response.status == 200) {
        console.log("Got new access token and refresh token");
        localStorage.setItem("access_token", obj.access_token);
        localStorage.setItem("refresh_token", obj.refresh_token);
    }
}

// Do an API call
async function fetchData() {

    let response = await fetch("http://192.168.1.12/api/products", authRequestObject());
    let data = await response.json();

    if (response.status == 200) {
        return data;
    }
    else if (response.status == 401 && data.message == "Token expired.") {
        await getRefreshToken();

        let response = await fetch("http://192.168.1.12/api/products", authRequestObject());
        let data = await response.json();
        if (response.status == 200) {
            return data;
        } else {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigateTo("/shop");
        }
    }
}

// Build the page (<app>)
async function buildShop() {
    let obj;
    try {
        obj = await fetchData();
    }     
    catch (e) {
        console.log("Greska. " + e);
    }

    let imagesAreLoadedPromise = getImages(obj.products);
    buildGrid(obj);
    await imagesAreLoadedPromise;
}

async function getImages(products) {
    let imagePromises = [];
    products.forEach(p => {
        imagePromises.push(fetch('http://192.168.1.12/img/' + p.url[0]));
    });
    return Promise.all(imagePromises);
}

function buildGrid(obj) {
    let grid = document.getElementById('main-grid');
    // grid.style.display = "grid";
    
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

            container.appendChild(insertElements("h3", o.naslov));
            container.appendChild(insertElements("p", o.price + " €"));
        });
    
    //console.log(productCount);
    
}

function insertElements(tag, content, attributes = {}) {
    const element = document.createElement(tag);
    element.textContent = content;
    Object.keys(attributes).forEach(attr => {
        element.setAttribute(attr, attributes[attr]);
    });
    return element;
}


buildShop();