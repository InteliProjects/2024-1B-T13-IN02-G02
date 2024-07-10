function websocketClient() {
    const token = localStorage.getItem("access_token");
    let wsUrl;

    if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
        wsUrl = `ws://localhost:8080?token=${token}`;
    } else {
        wsUrl = `wss://two024-1b-t13-in02-g02-1.onrender.com?token=${token}`;
    }

    const ws = new WebSocket(wsUrl);
    ws.onopen = function open() {
        ws.send("Hello from the client!");
    };

    return ws;
}
