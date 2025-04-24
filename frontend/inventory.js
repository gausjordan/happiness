'use strict';

if (typeof inventory === "undefined") {

    let sizeLimit = 20;
    let pageNumber = 1;
    let categories = null;

    let inventory = (function () {
        let categories = fetchCategories();
            categories.then(c => fillCategoriesSelector(c));
    })();

    async function fetchCategories() {
        let response = await fetchData("/api/products?structure=1");
        return response;
    }

    function fillCategoriesSelector(categories) {
        document.getElementById("category-filter");
        categories.categories.forEach(c => console.log(c.categoryname_hr));
    }

    async function fetchInventory(sortBy = "date", order = "desc", pageNumber = 1, to = sizeLimit) {
        let response = fetchData("/api/products");
        return response;
    }
}