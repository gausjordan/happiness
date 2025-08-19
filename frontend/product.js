"use strict";

if (typeof ProductPage === "undefined") {

    const ProductPage = (function () {

        let productId;

        // let tit = document.getElementsByTagName("h1")[0];

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
            let gallery = document.getElementById('gallery');           // Swipe-enabled gallery
            let bigGallery = document.getElementById('big-gallery');    // Click-oriented gallery
            let slider = document.getElementById('slider');

            // Add dots (only visible on small vertical screens)
            let dotContainer = document.getElementById("dot-indicators");
            let dots = [];
            let imageLinks = [];
            let currentImageIndex = 0;
            let animationFrameId = null;

            // The very first image (big one) gets spawned twice
            let bigDiv = document.createElement('div');
            let bigImg = document.createElement('img');
            bigImg.setAttribute('src', '/product-images/' + obj.url[0]);
            bigImg.setAttribute('draggable', 'false');
            bigDiv.appendChild(bigImg);
            bigDiv.classList.add("big-image");
            bigGallery.appendChild(bigDiv);

            let wrap = document.createElement('div');
            
            // Fetch image urls and add div+img elements
            obj.url.forEach( (u, i) => {
                
                // Swiping version
                let div = document.createElement('div');
                let img = document.createElement('img');
                imageLinks.push(u);
                img.setAttribute('src', '/product-images/' + u);
                img.setAttribute('draggable', 'false');
                div.appendChild(img);
                slider.appendChild(div);

                // Append one div element (representing a dot) - per image
                let dot = document.createElement("div");
                dot.classList.add("dot");
                dot.setAttribute("data-index", i);
                dotContainer.appendChild(dot);
                dots.push(dot);

                // Clicking version
                let bigDiv = document.createElement('div');
                let bigImg = document.createElement('img');
                bigImg.setAttribute('src', '/product-images/' + u);
                bigDiv.appendChild(bigImg);
                wrap.classList.add("thumbnails");
                wrap.appendChild(bigDiv);

                // TODO - edge cases. 0 images or 1 image

                // On click, thumbnails gets shown as the big image
                bigImg.addEventListener("click", (u) => {
                    bigGallery.querySelector("img").src = u.target.currentSrc;
                });

            });

            bigGallery.appendChild(wrap);

            function thumbnailAesthetics() {

                // Read CSS properties - get the size of a single thumbnail. Expected unit: vh
                let singleThumbSize = getComputedStyle(wrap.querySelectorAll(".thumbnails div")[0]).getPropertyValue('--singlethumbsize');
                    singleThumbSize = singleThumbSize.toString().replace('vh', '');
                    singleThumbSize = parseFloat(singleThumbSize);

                // Read CSS properties - get the height of a main (big) image. Expected unit: none (px assumed)
                let maxHeight = bigGallery.querySelector(".big-image");
                    maxHeight = maxHeight.getBoundingClientRect().height;
                    maxHeight = parseInt(maxHeight);

                // Read CSS properies - get the number of thumbnails per column of thumbnails. Expected: int
                let thumbsPerCol = getComputedStyle(wrap).getPropertyValue('--thumbnails-per-column');
                    thumbsPerCol = parseInt(thumbsPerCol);

                // Read CSS properies - get the thumbnail grid's gap size. Expected unit: px
                let gridGap = getComputedStyle(wrap).getPropertyValue('gap');
                    gridGap = parseInt(gridGap);                
                    console.log(gridGap);

                // Calculate the new snug size of a thumbnail. Convert "vh" to "px" first
                let correctedSingleThumbSize = maxHeight / thumbsPerCol;

                // gridGap[px] tells how wide is each gap. There are "n-1" gaps per column. Calculate how many pixels less per thumbnail
                let lessPerPx = (gridGap * (thumbsPerCol-1)) / thumbsPerCol;

                // Set CSS variable - set all individual thumbnail size to fit it's parent container
                let allThumbnails = wrap.querySelectorAll(".thumbnails div"); //.forEach(a => a.style.setProperty('--my-var', '5px'));
                    allThumbnails.forEach(a => a.style.setProperty('--singlethumbsize', `${correctedSingleThumbSize-lessPerPx}px`));

                // Set the true corrected width of a thumbnails column based on the number of thumbnails (set up wrapping)
                let howManyColums = Math.ceil(imageLinks.length / thumbsPerCol);
                let repeatAutos = "auto ".repeat(howManyColums);
                wrap.style.setProperty('grid-template-columns', repeatAutos);
                wrap.style.setProperty('width', `${howManyColums * correctedSingleThumbSize}px`);
            
            }

            thumbnailAesthetics();




            // On small landscape screens, if there is more than one row of images, and if the last
            // one is much shorter than the others, alternate (more dense) styling is applied
            let imageCount = obj.url.length;
            let galleryWidth = bigGallery.offsetWidth;
            let itemWidth = bigGallery.querySelectorAll("div img")[1].getBoundingClientRect().width + (parseFloat(getComputedStyle(gallery).gap) || 0);
            let imagesPerRow = Math.floor(galleryWidth / itemWidth);
            let remainder = imageCount % imagesPerRow;
            if (window.matchMedia('(orientation: landscape) and (max-height: 450px)').matches &&
                imagesPerRow >= 3 && remainder === 1 || imagesPerRow >= 5 && remainder === 2)
            {
                gallery.classList.add('adjust-last-row');
                bigGallery.style.gridTemplateColumns = "repeat(auto-fit, minmax(50vh, 1fr))";
                bigDiv = bigGallery.querySelectorAll("div");
                bigDiv.forEach(d => {
                    d.style.minHeight = "50vh";
                    d.style.maxHeight = "80vh";
                });                
            }

            let dotElements = document.querySelector("#dot-indicators");
            
            // Dots do the jump to their respective image
            dotElements.addEventListener("click", (e) => {
                slider.style.transition = 'transform 0.3s ease-out';
                let oldImageIndex = currentImageIndex;
                let targetImageIndex = e.target.getAttribute("data-index");
                if (targetImageIndex !== null) {
                    snapToNextImage(targetImageIndex - currentImageIndex);
                }
            });

            // Width of a single image
            let quantaWidth = slider.querySelector("img");
            
            // One rem, rounded to pixels
            let rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

            // Width of a single image element, plus 1rem of flexbox gap defined in the CSS, not null
            let offset = quantaWidth.getBoundingClientRect().width + parseFloat(getComputedStyle(slider).gap || 0);

            // Set gallery slider (div) width to "n times the single image width, plus the inner gaps"
            slider.style.width = imageLinks.length * quantaWidth + (imageLinks.length-1) * rem + "px";

            // If a user resizes their window, it will mess up swipe-snapping without this
            window.addEventListener("resize", () => {
                // Swiping version
                //if (window.matchMedia('(orientation: landscape) and (max-height: 450px)').matches) {
                    quantaWidth = slider.querySelector("img");
                    rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
                    offset = quantaWidth.getBoundingClientRect().width + parseFloat(getComputedStyle(slider).gap || 0);
                    slider.style.transition = 'none';
                    slider.style.transform = `translateX(${-currentImageIndex*offset}px)`;
                //}

                // Click-oriented version
                thumbnailAesthetics();
            });

            // (x === y) returns a bool
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
                    // console.log(e.clientX-slider.initialX);
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