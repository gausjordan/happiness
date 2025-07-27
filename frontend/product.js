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

            document.title = (lang === 'en') ? obj.title : obj.naslov;
            document.getElementsByTagName("h1")[0].innerHTML = (lang === 'en') ? obj.title : obj.naslov;
            let mainImage = document.getElementById("image-big");
            let gallery = document.getElementById('gallery');
            let slider = document.getElementById('slider');

            // Add dots
            let dotContainer = document.getElementById("dot-indicators");
            let dots = [];
            let imageLinks = [];
            let currentImageIndex = 0;
            let animationFrameId = null;

            // Fetch image urls and add div+img elements
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
                // Also append add one div element (representing a dot) - per image
                let dot = document.createElement("div");
                dot.classList.add("dot");
                dotContainer.appendChild(dot);
                dots.push(dot);
            });

            // Width of a single image
            let quantaWidth = slider.querySelector("img").offsetWidth;
            
            // One rem, rounded to pixels
            let rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

            // Width of a single image element, plus 1rem of flexbox gap defined in the CSS
            let offset = quantaWidth + rem;

            // Set gallery slider (div) width to "n times the single image width, plus the inner gaps"
            slider.style.width = imageLinks.length * quantaWidth + (imageLinks.length-1) * rem + "px";

            // === returns a bool
            function updateActiveDot() {
                dots.forEach((d, i) => {
                    d.classList.toggle("active", i === currentImageIndex);
                });
            }

            let isSwiping = false;

            // Currently swiping
            gallery.addEventListener("pointerdown", (e) => {
                isSwiping = true;
                slider.setPointerCapture(e.pointerId);
                slider.initialX = e.clientX;
                slider.onpointermove = swiping;
                // Transition is not animated while swiping, user is the one that "animates"
                slider.style.transition = 'none';
            });

            // Swiping stopped
            gallery.addEventListener("pointerup", (e) => {
                slider.releasePointerCapture(e.pointerId);
                slider.onpointermove = null;
                isSwiping = false;

                // Once the pointer is released, snapping to an image is animated
                slider.style.transition = 'transform 0.3s ease-out';
                
                // Ignore possible pending animation frame leftovers from the swiping() function
                cancelAnimationFrame(animationFrameId);
                
                // Will be 'false' on edge cases (prevent going lower than 0 and higher than array size)
                let boundsAndSwipeDirectionCheck = !(e.clientX-slider.initialX < 0 && currentImageIndex == imageLinks.length-1) &&
                                                   !(e.clientX-slider.initialX > 0 && currentImageIndex == 0);

                // In order to snap to the next image, at least a 1/5th swipe is required (arbitrary)
                if (Math.abs(e.clientX - slider.initialX) >= offset/5 && boundsAndSwipeDirectionCheck) {
                    // Go one image forward or go backward - depending on the swipe direction
                    (e.clientX-slider.initialX) < 0 ? snapToNextImage(1) : snapToNextImage(-1);
                } else {
                    // ... Or just snap back to the current image
                    snapToNextImage(0);
                }
            });

            function snapToNextImage(n) {
                currentImageIndex += n;
                console.log("Current index: " + currentImageIndex);
                slider.style.transform = `translateX(${-(currentImageIndex)*offset}px)`;
                updateActiveDot();
            }
            
            // Prevent vertical pull-to-refresh behavior while swiping
            document.addEventListener("touchmove", (e) => {
                if (isSwiping) {
                    e.preventDefault();
                }
            }, { passive: false });

            // Debugging tool
            gallery.addEventListener("click", (e) => {
                //slider.style.transform = `translateX(${offset}px)`;
            });

            // Continuously runs while swiping
            function swiping(e) {

                let boundsAndSwipeDirectionCheck = !(e.clientX-slider.initialX < 0 && currentImageIndex == imageLinks.length-1) &&
                                                   !(e.clientX-slider.initialX > 0 && currentImageIndex == 0);
                
                if (boundsAndSwipeDirectionCheck) {

                    // Allow advancing only 1-by-1 image
                    if (Math.abs(e.clientX - slider.initialX) <= offset) {

                        animationFrameId = requestAnimationFrame(() => {
                            slider.style.transform = `translateX(${-currentImageIndex*offset + e.clientX-slider.initialX}px)`;
                            updateActiveDot();
                        });

                    // If we swipe too far, we snap to the furthest point allowed
                    } else if (Math.abs(e.clientX - slider.initialX) > offset) {
                        // Either to the outmost right
                        if (e.clientX-slider.initialX > 0) {
                            slider.style.transform = `translateX(${-(currentImageIndex-1)*offset}px)`;
                        // Or to the outmoust left
                        } else {
                            slider.style.transform = `translateX(${-(currentImageIndex+1)*offset}px)`;
                        }
                    }
                } else {
                    console.log(e.clientX-slider.initialX);
                    if (e.clientX-slider.initialX < 100 && e.clientX-slider.initialX > -100) {
                        animationFrameId = requestAnimationFrame(() => {
                            slider.style.transform = `translateX(${-currentImageIndex*offset + 0.25*(e.clientX-slider.initialX)}px)`;
                            updateActiveDot();
                        });
                    }
                }
                    
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