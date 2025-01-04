"use strict";


// TODO - Promise.all() - parallelize fetching images
async function fetchData() {

    let obj = [];
    let productCount;

    const response = await fetch("http://192.168.1.12/api/products", authRequestObject())

    const data = await response.json();

    console.log(data.message);
    console.log(response.status);

    if (response.status == 200) {
        obj = data.products;
        productCount = data.productCount;

        const grid = document.getElementById('main-grid');

        grid.style.display = "none";

        obj.forEach(async function(product) {

            let div = grid.appendChild(
                                insertElements("div", null, { "class" : "item" })
                            );
            let container = div.appendChild(
                insertElements("a", null, {
                    "href" : "/product/" + product.id,
                    "onclick" : "{ event.preventDefault(); navigateTo(\"" + "/product/" + product.id + "\"); }"
                })
            );                    
            
            container.appendChild(
                            insertElements("img", null, {
                                    "src" : "/../img/" + product.url[0],
                                    "style" : "opacity: 0",
                                    "onload" : "this.style.opacity = 1"
                                }
                            ));
            container.appendChild(insertElements("h3", product.naslov));
            container.appendChild(insertElements("p", product.price + " €"));

        });

        return { productCount, grid };
    } 
    else if (response.status == 401 && data.message == "Token expired.") {
		
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

	} else if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

function insertElements(tag, content, attributes = {}) {
    const element = document.createElement(tag);
    element.textContent = content;
    Object.keys(attributes).forEach(attr => {
        element.setAttribute(attr, attributes[attr]);
    });
    return element;
}

fetchData()
    .then((p) => {
        //console.log(p.productCount);
        p.grid.style.display = "grid";
    });