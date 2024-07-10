const jwt = require('jsonwebtoken');
module.exports = async function(req, res, proceed) {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        try {
            console.log(token);
            const decodedJwt = jwt.verify(token, 'your_secret_key');
            if (decodedJwt.isAdmin) {
                req.user = decodedJwt;
                return proceed();
            } else {
                return res.forbidden({ error: 'Você não tem permissão para acessar este recurso.' });
            }
        } catch (err) {
            return res.forbidden({ error: 'Token inválido.' });
        }
    }
}
