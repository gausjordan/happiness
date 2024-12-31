if (localStorage.getItem('access_token')) {
    document.getElementById("user-details").style.display = "block";
}

async function logout() {
    // console.log(window.location.hostname + "/home");
    navigateTo("http://192.168.1.12/home");
    

    // const response = await fetch('http://localhost/api/logout.php', {
    //     method: 'POST',
    //     body: JSON.stringify({
    //         token: localStorage.getItem("refresh_token")
    //     })
    // });

    // localStorage.removeItem("access_token");
    // localStorage.removeItem("refresh_token");

}