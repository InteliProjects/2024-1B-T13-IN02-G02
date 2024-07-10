module.exports = {
    attributes: {
        token: { //token
            type: 'string',
            required: true,
            unique: true,
        },
        user: { //id do usuário
            model: 'user',
            required: true,
        },
        expiresAt: { //data de expiração
            type: 'string',
            required: true,
        },
    },
};