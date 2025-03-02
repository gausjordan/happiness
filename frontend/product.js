"use strict";

if (typeof ProductPage === "undefined") {

    const ProductPage = (function () {

        let productId;

        async function buildProductPage() {
            let obj;
            let params = new URLSearchParams(window.location.href);
            let basePath = new URL(window.location.href);
            productId = basePath.pathname.split('/')[2];
            let lang = localStorage.getItem("lang");
            let fetchURL = `/api/products/${productId}`;

            try { obj = await fetchData(fetchURL) }     
            catch (e) { console.log("Greska: " + e); return; }

            buildProductInfo(obj, lang);
        }

        function buildProductInfo(obj, lang) {
            // Document title
            document.title = (lang === 'en') ? obj.title : obj.naslov;
            // Main title
            document.getElementsByTagName("h1")[0].innerHTML = (lang === 'en') ? obj.title : obj.naslov;
            // Main image
            let mainImage = document.getElementById("image-big");
            mainImage.src = '/product-images/' + obj.url[0];
            // Build gallery
            let thumbnails = document.getElementById('thumbnails');
            obj.url.forEach(u => {
                let div = document.createElement('div');
                let img = document.createElement('img');
                img.setAttribute('src', '/product-images/' + u);
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
            document.getElementById("commerce").style.display = "block";
        });
        }


        function getProductId() {
            return productId;
        }

        function insertElements(tag, content, attributes = {}) {
            const element = document.createElement(tag);
            element.textContent = content;
            Object.keys(attributes).forEach(attr => {
                element.setAttribute(attr, attributes[attr]);
            });
            return element;
        }

        function getUserId() {
            
            let token = localStorage.getItem("access_token");

            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return `${payload.sub}`;
            }
            else {
                // TODO: Route to login page
                navigateTo("/account");
            }
        }

        document.getElementById('atc-button').addEventListener("click", async () => {
            let fetchURL = `/api/orders/${ProductPage.getUserId()}?unfinished=1`;
            let order = await fetchData(fetchURL);
            // console.log(order);
            if (!order) {
                // Insert new order in the 'orders' table, having a current user id
                try {
                    const response = await fetchData("/api/orders/", "POST");
                    console.log("New order created.");
                }
                catch {
                    console.log("Error creating a new order.");
                }

            } else {
                try {
                    console.log("Incomplete order already exists!");
                } catch {
                    
                }
                
            }

        });

        return {
            buildProductPage,
            getProductId,
            getUserId
        };

    })();

    ProductPage.buildProductPage();

}



