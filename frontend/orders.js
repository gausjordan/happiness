'use strict';

if (typeof orders === "undefined") {

    const orders = (function () {
        
        let sizeLimit = 5;
        let userId = getUserId();
        let baselineURL = "/api/orders/?finished=1";
        let fetchURL = baselineURL + `&order-by-desc=dateOrdered&show-all=1&limit=0,` + sizeLimit;

        document.getElementById('orders-options').addEventListener("change", refreshData);

        async function refreshData(e) {
            let sortOption = document.getElementById('sort-by').value;
            let showArchived = document.getElementById('show-archived');
            let dateFrom = document.getElementById('date-from').value;
            let dateTo = document.getElementById('date-to').value;
            let dateLimits ="";

            switch(sortOption) {
                case "date-asc":
                    sortOption = "&order-by-asc=dateOrdered";
                    break;
                case "date-desc":
                    sortOption =  "&order-by-desc=dateOrdered";
                    break;
                case "price-asc":
                    sortOption =  "&order-by-asc=price";
                    break;
                case "price-desc":
                    sortOption =  "&order-by-desc=price";
                    break;
                default:
                    sortOption = "";
                    break;
            }
            
            if (showArchived.checked === true) {
                showArchived = "&show-all=1";
            } else {
                showArchived = "";
            }

            if (dateFrom === "") {
                dateFrom = "2000-01-01";
            }
            if (dateTo === "") {
                dateTo = "2222-01-01";
            }
            dateLimits = "&daterange=" + dateFrom + "," + dateTo;

            fetchURL = baselineURL + showArchived + sortOption + dateLimits;

            try {
                let ordersCount = await orders.getOrdersSize();
                let rawData = await orders.getOrdersList();
                buildTable(rawData, ordersCount.rowcount, orders.getSizeLimit());
    
            } catch (error) {
                console.error("Error refreshing orders or re-building the table:", error);
            }
            
       
        }

        function getUserId() {
            let token = localStorage.getItem("access_token");
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return `${payload.sub}`;
            }
            else { navigateTo("/account"); }
        }
        
        async function getOrdersList() {
            let orders = await fetchData(fetchURL);
            return orders;
        }

        async function getOrdersSize() {
            /* Call the API using the same path as the getOrdersList(), except strip
            the part that sets LIMITs and add 'sizeof' parameter, which only gets one
            row - How many entries would have been sent had there been no limits */
            return fetchData(fetchURL.slice(0,fetchURL.indexOf("&limit")) + '&sizeof=1');
        }
        
        function getSizeLimit() {
            return sizeLimit;
        }
        
        return {
            getOrdersList,
            getOrdersSize,
            getUserId,
            getSizeLimit
        };
        

    })();

    (async () => {
        try {
            let ordersCount = await orders.getOrdersSize();
            let rawData = await orders.getOrdersList();
            buildTable(rawData, ordersCount.rowcount, orders.getSizeLimit());

        } catch (error) {
            console.error("Error fetching orders or building table:", error);
        }
    })();

    async function buildTable(raw, size, sizeLimit) {

        // console.log(raw, size, sizeLimit);

        let table = document.getElementById('orders-list').getElementsByTagName('tbody')[0];
        let fragment = document.createDocumentFragment();
        let template = document.getElementsByClassName('empty-template')[0];

        let existingRows = Array.from(document.getElementsByClassName('data'));
        
        if(existingRows) {
            existingRows.forEach(r => table.removeChild(r));
        }

        for (let i = 0; i < raw.length; i++) {
            let newRow = template.cloneNode(true);
            newRow.classList.remove('empty-template');
            newRow.classList.add('data');
            newRow.querySelector('td[name="order_id_caption"]').innerHTML = localStorage.getItem('lang') === 'hr' ? 'Broj narudžbe' : 'Order number';
            newRow.querySelector('td[name="order_id_value"]').innerHTML = raw[i].order_id;
            newRow.querySelector('td[name="full_name_caption"]').innerHTML = localStorage.getItem('lang') === 'hr' ? 'Naručitelj' : 'Full name';
            newRow.querySelector('td[name="full_name_value"]').innerHTML = raw[i].firstName + " " + raw[i].lastName;
            newRow.querySelector('td[name="date_ordered_caption"]').innerHTML = localStorage.getItem('lang') === 'hr' ? 'Datum narudžbe' : 'Order date';
            newRow.querySelector('td[name="date_ordered_value"]').innerHTML = localizeDate(raw[i].dateOrdered);
            newRow.querySelector('td[name="date_received_caption"]').innerHTML = localStorage.getItem('lang') === 'hr' ? 'Datum primitka' : 'Received date';
            newRow.querySelector('td[name="date_received_value"]').innerHTML = localizeDate(raw[i].dateReceived);
            newRow.querySelector('td[name="total_caption"]').innerHTML = localStorage.getItem('lang') === 'hr' ? 'Iznos narudžbe' : 'Order total';
            newRow.querySelector('td[name="total_value"]').innerHTML = raw[i].price + " €";
            newRow.querySelector('td[name="is_paid_caption"]').innerHTML = localStorage.getItem('lang') == 'hr' ? 'Plaćeno' : 'Paid';
            newRow.querySelector('td[name="is_paid_value"] input').checked = raw[i].is_paid === 1 ? true : false;
            newRow.querySelector('td[name="is_sent_caption"]').innerHTML = localStorage.getItem('lang') == 'hr' ? 'Poslano' : 'Shipped';
            newRow.querySelector('td[name="is_sent_value"] input').checked = raw[i].is_shipped === 1 ? true : false;
            newRow.querySelector('td[name="is_returned_caption"]').innerHTML = localStorage.getItem('lang') == 'hr' ? 'Vraćen proizvod' : 'Returned';
            newRow.querySelector('td[name="is_returned_value"] input').checked = raw[i].is_returned === 1 ? true : false;
            newRow.querySelector('td[name="is_refunded_caption"]').innerHTML = localStorage.getItem('lang') == 'hr' ? 'Vraćen novac' : 'Refunded';
            newRow.querySelector('td[name="is_refunded_value"] input').checked = raw[i].is_refunded === 1 ? true : false;
            newRow.querySelector('td[name="is_archived_caption"]').innerHTML = localStorage.getItem('lang') == 'hr' ? 'U arhivi' : 'Archived';
            newRow.querySelector('td[name="is_archived_value"] input').checked = raw[i].is_archived === 1 ? true : false;
            newRow.querySelector('td[name="note_caption"]').innerHTML = localStorage.getItem('lang') == 'hr' ? 'Napomena' : 'Note';
            newRow.querySelector('td[name="note_value"] textarea').innerHTML = raw[i].comment;
            fragment.appendChild(newRow);
        }

        table.appendChild(fragment);

        if (size > sizeLimit) {
            console.log("Shit got overflown");
        }

        return raw;
    }
    

    function localizeDate(date) {
        if (date && localStorage.getItem('lang') === 'hr') {
            return date.split('-').reverse().join('.');
        } else if (date && localStorage.getItem('lang') === 'en') {
            let locDate = new Date(date);
            return locDate.toLocaleDateString('en-GB');
        }
        else {
            return date;
        }
    }

}