/**
 * Task.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        readed: { //Status da tarefa pendente/concluida
            type: 'boolean',
            defaultsTo: false,
            columnName: 'readed'
        },
        user: { //id do usuário
            model: 'user',
            columnName: 'user_id'
        },
        manual: { //id do manual
            model: 'manual',
            columnName: 'manual_id'
        }
    }
};