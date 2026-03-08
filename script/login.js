console.log("Login script loaded");
document.getElementById("login-btn").addEventListener("click", function(event) {

    console.log("Login button clicked");

    // 1. Get username input
    const nameInput = document.getElementById("input-number");
    const name = nameInput.value;
    console.log(name);

    // 2. Get password input
    const pinInput = document.getElementById("input-pass");
    const pin = pinInput.value;
    console.log(pin);

    // 3. Match username and password
    if(name === "admin" && pin === "admin123")
    {
        alert("Login successful!");
        window.location.assign("home.html");
    }
    else
    {
        alert("Login failed! Wrong username or password.");
    }

});
