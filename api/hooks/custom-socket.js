const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

function handleSubscriber(token, wsClient, sails) {
    if (!token) return false;
    try {
        const user = jwt.verify(token, 'your_secret_key');
        const userId = user.id;
        const room = 'user_' + userId;
        if (!sails.rooms) sails.rooms = {};
        if (!sails.rooms[room]) {
            sails.rooms[room] = new Set();
        }
        sails.rooms[room].add(wsClient);
        console.log('Usuário ' + userId + ' inscrito na sala ' + room);
        return true;
    } catch (err) {
        console.log(err)
        return false;
    }
}

function handleUnsubscriber(token, wsClient, sails) {
    if (!token) return false;
    try {
        const user = jwt.verify(token, 'your_secret_key');
        const userId = user.id;
        const room = 'user_' + userId;
        if (!sails.rooms || !sails.rooms[room]) {
            return false;
        }
        sails.rooms[room].delete(wsClient);
        console.log('Usuário ' + userId + ' desinscrito da sala ' + room);
        return true;
    } catch (err) {
        return false;
    }
}

function parseURL(url){
    const queryString = url.split('?')[1];
    const params = queryString.split('&');
    const tokenNoFormatted = params.find(param => param.includes('token')).split('=')[1];
    const token = tokenNoFormatted.replace(/%20/g, ' ').split(' ')[1];
    return token;
}
module.exports = function customSocket(sails) {
  return {
    initialize: async function () {
      sails.rooms = {}; // Inicialize sails.rooms aqui
      const wss = new WebSocket.Server({ port: 8080 }, () => {
        console.log('WebSocket Server rodando na porta 8080.');
      });
      wss.on('connection', function connection(ws, req) {
        const result = handleSubscriber(parseURL(req.url), ws, sails);
        if(!result) return ws.close();
        ws.send(JSON.stringify({
            message: 'Conexão estabelecida.'
        }));
        ws.on('close', function close() {
            handleUnsubscriber(parseURL(req.url), ws, sails);
        });
        ws.on('message', function incoming(message) {
          console.log('received: %s', message);
        });
      });
      wss.clients.forEach(function each(client) {
        client.send('Hello from the server!');
      });
      sails.wss = wss;
      sails.on('hook:orm:loaded', function () {
        sails.hooks.customSocket = {
          wss: wss
        }
      });
    }
  }
}