/**
 * NotificationsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const jwt = require("jsonwebtoken");

module.exports = {
    //Função para visualizar uma notificação
    markAsRead: async function(req, res) {
        try {
            const notificationId = req.params.id; // Pegando o ID da notificação a partir dos parâmetros da URL
            if (!notificationId) {
                return res.badRequest({ error: "ID da notificação não fornecido." });
            }
            //Busca a notificação
            const notification = await Notification.findOne({ id: notificationId });
            if (!notification) { //Valida se a notificação existe
                return res.notFound({ error: "Notificação não encontrada." });
            }
            //Atualiza o valor de lido da notificação para true
            await Notification.update({ id: notificationId }).set({ read: true });
            return res.ok({ message: "Notificação marcada como lida." });
        } catch (err) {
            return res.serverError(err);
        }
    },

    //Função para marcar todas as notificações como lidas
    markAllAsRead: async function(req, res) {
        try {
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
            //Atualizar a notificação
            await Notification.update({ receiver: user.id, read: false }).set({
                read: true,
            });
            return res.ok({ message: "Todas as notificações marcadas como lidas." });
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para criar uma notificação de suporte para o engenheiro
    createSupportNotification: async function(req, res) {
        try {
            const { message, actionUrl, senderId, receiverId } = req.body; //Receber informações do body
            if (!message || !senderId || !receiverId) { //Validar informações
                return res.badRequest({
                    error: "Mensagem, ID do remetente e ID do destinatário são obrigatórios.",
                });
            }
            //Criar uma nova notificação para o engenheiro selecionado na view
            const newNotification = await Notification.create({
                message,
                actionUrl: actionUrl || "",
                sender: senderId,
                receiver: receiverId,
                read: false,
            }).fetch();
            return res.status(201).json(newNotification);
        } catch (error) {
            return res.status(500).json({ error: "Falha ao criar notificação" });
        }
    },
    //Função para listar as notificações do usuário
    listNotificationByUserId: async function(req, res) {
        try {
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

            // Obter parâmetros de paginação do corpo da requisição
            const page = req.body.page ? parseInt(req.body.page) : 1;
            const limit = 7;
            const skip = (page - 1) * limit;

            // Consulta ao banco de dados com limite e paginação
            const notifications = await Notification.find({
                where: {
                    receiver: user.id,
                },
                limit: limit,
                skip: skip,
                sort: "createdAt DESC", // Ordena as notificações pela data de criação em ordem decrescente
            });

            return res.ok(notifications);
        } catch (error) {
            return res.serverError(error);
        }
    },
};