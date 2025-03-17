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
            let grid = document.getElementById('cart-grid');
            order.forEach(i=> {
                let productFrame = document.createElement('div');
                    productFrame.setAttribute('class', 'product-frame');
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

                productQuantity.addEventListener("focus", (e) => {
                    e.target.dataset.oldValue = i.quantity;
                });

                productQuantity.addEventListener("change", (e) => {
                    let process = changeValue(parseInt(e.target.dataset.oldValue), e.target.value);
                    e.target.value = process[1];
                    e.target.dataset.oldValue = process[0];
                });
                
                productQuantity.addEventListener("keyup", function(event) {
                    if (event.key === "Enter") {
                        console.log("Enter");
                    }
                });

                function changeValue(oldVal, newVal) {
                    try {
                        
                        if (Math.random() > 0.5) {
                            console.log("OP! Fail");
                            throw Error;
                        }
                        
                        // let currentDate = new Date().toISOString().split('T')[0];
                        // fetchData("/api/orders/" + i.order_id + "?delete-item=" + i.product_id, "DELETE").then(navigateTo("/cart"));
                        
                        oldVal = newVal;

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
            getOrder
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
            
            let dummyBody = { dateOrdered : "2222-12-11",  "dateReceived" : "2000-10-01" }

            fetchData("/api/orders/" + orderId, "PATCH", dummyBody ).then(navigateTo("/home"));
        } else {

        }
    });

   
}