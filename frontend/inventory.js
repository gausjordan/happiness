'use strict';

if (typeof inventory === "undefined") {

    let sizeLimit = 20;
    let pageNumber = 1;
    let categories = null;
    let path = "";
    let productsList;

    // Entry point; autoexec.bat
    let inventory = (function () {
        path = getPath();
        let categories = fetchCategories();
            categories.then(c => fillCategoriesSelector(c));
        productsList = getProductsList(path)
            .then(p => buildPage(p))
            .then(p => drawPageSelector(p.metadata[0].productCount), sizeLimit, pageNumber);

        
    })();

    // Fetch a list of items filtered by the criteria defined in a 'path'
    async function getProductsList(path) {
        try {
            let response = await fetchData(path);
            return response;
        } catch (e) {
            console.log(e);
        }
    }

    // Fetch a list of categories to populate the "select category" menu
    async function fetchCategories() {
        let response = await fetchData("/api/products?structure=1");
        return response;
    }

    // Actually use the fetched categories list to populate the "select category" menu
    function fillCategoriesSelector(categories) {
        let categorySelector = document.getElementById("category-filter");
        categories.categories.forEach(c => {
            let option = document.createElement("option");
            option.value = c.category_id;
            option.textContent = localStorage.getItem("lang") === "hr" ? c.categoryname_hr : c.categoryname_en;
            categorySelector.appendChild(option);
        });
    }

    // Generate a full URI to the backend based on the options chosen
    function getPath(e) {
        let sizeLimit = document.getElementById("inventory-size-limit").value;
        let path = "api/products?"
            + "order="
            + (document.getElementById("sort-by").value).split("-")[0]
            + "&direction="
            + (document.getElementById("sort-by").value).split("-")[1];

        if (document.getElementById("category-filter").value !== 'all') {
            path += "&products_and_categories="
                + document.getElementById("category-filter").value;
        }
        path += "&limit="
            + ((pageNumber * sizeLimit) - sizeLimit)
            + ","
            + sizeLimit;
        return path;
    }

    // Refresh the entire page whenever filtering options are changed
    document.getElementById("inventory-options").addEventListener("change", (e) => {
        path = getPath(e);
        productsList = getProductsList(path).then(p => buildPage(p));
    });

    // Use fetched data to render the screen
    function buildPage(productsList) {
        document.getElementById("products-list")?.remove();
        let frag = new DocumentFragment();
        let masterDiv = document.createElement("div");
            masterDiv.setAttribute("id", "products-list");

        productsList.products.forEach(i => {
            let div = document.createElement("div");
            div.classList.add("product");
            div.setAttribute("id", i.id);

            let p = document.createElement("p");
            div.textContent = localStorage.getItem("lang") === "hr" ? i.naslov : i.title;

            div.appendChild(p);
            masterDiv.appendChild(div);
            frag.appendChild(masterDiv);
        });
        
        document.getElementById("app").appendChild(frag);
        return productsList;
    }

    // Draw "previous/next page" buttons
    function drawPageSelector(size) {
        let backButton = document.createElement("button");
            backButton.textContent = localStorage.getItem('lang') == 'hr' ? "Prethodna" : "Previous";
            if (pageNumber == 1) {
                backButton.setAttribute('disabled', "");
            }
            return null;
            backButton.addEventListener("click", () => {
                productsList.setPageNumber(pageNumber - 1);
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
    


}