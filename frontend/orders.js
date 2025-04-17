'use strict';

if (typeof orders === "undefined") {


    const orders = (function () {
        let sizeLimit = 20;
        let pageNumber = 1;
        let userId = getUserId();
        let baselineURL = "/api/orders/?finished=1";
        let fetchURL = applyFilteringOptions();

        console.log(fetchURL);

        document.getElementById('orders-options').addEventListener("change", () => {
            refreshData();
            // Each time one changes the sorting criteria, we're back to page 1
            pageNumber = 1;
        });

        async function refreshData() {
            fetchURL = applyFilteringOptions();
            try {
                let ordersCount = await orders.getOrdersSize();
                let rawData = await orders.getOrdersList();
                deleteOldContentIfAny();
                buildTable(rawData, ordersCount.rowcount, orders.getSizeLimit());
    
            } catch (error) {
                console.error("Error refreshing orders or re-building the table:", error);
            }
        }

        function applyFilteringOptions() {

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
                dateTo = "2200-01-01";
            }
            dateLimits = "&daterange=" + dateFrom + "," + dateTo;

            return baselineURL +
                showArchived +
                sortOption +
                dateLimits +
                `&limit=` + ((pageNumber * sizeLimit) - sizeLimit) + "," + sizeLimit;
        }

        function getUserId() {
            let token = localStorage.getItem("access_token");
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return `${payload.sub}`;
            }
            else { navigateTo("/account"); }
        }
        
        async function getOrdersList(from, to) {
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

        function getPageNumber() {
            return pageNumber;
        }

        function setPageNumber(num) {
            pageNumber = num;
        }
        
        return {
            getOrdersList,
            getOrdersSize,
            getUserId,
            getSizeLimit,
            getPageNumber,
            getSizeLimit,
            setPageNumber,
            refreshData
        };
        

    })();

    /* Initial data batch on load */
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

        let table = document.getElementById('orders-list').getElementsByTagName('tbody')[0];
        let fragment = document.createDocumentFragment();
        let template = document.getElementsByClassName('empty-template')[0];
        
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
            
            // Handle updating one particular order's checkbox states
            newRow.addEventListener("click", async (e) => {
                let nameParam = e.target.parentElement.getAttribute("name");
                let id = e.target.parentElement.parentElement.querySelector('td[name="order_id_value"]').textContent;
                switch (nameParam) {
                    case "is_paid_value":
                        flipTheCheckbox(e, id, "is_paid");
                        break;
                    case "is_sent_value":
                        flipTheCheckbox(e, id, "is_shipped");
                        break;
                    case "is_returned_value":
                        flipTheCheckbox(e, id, "is_returned");
                        break;
                    case "is_refunded_value":
                        flipTheCheckbox(e, id, "is_refunded");
                        break;
                    case "is_archived_value":
                        flipTheCheckbox(e, id, "is_archived");
                        break;
                    default:
                        break;
                }
            });

            // Handle updating one particular order's custom notes
            newRow.addEventListener("input", (e) => {
                let nameParam = e.target.parentElement.getAttribute("name");
                let id = e.target.parentElement.parentElement.querySelector('td[name="order_id_value"]').textContent;
                let textValue = e.target.parentElement.parentElement.querySelector('td[name="note_value"] textarea').value;
                
                switch (nameParam) {
                    case "note_value":
                        debouncedTextHandler(textValue);
                        break;
                    default:
                        break;
                }
            });
            
            fragment.appendChild(newRow);
        }

        
        // Only draw the page selection <div> if there is more than one page
        if (size > sizeLimit) { drawPageSelector(size, sizeLimit, orders.getPageNumber()); }

        table.appendChild(fragment);

        return raw;
    }

    async function flipTheCheckbox(e, id, whichRow) {
        e.target.disabled = true;
        try {
            await fetchData(`api/orders/${id}`, "PATCH", {
                [whichRow] : e.target.checked ? 1 : 0
            });
            let response = await fetchData(`api/orders/${id}?overview=1`, "GET");
            e.target.checked = response[whichRow];
        } catch (error) {
            console.error(`Error updating ${whichRow} checkbox state: `, error);
            e.target.checked = !e.target.checked;
        } finally {
            e.target.disabled = false;
        }
    }

    function handleTextAreaUpdates(textValue) {
        console.log(textValue);
    }

    let debouncedTextHandler = debounce((textValue) => {
        handleTextAreaUpdates(textValue);
    }, 500);

    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    function deleteOldContentIfAny() {
        let table = document.getElementById('orders-list').getElementsByTagName('tbody')[0];
        let existingRows = Array.from(document.getElementsByClassName('data'));
        let pageSelector = document.getElementsByClassName('orders-page-selector')[0];
        
        if(existingRows) {
            existingRows.forEach(r => table.removeChild(r));
        }
        if (pageSelector) {
            document.getElementById('app').removeChild(pageSelector);
        }
    }   

    function drawPageSelector(size, sizeLimit, pageNumber) {
        let backButton = document.createElement("button");
        console.log("---");
        console.log(pageNumber);
            backButton.textContent = localStorage.getItem('lang') == 'hr' ? "Prethodna" : "Previous";
            if (pageNumber == 1) {
                backButton.setAttribute('disabled', "");
            }
            backButton.addEventListener("click", () => {
                orders.setPageNumber(orders.getPageNumber() - 1);
                orders.refreshData();
            });
        let pageInput = document.createElement("input");
            pageInput.setAttribute('type', 'number');
            pageInput.setAttribute('min', 1);
            pageInput.setAttribute('size', "3");
            pageInput.setAttribute('max', Math.ceil(size / sizeLimit));
            pageInput.setAttribute('value', orders.getPageNumber());
            pageInput.addEventListener("change", (e) => {
                orders.setPageNumber(e.target.value);
                orders.refreshData();
            });
        let forwardButton = document.createElement("button");
            forwardButton.textContent = localStorage.getItem('lang') == 'hr' ? "Sljedeća" : "Next";
            if (pageNumber == Math.ceil(size / sizeLimit)) {
                forwardButton.setAttribute('disabled', "");
            }
            forwardButton.addEventListener("click", () => {
                orders.setPageNumber(orders.getPageNumber() + 1);
                orders.refreshData();
            });
        
        let pageSelector = document.createElement("div");
            pageSelector.classList.add('orders-page-selector');
       
        pageSelector.appendChild(backButton);
        pageSelector.appendChild(pageInput);
        pageSelector.appendChild(forwardButton);
        
        document.getElementById('app').appendChild(pageSelector);
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