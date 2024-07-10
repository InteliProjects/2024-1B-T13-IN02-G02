/**
 * ReadedFile.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        user: { //id do usuário
            model: 'user',
            columnName: 'user_id'
        },
        file: { //id do arquivo
            model: 'file',
            columnName: 'file_id'
        }
    }
};