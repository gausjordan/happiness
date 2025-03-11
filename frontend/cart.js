'use strict';

if (typeof cart === "undefined") {

    const cart = (function () {

        let userId;
        let order;

        async function buildCart() {
            userId = await cart.getUserId();
            let fetchURL = `/api/orders/${userId}?unfinished=1`;
            order = await fetchData(fetchURL);

            try { order = await fetchData(fetchURL) }
            catch (e) { console.log("Greska: " + e); return; }

            if (order) {
                // Build item list
                cart.buildGrid(order);
                // Calculate pricing total 
                cart.computeSum(order).then(sum => document.getElementById('total-sum-number').innerHTML = sum + " €");
                // Unhide the total price (it stays hidden if the cart is empty)
                document.getElementById('total-price').classList.remove('hidden');
            } else {
                document.getElementById('empty-cart').style = "display: inline";
            }
            
        }

        async function getUserId() {
            let token = localStorage.getItem("access_token");
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return `${payload.sub}`;
            }
            else { navigateTo("/account"); }
        }

        async function computeSum(order) {
            return order.reduce( (accumulator, o) => {
                return Math.round( ((accumulator + (o.price * o.quantity)) * 100) ) / 100
            }, 0);
        }

        async function buildGrid(order) {
            let grid = document.getElementById('cart-grid');
            order.forEach(i=> {
                let productFrame = document.createElement('div');
                    productFrame.setAttribute('class', 'product-frame');
                let title = document.createElement('h1');
                    title.innerHTML = localStorage.getItem("lang") == 'en' ? i.title : i.naslov;
                let pricePerItem = document.createElement('p');
                    pricePerItem.innerHTML = i.price + " €";
                let image = document.createElement('img');
                    image.setAttribute('src', '/product-images/' + i.url);
                let controls = document.createElement('div');
                    controls.setAttribute('class', 'controls');
                let productInfo = document.createElement('div');
                    productInfo.setAttribute('class', 'product-info');
                let quantityDiv = document.createElement('div');
                    quantityDiv.setAttribute('class', 'quantity-div');
                let quantityLabel = document.createElement('label');
                    quantityLabel.setAttribute('for', 'product-quantity');
                let productQuantity = document.createElement('input');
                    productQuantity.setAttribute('type', 'number');
                    productQuantity.setAttribute('min', 1);
                    productQuantity.setAttribute('max', 20);
                    productQuantity.setAttribute('id', 'product-quantity');
                    productQuantity.value = i.quantity;
                let removeFromCart = document.createElement('img');
                    removeFromCart.setAttribute('src', 'frontend/graphics/delete-x.svg');
                let quantityAlign = document.createElement('div');
                    quantityAlign.setAttribute('class', 'quantity-align');

                quantityDiv.appendChild(quantityLabel);
                quantityDiv.appendChild(productQuantity);

                quantityAlign.appendChild(quantityDiv);
                quantityAlign.appendChild(removeFromCart);


                productFrame.appendChild(image);
                productInfo.appendChild(title);
                productInfo.appendChild(pricePerItem);
                productFrame.appendChild(productInfo);
                controls.appendChild(quantityAlign);
                // controls.appendChild(removeFromCart);
                productFrame.appendChild(controls);
                grid.appendChild(productFrame);
                console.log(i);
            });
            //console.log(grid);
        }

        return {
            buildCart,
            buildGrid,
            getUserId,
            computeSum
        };

    })();

    cart.buildCart();

    document.getElementById("order-button-text").addEventListener("click", (e) => {

    });

    document.getElementById("empty-cart-button-text").addEventListener("click", () => {
        let buttons = document.documentElement.lang == "en" ? ["No", "Yes"] : ["Ne", "Da"];
        let text = document.documentElement.lang == "en" ?
                    "Empty this cart and cancel your order?" :
                    "Isprazniti košaricu i poništiti narudžbu?";
        let choice = openModal(text, buttons);
        console.log(choice);
    });



   
}