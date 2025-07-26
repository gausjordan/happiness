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
            // mainImage.src = '/product-images/' + obj.url[0];

            // Build gallery
            let gallery = document.getElementById('gallery');
            let slider = document.getElementById('slider');

            // Add dots
            let dotContainer = document.getElementById("dot-indicators");
            let dots = [];
            let imageLinks = [];

            obj.url.forEach(u => {
                let div = document.createElement('div');
                let img = document.createElement('img');
                imageLinks.push(u);
                img.setAttribute('src', '/product-images/' + u);
                img.setAttribute('draggable', 'false');
                // img.addEventListener("click", (u) => {
                //     mainImage.src = u.target.currentSrc;
                // });
                div.appendChild(img);
                slider.appendChild(div);
                let dot = document.createElement("div");
                dot.classList.add("dot");
                dotContainer.appendChild(dot);
                dots.push(dot);
            });

            // Set gallery slider width to (n * screenWidth) + inner_gaps
            slider.style.width = "0px";
            slider.style.width = `calc(${imageLinks.length} * 100vw + ${imageLinks.length-1} * 10px)`;
           
            function updateActiveDot() {
                const scrollLeft = gallery.scrollLeft;
                const slideWidth = gallery.offsetWidth;
                const index = Math.round(scrollLeft / slideWidth);

                dots.forEach((d, i) => {
                    d.classList.toggle("active", i === index);
                });
            }

            let singleImageWidth = document.querySelector("#app div div");
            let title = document.getElementsByTagName("h1")[0];
            let isSwiping = false;

            gallery.addEventListener("pointerdown", (e) => {
                isSwiping = true;
                title.innerHTML = e.clientX;
                slider.setPointerCapture(e.pointerId);
                slider.onpointermove = swiping;
                slider.initialX = e.clientX;
            });

            gallery.addEventListener("pointerup", (e) => {
                title.innerHTML = e.clientX;
                slider.releasePointerCapture(e.pointerId);
                slider.onpointermove = null;
                isSwiping = false;
            });

            
            // Prevent vertical pull-to-refresh during horizontal swiping
            document.addEventListener("touchmove", (e) => {
                if (isSwiping) {
                    e.preventDefault();
                }
            }, { passive: false });

            function swiping(e) {
                title.innerHTML = e.clientX;
                requestAnimationFrame(() => {
                    slider.style.transform = `translateX(${e.clientX - slider.initialX}px)`;
                });
                
                updateActiveDot();
            }

            updateActiveDot();

            
            // let thumbnails = document.getElementById('thumbnails');
            // obj.url.forEach(u => {
            //     let div = document.createElement('div');
            //     let img = document.createElement('img');
            //     img.setAttribute('src', '/product-images/' + u);
            //     img.addEventListener("click", (u) => {
            //     mainImage.src = u.target.currentSrc;
            // });
            // div.appendChild(img);
            // thumbnails.appendChild(div);


            // Get the rest
            let price = document.getElementById("price");
            price.innerHTML = obj.price + " €";
            let description = document.getElementById("description");
            description.innerHTML = (lang === 'en') ? obj.description : obj.opis;
            document.getElementById("commerce").style.display = "block";
        
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
            
            let success = false;
            let fetchURL = `/api/orders/${ProductPage.getUserId()}?unfinished=1`;
            let order = await fetchData(fetchURL);
            
            if (!order) {
                try {
                    // Insert new order in the 'orders' table, with a current user's id
                    const response = await fetchData("/api/orders/", "POST");
                    console.log("New order created.");
                    success = true;
                }
                catch {
                    console.log("Error creating a new order.");
                }
            } else {
                console.log("Incomplete order already exists!");
                success = true;
            }

            if (success) {
                fetchURL = `/api/orders/${ProductPage.getProductId()}`;
                try {
                    let response = await fetchData(fetchURL, "POST");
                    console.log("Item " + ProductPage.getProductId() + " was added.");
                }
                catch {
                    console.log("Error inserting into the orders table.");
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