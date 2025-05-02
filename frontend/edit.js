'use strict';

if (typeof product === "undefined") {

    // Entry point; autoexec.bat
    let product = (function () {
        let params = new URLSearchParams(window.location.href);
        let basePath = new URL(window.location.href);
        let productId = basePath.pathname.split('/')[2];
        let apiPath = "/api/products/" + productId;
        let categories = null;
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
            .catch(e => console.error('Async failure. Get to the chopa. ', e));
    })();

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
                
                <label for="input-date"  id="input-date-label">
                    Datum upisa | Date added
                </label>
                <input type="date" name="input-date" id="input-date">
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
        frag.getElementById("input-date").value = item.dateAdded;
        
        categories.categories.forEach(c => {
            let opt = document.createElement('option');
            opt.value = "c" + c.category_id;
            opt.textContent = c.categoryname_hr + " | " + c.categoryname_en;

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
                checkbox_label.textContent = t.tagname_hr + " | " + t.tagname_en;
            checkbox.type = "checkbox";
            checkbox.name = "checkbox-field";
            checkbox.id = "t" + t.tag_id;
            checkbox.value = t.tagname_hr + " | " + t.tagname_en;

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