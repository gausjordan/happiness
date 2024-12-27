"use strict";

if (typeof token == 'undefined') {
    var token = {
        "access_token" : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjQsIm5hbWUiOiJjYmciLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3Mzg1ODM4Mzd9.d73KGPQ0vmjLC4q9V-nQ_ewTc1mXYbMRgF-B6VL3Bk8",
        "refresh_token" : "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjQsIm5hbWUiOiJjYmciLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3Mzg1ODM4Mzd9.d73KGPQ0vmjLC4q9V-nQ_ewTc1mXYbMRgF-B6VL3Bk8"
    };
}

localStorage.setItem("access_token", token.access_token);
localStorage.setItem("refresh_token", token.refresh_token);

let obj = [];
let productCount;

async function fetchData() {
    const response = await fetch("http://192.168.1.12/api/products", {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access_token")
        }
    })
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    obj = data.products;
    productCount = data.productCount;

    const grid = document.getElementById('main-grid');

    obj.forEach(async function(product) {

        let div = grid.appendChild(
                            insertElements("div", null, { "class" : "item" })
                        );
        let container = div.appendChild(
            insertElements("a", null, { "href" : "/product/" + product.id })
        );                        
        container.appendChild(
                        insertElements("img", null, {
                                "src" : "/../img/" + product.url[0]
                            }
                        ));
        container.appendChild(insertElements("h3", product.naslov));
        container.appendChild(insertElements("p", product.price + " €"));

    });
}

function insertElements(tag, content, attributes = {}) {
    const element = document.createElement(tag);
    element.textContent = content;
    Object.keys(attributes).forEach(attr => {
        element.setAttribute(attr, attributes[attr]);
    });
    return element;
}

fetchData().then(() => console.log(productCount));