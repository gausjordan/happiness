"use strict";

async function apiCall() {

    let params = new URLSearchParams(window.location.href);
    let basePath = new URL(window.location.href);
    let productId = basePath.pathname.split('/')[2];
    let lang = localStorage.getItem("lang");

    const response = await fetch("http://192.168.1.12/api/products/" + productId, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    });

    const json = await response.text();
    const obj = JSON.parse(json);

    if (response.status == 200) {
        // Document title
        document.title = (lang === 'en') ? obj.title : obj.naslov;
        // Main title
        document.getElementsByTagName("h1")[0].innerHTML = (lang === 'en') ? obj.title : obj.naslov;
        // Main image
        let mainImage = document.getElementById("image-big");
        mainImage.src = '/img/' + obj.url[0];
        // Build gallery
        let thumbnails = document.getElementById('thumbnails');
        obj.url.forEach(u => {
            let div = document.createElement('div');
            let img = document.createElement('img');
            img.setAttribute('src', '/img/' + u);
            img.addEventListener("click", (u) => {
                mainImage.src = u.target.currentSrc;
            });
            div.appendChild(img);
            thumbnails.appendChild(div);
            // Get the rest
            let price = document.getElementById("price");
            price.innerHTML = obj.price + " €";
            let description = document.getElementById("description");
            description.innerHTML = (lang === 'en') ? obj.description : obj.opis;
        });
    }
};

function insertElements(tag, content, attributes = {}) {
    const element = document.createElement(tag);
    element.textContent = content;
    Object.keys(attributes).forEach(attr => {
        element.setAttribute(attr, attributes[attr]);
    });
    return element;
}

apiCall();