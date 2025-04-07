'use strict';

if (typeof orders === "undefined") {

    const orders = (function () {
        
        let userId = getUserId();

        function getUserId() {
            let token = localStorage.getItem("access_token");
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return `${payload.sub}`;
            }
            else { navigateTo("/account"); }
        }
        
        async function buildOrdersList() {
            
            let fetchURL = `/api/orders?finished=1`;

            let orders = await fetchData(fetchURL);

            console.log(orders);

        }

        return {
            buildOrdersList,
            getUserId
        };

    })();

    orders.buildOrdersList();

}