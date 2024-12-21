    // SVG loader
    document.getElementById('menu-icon').addEventListener('click', () => {
        const navLinks = document.getElementById('nav-links');
        navLinks.classList.toggle('active');
      });
    const svgElements = [
        { url: 'frontend/graphics/icon.svg', target: 'icon' },
        { url: 'frontend/graphics/logo1.svg', target: 'logo1' }
    ];
    svgElements.forEach(({ url, target }) => {
        fetch(url)
            .then(response => response.text())
            .then(svgContent => {
                if (document.getElementById(target)) {
                    document.getElementById(target).innerHTML = svgContent;
                    // console.log(document.getElementById(target));
                }
            });
    });

    const routes = {
      "/home": '/frontend/home.html',
      "/about" : '/frontend/about.html',
      "/shop": '/frontend/shop.html'
    };

    // navigation handling
    const navigateTo = async (path) => {
      const app = document.getElementById("app");
      const view = routes[path];
      const page = await loadPage(view);
      const parser = new DOMParser();
      const parsedPage = parser.parseFromString(page, 'text/html');
      document.title = "Proba " + parsedPage.title;
      document.getElementById("app").innerHTML = page;
    };

    async function loadPage(view) {
      try {
        const response = await fetch(view);
        const text = await response.text();
        return text;
      } catch (error) {
        return `<h1>Hardcoded Error</h1>`;
      }
    }

    // event listeners for navigation
    document.addEventListener("click", (event) => {
      if (event.target.matches("[data-link]")) {
        event.preventDefault(); 
        const path = event.target.getAttribute("href");
        history.pushState({ path }, null, path);
        navigateTo(path);
      }
    }); 

    // back/forward navigation
    window.addEventListener("popstate", (event) => {
      // Navigate to the path in the current history state
      const path = event.state?.path || window.location.pathname;
      navigateTo(path);
    });

    // Initialize
    // const initialPath = window.location.pathname || "/home";
    const initialPath = window.location.pathname === '/' ? '/home' : window.location.pathname;    
    history.replaceState({ path: initialPath }, null, initialPath);
    navigateTo(initialPath);

    // Temporary splashscreen removal
    document.getElementsByTagName("aside")[0].style.display = "none";

    