const tokenVerify = async() => {
    const token = localStorage.getItem("access_token")
    if (!token && window.location.pathname !== "/login" && window.location.pathname !== "/reset-password" && window.location.pathname !== "/change-password" && window.location.pathname !== "/api/reset-password" && window.location.pathname !== "/register") return window.location.pathname = "/login"
    if (window.location.href.includes("/engineer")) {
        const response = await fetch('/api/engineer/token/verify', {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });
        if (response.status >= 400 && window.location.pathname !== "/login") return window.location.pathname = "/login"
    } else if (window.location.pathname.includes("/mounter")) {
        const response = await fetch("/api/mounter/token/verify", {
            method: "GET",
            headers: {
                "Authorization": token
            }
        });
        if (response.status >= 400 && window.location.pathname !== "/login") return window.location.pathname = "/login"
    }

}
tokenVerify();
