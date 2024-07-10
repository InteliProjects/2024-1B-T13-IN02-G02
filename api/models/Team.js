/**
 * Team.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        name: { //Nome da linha de montagem
            type: 'string',
            required: true,
            columnName: 'name'
        },
        description: { //Descrição da linha de montagem
            type: 'string',
            columnName: 'description'
        },
        // Associações
        users: { //usuários
            collection: 'user',
            via: 'team'
        }
    },

};