/**
 * Model.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        name: { //Nome do modelo
            type: 'string',
            required: true,
            columnName: 'name'
        },
        type: { //Categoria do modelo (Computador, Servidor, Storage)
            type: 'string',
            required: true,
            columnName: 'type'
        },
        // Associações
        manuals: { //manuais
            collection: 'manual',
            via: 'model'
        }
    }
};