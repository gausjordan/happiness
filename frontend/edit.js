'use strict';

if (typeof product === "undefined") {

    let apiPath = null;
    let categories = null;
    let params = new URLSearchParams(window.location.href);
    let basePath = new URL(window.location.href);

    // Entry point; autoexec.bat
    let product = (function () {

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
        // console.log(e.target);
        if (e.target.type === "text" || e.target.type === "textarea" || e.target.type === "number" || e.target.type === "date") {
            debouncedTextHandler(e);
        }
        else if (e.target.closest('div#checkbox-field')) {
            handleTagChange(e);
        } else if (e.target.id === "select-category") {
            handleCategoryChange(e);
        } else if (e.target.type === 'checkbox' && (e.target.name === 'is-available' || e.target.name === 'is-visible')) {
            handleSimpleBoolean(e);
        }
    }

    function handleSimpleBoolean(e) {
        let dbAttribute = String(e.target.name).replace("-", "_");
        try {
            let response = fetchData(apiPath, "PATCH", {
                [dbAttribute] : e.target.checked ? true : false
            });
        } catch (e) {
            console.log("Error toggling a product's bool attribute.");
            console.log(e);
    }

    }

    let debouncedTextHandler = debounce(async function (e) {
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
                deleteButton.classList.add("delete-image-button");
                deleteButton.addEventListener("click", (e) => deleteImage(e));
            let renameButton = document.createElement('button');
                renameButton.textContent = localStorage.getItem('lang') === 'hr' ? "Preimenuj" : "Rename";
                renameButton.addEventListener("click", (e) => renameImage(e, u, item.id, item.url));
                renameButton.classList.add("rename-image-button");
            
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


    // This is where renaming operation starts, on a click of a button
    async function renameImage(e, url, id, urls) {
        let dialog = document.createElement("div");
            dialog.setAttribute("id", "modal-dialog-box");
        let filteredFilename = url;
        let lastDot = filteredFilename.lastIndexOf('.');
        let fileWithoutExtension = filteredFilename.slice(0, lastDot);
        
        let input = document.createElement("input");
            input.type = "text";
            input.value = fileWithoutExtension;
        dialog.appendChild(input);

        // the second parameter is a function which should add some logic to the passed (and now generated) elements
        // last two parameters are references to elements to whom default click listeners (closing the popup) won't be appended
        popUpBigModal(
                        dialog,
                        (ignoredElements, invisiDiv) => {
                            injectListeners(e, url, fileWithoutExtension, id, urls, ignoredElements, invisiDiv);
                        }, dialog, input
                    );
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }


    async function deleteImage(e) {

        let dialog = document.createElement("div");
            dialog.setAttribute("id", "modal-dialog-box");
            dialog.setAttribute("class", "modal");
        
        let text = document.createElement("p");
            text.textContent = localStorage.getItem('lang') === 'hr' ? "Obrisati sliku?" : "Delete image?";

        let buttons = document.createElement("div");
            buttons.classList.add("modal-buttons");
        
        let yesButton = document.createElement("button");
            yesButton.textContent = localStorage.getItem('lang') === 'hr' ? "Da" : "Yes";
            
        let noButton = document.createElement("button");
            noButton.textContent = localStorage.getItem('lang') === 'hr' ? "Ne" : "No";

        dialog.appendChild(text);
        buttons.appendChild(yesButton);
        buttons.appendChild(noButton);
        dialog.appendChild(buttons);

        popUpBigModal(
                        dialog,
                        () => {
                            setTimeout(() => {
                                document.body.addEventListener("click", closeModal);
                            }, 0);
                    
                            function closeModal(e) {
                                cleanupModal(e);
                                document.body.removeEventListener("click", closeModal);
                            };

                        }, dialog, text
                    );
    }



    // This function brings up a modal on screen, generates some content passed into it,
    // prevents regular flow to be scrollable underneath the modal, and then EITHER:
    // (a) sets listeners to autodestruct the modal on click ANYWHERE but on the "ignoredElements" array OR
    // (b) implements custom logic if callback is not null.
    function popUpBigModal(content, callback, ...ignoredElements) {
        document.body.style.overflow = "hidden";
        window.addEventListener('keydown', function(e) {
            const keys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
            if (keys.includes(e.key) && e.target.nodeName !== 'INPUT') {
              e.preventDefault();
            }
          }, { passive: false });

        let invisiDiv = document.createElement('div');
            invisiDiv.style.display = "flex";
            invisiDiv.setAttribute("id", "modal-dialog-box");
            invisiDiv.classList.add("modal");
        invisiDiv.appendChild(content);
        document.body.appendChild(invisiDiv);

        callback(ignoredElements, invisiDiv);
    }


    function injectListeners(e, url, fileWithoutExtension, id, urls, ignoredElements, invisiDiv) {
        setTimeout(() => {
            document.body.addEventListener("click", closeModal);
        }, 0);

        function closeModal(e) {
            if (!ignoredElements.includes(e.target)) {
                renameGateway(e, fileWithoutExtension, id, urls);
                cleanupModal(e);
                document.body.removeEventListener("click", closeModal);
            }
        };
    }


    async function renameGateway(e, fileWithoutExtension, id, urls) {
        let index = urls.indexOf(fileWithoutExtension + ".jpg");
        let oldFilename = urls[index];
        let value = document.querySelector("div#modal-dialog-box.modal input").value;
        urls[index] = value + ".jpg";

        if (fileWithoutExtension !== value) {
            try {
                let resp1 = await fetchData("/api/products/images", "PATCH", 
                    {   old : [fileWithoutExtension] + ".jpg",
                        new : [value] + ".jpg" }
                );
                let resp2 = await fetchData("/api/products/" + id, "PATCH", 
                    {  url : urls }
                );
                document.getElementById("app").innerHTML = "";
                navigateTo(basePath.pathname);
            }
            catch (e) { console.log("Image rename request failed. Error: ", e) }
        } else {
            // TODO
        }
    }


    function cleanupModal(e) {
        document.querySelector('div#modal-dialog-box.modal').remove();
        document.querySelectorAll('.blurred').forEach(i => i.classList.remove('blurred'));
        document.body.style.overflow = "initial";
    }

}