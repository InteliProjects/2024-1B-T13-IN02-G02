/**
 * ModelsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    // criar novo manual
    create: async function(req, res) {
        try {
            const { name, type } = req.body; //Recebe as informações
            //Valida se as informações foram recebidas
            if (!name) {
                return res.badRequest({ error: 'O nome é obrigatório.' });
            }
            if (!type) {
                return res.badRequest({ error: 'A categoria é obrigatória.' });
            }
            //Inseri um novo modelo no banco de dados
            const newModel = await Model.create({
                name: name,
                type: type,
            }).fetch();
            return res.ok();
        } catch (error) {
            return res.serverError({ error: error.message });
        }
    },
    //Função para resgatar as informações de um modelo específico
    listOneModel: async function(req, res) {
        try {
            const modelId = req.param('modelId'); //Pega o id do modelo no rota
            //Valida se há essa informação
            if (!modelId) {
                return res.badRequest({ error: 'Model ID is required' });
            }
            //Busca o modelo no banco
            const model = await Model.findOne({ id: modelId });
            //Valida de o modelo existe
            if (!model) {
                return res.notFound({ error: 'Model not found' });
            }
            return res.json(model); //Retorna o modelo
        } catch (error) {
            return res.serverError({ error: error.message });
        }
    },

};