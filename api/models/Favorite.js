/**
 * Favorite.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        manual: { //id do manual
            model: 'manual',
            columnName: 'manual_id'
        },
        user: { //id do usuário
            model: 'user',
            columnName: 'user_id'
        }
    }
};