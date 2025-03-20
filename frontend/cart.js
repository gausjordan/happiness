'use strict';

if (typeof cart === "undefined") {

    const cart = (function () {
        
        let userId;
        let order;

        async function buildCart() {
            
            userId = await cart.getUserId();
            let fetchURL = `/api/orders/${userId}?unfinished=1`;
            order = await fetchOrder(fetchURL);

            if (order) {
                // Build item list
                await cart.buildGrid(order);
                // Calculate pricing total 
                await cart.computeSum(order).then(sum => document.getElementById('total-sum-number').innerHTML = sum + " €");
                // Unhide the total price (it stays hidden if the cart is empty)
                document.getElementById('total-price').classList.remove('hidden');
            } else {
                document.getElementById('empty-cart').style = "display: inline";
            }
        }

        async function fetchOrder(fetchURL) {
            let order = await fetchData(fetchURL);
            try { order = await fetchData(fetchURL) }
            catch (e) { console.log("Greska: " + e); return; }
            return order;
        }

        async function getOrder() {
            return order;
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
            
            // Prevent showing duplicates if reloaded mid-loading
            document.getElementById('cart-grid').innerHTML = "";

            let grid = document.getElementById('cart-grid');
            order.forEach(i=> {
                let productFrame = document.createElement('div');
                    productFrame.setAttribute('class', 'product-frame');
                    productFrame.setAttribute('product-id', i.product_id);
                let title = document.createElement('a');
                    title.innerHTML = localStorage.getItem("lang") == 'en' ? i.title : i.naslov;
                    title.setAttribute("href", "/product/" + i.product_id);
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
                    productQuantity.setAttribute('data-old-value', i.quantity);
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
                // console.log(i);
                
                title.addEventListener("click", (e) => {
                    e.preventDefault();
                    navigateTo("/product/" + i.product_id);
                }, { once : true});

                image.addEventListener("click", (e) => {
                    e.preventDefault();
                    navigateTo("/product/" + i.product_id);
                }, { once : true});

                removeFromCart.addEventListener("click", (e) => {
                    e.preventDefault();
                    // /api/orders/10?delete-item=3
                    try {
                        fetchData("/api/orders/" + i.order_id + "?delete-item=" + i.product_id, "DELETE").then(navigateTo("/cart"));
                    } catch {
                        console.log("Error deleting an order item.");
                    }
                }, { once : true});

                productQuantity.addEventListener("change", async (e) => {
                    if (e.target.value >= 20) {
                        e.target.value = 20;
                    } else if (e.target.value < 1) {
                        e.target.value = 1;
                    }
                    try {
                        let process = await changeValue(parseInt(e.target.dataset.oldValue), e.target.value, i.product_id);
                        e.target.value = process[1];
                        e.target.dataset.oldValue = process[0];
                        // let product_id = e.target.parentElement.parentElement.parentElement.parentElement.attributes["product-id"].value;
                        // console.log(order);
                        let fetchURL = `/api/orders/${userId}?unfinished=1`;
                        let newSum = await cart.fetchOrder(fetchURL).then(order => computeSum(order));
                        document.getElementById('total-sum-number').innerHTML = newSum + " €";
                        
                    } catch {
                        console.log("Error updating a quantity.");
                    }
                });
                
                async function changeValue(oldVal, newVal, productId) {
                    try {
                        await fetchData("/api/orders/" + i.order_id + "?quantity=" + newVal + "&order_item_id=" + productId, "PATCH");
                        oldVal = newVal;
                        console.log("Success.");
                        return [oldVal, newVal];
                    } catch {
                        newVal = oldVal;
                        console.log("Error changing a quantity.");
                        return [oldVal, newVal];
                    }
                }
            });
        }

        return {
            buildCart,
            buildGrid,
            getUserId,
            computeSum,
            getOrder,
            fetchOrder
        };

    })();

    cart.buildCart();

    document.getElementById("order-button-text").addEventListener("click", (e) => {

    });

    document.getElementById("empty-cart-button-text").addEventListener("click", async () => {
        let buttons = document.documentElement.lang == "en" ? ["No", "Yes"] : ["Ne", "Da"];
        let text = document.documentElement.lang == "en" ?
                    "Empty this cart and cancel your order?" :
                    "Isprazniti košaricu i poništiti narudžbu?";
        
        let usersChoice = await openModal(text, buttons);
        if (usersChoice == "Da" || usersChoice == "Yes") {
            try {
                let userId = JSON.parse(atob(localStorage.getItem('access_token').split('.')[1])).sub;
                fetchData("/api/orders/" + userId, "DELETE").then(navigateTo("/cart"));
            } catch {
                console.log("Error deleting a cart.");
            }
        } else {
            
        }
    });
    
    document.getElementById("order-button-text").addEventListener("click", async () => {
        let buttons = document.documentElement.lang == "en" ? ["No", "Yes"] : ["Ne", "Da"];
        let text = document.documentElement.lang == "en" ?
                    "Place order?" :
                    "Dovršiti narudžbu?" ;
        
        let usersChoice = await openModal(text, buttons);
        if (usersChoice == "Da" || usersChoice == "Yes") {
            let data = await cart.getOrder();
            let orderId = data[0].order_id;
            
            let requestBody = { dateOrdered : new Date().toISOString().split('T')[0] }

            fetchData("/api/orders/" + orderId, "PATCH", requestBody).then(navigateTo("/home"));
        } else {

        }
    });
}


