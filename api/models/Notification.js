/**
 * Notification.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
module.exports = {
    attributes: {
        message: { //Mensagem da notificação
            type: 'string',
            required: true,
            columnName: 'message'
        },
        actionUrl: { //url
            type: 'string',
            columnName: 'action_url'
        },
        sender: { //id do usuário que enviou a notificação
            model: 'user',
            columnName: 'sender_id'
        },
        receiver: { //id do usuário que recebeu a notificação
            model: 'user',
            columnName: 'receiver_id'
        },
        read: { //status da notificação lida/não lida
            type: 'boolean',
            defaultsTo: false,
        }
    }
};