/**
 * File.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        title: { //Título do arquivo
            type: 'string',
            required: true,
            maxLength: 50,
            columnName: 'title'
        },
        type: { //Extensão do arquivo
            type: 'string',
            columnName: 'type'
        },
        path: { //url da imagem
            type: 'string',
            required: true,
            columnName: 'path'
        },
        manual: { //id do manual
            model: 'manual',
            columnName: 'manual_id'
        }
    }
};