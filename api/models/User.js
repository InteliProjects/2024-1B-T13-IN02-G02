/**
 * User.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
module.exports = {
    attributes: {
        isAdmin: { //Permissão do usuário engenheiro/montador
            type: 'boolean',
            columnName: 'isAdmin'
        },
        name: { //Nome do usuário
            type: 'string',
            required: true,
            columnName: 'name'
        },
        email: { //e-mail do usuário
            type: 'string',
            required: true,
            unique: true,
            columnName: 'email'
        },
        password: { //Senha do usuário
            type: 'string',
            required: true,
            columnName: 'password'
        },
        profile_photo: { //Foto de perfil
            type: 'string',
            allowNull: true,
            columnName: 'profile_photo',
        },
        team: { //id do time
            model: 'team',
            columnName: 'team_id'
        },
        // Associações
        manuals: { //manuais
            collection: 'manual',
            via: 'publisher'
        },
        tasks: { //tarefas
            collection: 'task',
            via: 'user'
        },
        favorites: { //favoritos
            collection: 'favorite',
            via: 'user'
        },
        doneFiles: { //arquivos finalizados
            collection: 'doneFile',
            via: 'user'
        },
        feedbacks: { //feedbacks
            collection: 'feedback',
            via: 'user'
        },
        notificationsSent: { //envio de notificações
            collection: 'notification',
            via: 'sender'
        },
        notificationsReceived: { //recebimento de notificações
            collection: 'notification',
            via: 'receiver'
        }

    }
};