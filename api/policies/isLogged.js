const jwt = require('jsonwebtoken');

module.exports = async function(req, res, proceed) {
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(" ")[1];
        try {
            const decodedJwt = jwt.verify(
                token.split(" ")[1],
                "your_secret_key",
                function(err, decoded) {
                    if (err) {
                        return false;
                    }
                    return decoded;
                }
            );
            req.user = decodedJwt;
            return proceed();
        } catch (err) {
            return res.forbidden().json({ error: 'Token inválido.' });
        }
    } else {
        return res.forbidden('Token não fornecido.');
    }
};
