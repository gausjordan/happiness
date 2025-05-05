'use strict';

if (typeof product === "undefined") {

    let apiPath = null;
    let categories = null;

    // Entry point; autoexec.bat
    let product = (function () {
        let params = new URLSearchParams(window.location.href);
        let basePath = new URL(window.location.href);
        let productId = basePath.pathname.split('/')[2];
            apiPath = "/api/products/" + productId;
        let item = null;
        
        fetchCategories()
            .then(c => {
                categories = c;
                return getItem(apiPath);
            })
            .then(i => {
                item = i;
                return populateForm(i, categories);
            })
            .then(f => {
                document.getElementById("app").appendChild(f);
            })
            .then((a) => {
                document.getElementsByClassName("edit-product-data")[0].addEventListener("input", mainChangeRouter);
            })
            .catch(e => console.error('Async failure. Get to tha choppa! -> ', e));
            
    })();

    // Text input and textarea boxes actually require debouncing, checkboxes and dropdowns do not
    async function mainChangeRouter(e) {
        // console.log(e.target.type);
        if (e.target.type === "text" || e.target.type === "textarea" || e.target.type === "number" || e.target.type === "date") {
            debouncedTextHandler(e);
        }
        else if (e.target.closest('div#checkbox-field')) {
            handleTagChange(e);
        } else if (e.target.id === "select-category") {
            handleCategoryChange(e);
        }
    }


    const debouncedTextHandler = debounce(async function (e) {
            await handleTextChange(e);
    }, 500);

    
    async function handleTagChange(e) {
        // let dbAttribute = String(e.target.id).split("-")[1];
        let field = document.getElementById("checkbox-field");
        let taglist = [];

        Array.from(field.children).forEach(f => {
            let input = f.querySelector('input');
            //console.log(input);
            if (input.checked) {
                taglist.push(input.getAttribute("hr"));
            }
        });
        
        try {
            let response = await fetchData(apiPath, "PATCH", {
                tag : taglist
            });
        } catch (e) {
            console.log("Error updating the product's tag(s).");
        }
    }

    
    async function handleCategoryChange(e) {
        let selector = document.getElementById("select-category");
        console.log(selector.value);
        
        try {
            let response = await fetchData(apiPath, "PATCH", {
                category : [selector.value]
            });
        } catch (e) {
            console.log("Error updating the product's category.");
        }
    }

    
    async function handleTextChange(e) {
        let dbAttribute = String(e.target.id).split("-")[1];
        // console.log(e.target.value);
        try {
            let response = await fetchData(apiPath, "PATCH", {
                [dbAttribute]: e.target.value
            });
        } catch (e) {
            console.log("Error updating a product input or textarea field.");
        }
    }


    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // Retrieve information about an existing product
    async function getItem(apiPath) {
        try {
            let response = fetchData(apiPath);
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


    function populateForm(item, categories) {

        let frag = new DocumentFragment();

        let masterDiv = `
            <div class="edit-product-data">
                
                <label for="input-id" id="input-id-label">
                    Id: 
                </label>
                <input type="text" name="input-id" id="input-id" value="" disabled>
                </input>

                <label for="input-naslov" id="input-naslov-label">
                    Naslov (Croatian title): 
                </label>
                <input type="text" name="input-naslov" id="input-naslov" value="">
                </input>

                <label for="input-title" id="input-title-label">
                    Title (English title): 
                </label>
                <input type="text" name="input-title" id="input-title" value="">
                </input>
                
                <label for="input-opis" id="input-opis-label">
                    Opis (Croatian description): 
                </label>
                <textarea type="text" name="input-opis" id="input-opis" value="">
                </textarea>

                <label for="input-description" id="input-description-label">
                    Description (English description): 
                </label>
                <textarea type="text" name="input-description" id="input-description" value="">
                </textarea>
                
                <label for="select-category" id="select-category-label">
                    Kategorija (category): 
                </label>
                    <select name="select-category" id="select-category">
                </select>

                <label for="checkbox-field" id="checkbox-field-label">
                    Opisne riječi (tags): 
                </label>
                <div id="checkbox-field">
                </div>

                <label for="input-price" id="input-price-label">
                    Cijena (price): 
                </label>
                <input type="number" step="0.01" id="input-price" name="input-price">
                </input>

                <label for="is-available"  id="is-available-label">
                    Artikl je dostupan | available
                    <input type="checkbox" name="is-available" id="is-available">
                    </input>
                </label>

                <label for="is-visible"  id="is-visible-label">
                    Artikl je vidljiv | visible
                    <input type="checkbox" name="is-visible" id="is-visible">
                    </input>
                </label>
                
                <label for="input-dateAdded"  id="input-dateAdded-label">
                    Datum upisa | Date added
                </label>
                <input type="date" name="input-dateAdded" id="input-dateAdded">
                </input>
                
                <label for="preview-images"  id="preview-images-label">
                    Slike | Images:
                </label>
                <div id="preview-images">
                </div>

            </div>
        `;

        let tempObjectified = document.createElement('div');
            tempObjectified.innerHTML = masterDiv;

        frag.append(...tempObjectified.childNodes);

        frag.getElementById("input-id").value = item.id;
        frag.getElementById("input-naslov").value = item.naslov;
        frag.getElementById("input-title").value = item.title;
        frag.getElementById("input-opis").value = item.opis;
        frag.getElementById("input-description").value = item.description;
        frag.getElementById("input-price").value = item.price;
        frag.getElementById("is-available").checked = item.is_available;
        frag.getElementById("is-visible").checked = item.is_visible;
        frag.getElementById("input-dateAdded").value = item.dateAdded;
        
        categories.categories.forEach(c => {
            let opt = document.createElement('option');
            opt.value = c.categoryname_hr;
            opt.setAttribute("db-id", c.category_id);
            opt.textContent = localStorage.getItem("lang") === 'hr' ? c.categoryname_hr : c.categoryname_en;

            if (item.category[0] === c.categoryname_hr) {
                opt.selected = true;
            }

            frag.getElementById("select-category").appendChild(opt);
        });

        // Take only raw integer id's off of an item's tags array
        let productTagIDs = item.tag.map(m => Number.parseInt(m[0]));

        categories.tags.forEach(t => {
            let checkbox = document.createElement('input');
            let checkbox_label = document.createElement('label');
                checkbox_label.setAttribute("for", "t" + t.tag_id);
                checkbox_label.textContent = localStorage.getItem("lang") === 'hr' ? t.tagname_hr : t.tagname_en;
            checkbox.type = "checkbox";
            checkbox.name = "checkbox-field";
            checkbox.id = "t" + t.tag_id;
            checkbox.setAttribute("db-id", t.tag_id);
            checkbox.setAttribute("en", t.tagname_en);
            checkbox.setAttribute("hr", t.tagname_hr);
            checkbox.value = checkbox_label.textContent;

            if (productTagIDs.includes(t.tag_id)) {
                checkbox.checked = true;
            }

            checkbox_label.appendChild(checkbox);
            frag.getElementById("checkbox-field").appendChild(checkbox_label);
        });

        item.url.forEach(u => {
            let div = document.createElement('div');
                div.classList.add("preview-image-thumbnail");
            let img = document.createElement('img');
                img.src = "/product-images/" + u;
            let buttons = document.createElement('div');
                buttons.classList.add("edit-thumbnail-buttons");
            let deleteButton = document.createElement('button');
                deleteButton.textContent = localStorage.getItem('lang') === 'hr' ? "Obriši" : "Delete";
            let renameButton = document.createElement('button');
                renameButton.textContent = localStorage.getItem('lang') === 'hr' ? "Preimenuj" : "Rename";
            
            div.appendChild(img);
            buttons.appendChild(deleteButton);
            buttons.appendChild(renameButton);
            div.appendChild(buttons);
            frag.getElementById("preview-images").appendChild(div);
        });

        let div = document.createElement('div');
            div.classList.add("preview-image-thumbnail");
        let img = document.createElement('img');
            img.src = "";
            img.classList.add("new-image-placeholder");
        let buttons = document.createElement('div');
            buttons.classList.add("edit-thumbnail-buttons");
        let addButton = document.createElement('button');
        addButton.textContent = localStorage.getItem('lang') === 'hr' ? "Dodaj novu sliku" : "Add new image";
        
        div.appendChild(img);
        buttons.appendChild(addButton);
        div.appendChild(buttons);
        frag.getElementById("preview-images").appendChild(div);
        

        return frag;
    }

}