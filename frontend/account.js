// User is logged in
if (localStorage.getItem('access_token')) {
    document.getElementById("user-details").style.display = "block";
}
// User is logged out
else {
    document.getElementById("login-form").style.display = "block";
}

async function logout() {

    const response = await fetch('/api/logout.php', {
        method: 'POST',
        body: JSON.stringify({
            token: localStorage.getItem("refresh_token")
        })
    });
    
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    adminMenuOptions();
    navigateTo("/home");

}

async function login(event) {
    event.preventDefault();

    let user = document.getElementById("username");
    let pass = document.getElementById("password");
    
    const response = await fetch("/api/login.php", {
        method: 'POST',
        body: JSON.stringify({
            "username" : user.value,
            "password" : pass.value
        })
    });

    let json = await response.text();
    let obj = JSON.parse(json);

    if (response.status == 200) {
        localStorage.setItem("access_token", obj.access_token);
        localStorage.setItem("refresh_token", obj.refresh_token);
        adminMenuOptions();
        navigateTo("/shop");
    } else if (response.status == 401) {
        alert("Gay");
        console.log("You are gay");
    }



    //console.log(obj);
}