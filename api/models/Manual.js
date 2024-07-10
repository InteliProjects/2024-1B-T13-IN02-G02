/**
 * Manual.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        name: { //Nome do manual
            type: 'string',
            required: true,
            maxLength: 75,
            columnName: 'name'
        },
        description: { //Descrição do manual
            type: 'string',
            required: true,
            columnName: 'description'
        },
        active: { //Status do manual Ativo/Desativado
            type: 'boolean',
            defaultsTo: true,
            columnName: 'active'
        },
        version: { //Versão do manual
            type: 'number',
            defaultsTo: 1,
            columnName: 'version'
        },
        publisher: { //id do usuário que publicou o usuário
            model: 'user',
            columnName: 'publisher_id'
        },
        model: { //id do modelo
            model: 'model',
            columnName: 'model_id'
        },
        // Associações
        tasks: { //tarefas
            collection: 'task',
            via: 'manual'
        },
        files: { //arquivos
            collection: 'file',
            via: 'manual'
        },
        favorites: { //favoritos
            collection: 'favorite',
            via: 'manual'
        },
        feedbacks: { //feedbacks
            collection: 'feedback',
            via: 'manual'
        }
    }
};