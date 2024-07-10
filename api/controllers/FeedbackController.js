/**
 * FeedbackController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const jwt = require('jsonwebtoken');
module.exports = {
    create: async function(req, res) {
        const { message, manual_id } = req.body;

        // Validar dados recebidos
        if (!message || !manual_id) {
            return res.status(400).json({ error: "Mensagem e ID do manual são obrigatórios." });
        }

        const token = req.headers['authorization']; //Recebe o token na autorização passada no header
        //Valida se o token foi fornecido
        if (!token) {
            return res.badRequest({ error: 'Token não fornecido.' });
        }
        //Decodifica o token em JWT para resgatar as informações do usuário autentificado
        const user = jwt.verify(token.split(' ')[1], 'your_secret_key', function(err, decoded) {
            if (err) {
                return false;
            }
            return decoded;
        });
        //Valida se o usuário está autentificado
        if (!user) {
            return res.serverError({ error: "Usuário não autentificado." });
        }
        try {
            // Criar o feedback no banco de dados
            const feedback = await Feedback.create({
                message: message,
                manual: manual_id,
                user: user.id
            }).fetch();

            return res.status(201).json(feedback);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao criar o feedback." });
        }
    },

    // listando os feedbacks de acordo com o id do manual
    list: async function(req, res) {
        try {
            const manualId = req.param('manualId'); //Pega o parametro do id do manual da rota

            //Valida se existe o parametro
            if (!manualId) {
                return res.status(400).json({ error: 'Informar o manual é obrigatório' });
            }
            //Busca todos os feedbacks daquele manual
            const feedbacks = await Feedback.find({ manual: manualId }).populate('user');

            return res.json(feedbacks);
        } catch (err) {
            return res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
        }
    },
};