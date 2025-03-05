'use strict';

if (typeof cart === "undefined") {

    const cart = (function () {

        let userId;

        async function buildCart() {
            userId = await cart.getUserId();
            let fetchURL = `/api/orders/${userId}?unfinished=1`;
            let order = await fetchData(fetchURL);
            let obj;

            try { order = await fetchData(fetchURL) }
            catch (e) { console.log("Greska: " + e); return; }

            cart.buildGrid(order);
            
        }

        async function getUserId() {
            let token = localStorage.getItem("access_token");
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return `${payload.sub}`;
            }
            else { navigateTo("/account"); }
        }

        async function buildGrid(order) {
            let grid = document.getElementById('cart-grid');
            order.forEach(i=> {
                let productFrame = document.createElement('div');
                    productFrame.setAttribute('class', 'product-frame');
                let title = document.createElement('p');
                    title.innerHTML = localStorage.getItem("lang") == 'en' ? i.title : i.naslov;
                let image = document.createElement('img');
                    image.setAttribute('src', '/product-images/' + i.url);
                let controls = document.createElement('div');
                    controls.setAttribute('class', 'controls');
                let productInfo = document.createElement('div');
                    productInfo.setAttribute('class', 'product-info');
                productFrame.appendChild(image);
                productInfo.appendChild(title);
                productFrame.appendChild(productInfo);
                productFrame.appendChild(controls);
                grid.appendChild(productFrame);
                console.log(i);
            });
            //console.log(grid);
        }

        return {
            buildCart,
            buildGrid,
            getUserId
        };

    })();

    cart.buildCart();
    
}