/**
 * ManualsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

//Configuração dos filtros de busca
const sortFilterMap = {
    "ASC": "ASC",
    "DESC": "DESC",
}

const jwt = require('jsonwebtoken');
module.exports = {
    //Função para retornar a view para cadastro do manual
    index: async function(req, res) {
        try {
            //Buscar todos os modelos
            const models = await Model.find();
            //Retornar a view passando todos os modelos
            return res.view("pages/administrador/manual-registration", {
                models: models,
            });
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para criar um novo manual
    create: async function(req, res) {
        try {
            const { name, description, active, version, model_id, files } = req.body; //Receber os dados

            //Validação dos dados recebidos
            if (!name) {
                return res.badRequest({ error: "O nome é obrigatório." });
            }
            if (!description) {
                return res.badRequest({ error: "A descrição é obrigatória." });
            }
            if (active === undefined) {
                return res.badRequest({ error: "Este campo é obrigatório." });
            }
            if (!version) {
                return res.badRequest({ error: "A versão do manual é obrigatória." });
            }
            if (isNaN(version)) {
                return res.badRequest({ error: "A versão do manual deve ser um número." });
            }
            if (!model_id) {
                return res.badRequest({ error: "O modelo é obrigatório." });
            }
            const model = await Model.findOne({ id: model_id });
            if (!model) {
                return res.badRequest({ error: "O modelo digitado não existe." });
            }

            const token = req.headers['authorization']; //Recebe o token na autorização passada no header
            //Valida se o token foi fornecido
            if (!token) {
                return res.badRequest({ error: 'Token não fornecido.' });
            }
            //Decodifica o token em JWT para resgatar as informações do usuário autentificado
            const user = jwt.verify(token.split(' ')[1], 'your_secret_key', function(err, decoded) {
                if (err) {
                    return false;
                }
                return decoded;
            });
            //Valida se o usuário está autentificado
            if (!user) {
                return res.serverError({ error: "Usuário não autentificado." });
            }
            //Inserir o novo manual no banco de dados
            const newManual = await Manual.create({
                name: name,
                description: description,
                active: active,
                version: version,
                publisher: user.id,
                model: model_id,
            }).fetch();
            req.body.manualId = newManual.id; //Adicionar o id do manual no body para receber no helper para upload dos arquivos
            const url = await sails.helpers.upload(req, "files"); //Chamada do helper para upload dos arquivos
            return res.ok({ manualId: newManual.id });
        } catch (error) {
            return res.serverError({ error: error.message });
        }
    },
    // buscar todos os manuais
    list: async function(req, res) {
        try {
            //Buscar todos os manuais no banco
            const manual = await Manual.find();
            return res.ok(manual);
        } catch (err) {
            return res.serverError(err);
        }
    },
    // desativar ou ativas manuais
    setActive: async function(req, res) {
        try {
            const manualId = req.param("manualId"); //Pegar o id do manual na rota

            // Encontrar o manual pelo ID
            const manual = await Manual.findOne({ id: manualId });
            //Validar se o manual foi encontrado
            if (!manual) {
                return res.status(404).json({ error: "Manual não encontrado" });
            }

            // Alternar o estado do atributo 'active'
            const updatedManual = await Manual.updateOne({ id: manualId }).set({
                active: !manual.active,
            });

            if (!updatedManual) {
                return res.status(500).json({ error: "Erro ao atualizar o manual" });
            }

            // Retornar o manual atualizado como resposta
            return res.json(updatedManual);
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para atualizar um manual
    updateManual: async function(req, res) {
        try {
            const manualId = req.param("manualId"); //Pegar o id do manual na rota
            const { name, version, active, description, files } = req.body; //Receber os dados para atualização

            const manual = await Manual.findOne({ id: manualId }); //Busca se o manual
            //Valida se o manual existe
            if (!manual) {
                return res.status(404).json({ error: "Manual não encontrado" });
            }
            //Atualiza as informações do manual encontrado
            const updatedManual = await Manual.updateOne({ id: manualId }).set({
                name: name,
                version: version,
                active: active,
                description: description,
            });

            req.body.manualId = manualId; //Adicionar o id do manual no body para receber no helper para upload dos arquivos
            const url = await sails.helpers.upload(req, "files"); //Chamada do helper para upload dos arquivos

            //Envio de E-mail ao atulizar o manual
            //Gerar url do manual atualizado
            const manualUpdate = `${req.protocol}://${req.get('host')}/mounter/mounter-manual/${manualId}`;

            //Chamada do helper par envio do e-mail
            await sails.helpers.emailManual.with({
                to: "dellesinteli@gmail.com",
                subject: 'Atualização de Manual',
                template: 'manual update',
                context: {
                    manualUpdate,
                    name: updatedManual.name
                },
            });
            return res.json({
                updatedManual,
                files: url.length ? url : manual.files,
            });
        } catch (error) {
            return res.serverError({ error: error.message });
        }
    },
    //Função para resgatar as informações do manual
    findOneWithFiles: async function(req, res) {
        try {
            const manualId = parseInt(req.param('id')); //Pega o id do manual na rota
            //Valida se essa informação existe
            if (!manualId) {
                return res.badRequest({ error: 'ID do manual não informado.' });
            }
            //Valida se o manual recebido na rota realmente existe
            const manual = await Manual.findOne({ id: manualId }).populate('files');
            if (!manual) {
                return res.notFound({ error: 'Manual não encontrado.' });
            }

            const token = req.headers['authorization']; //Recebe o token na autorização passada no header
            //Valida se o token foi fornecido
            if (!token) {
                return res.badRequest({ error: 'Token não fornecido.' });
            }
            //Decodifica o token em JWT para resgatar as informações do usuário autentificado
            const user = jwt.verify(token.split(' ')[1], 'your_secret_key', function(err, decoded) {
                if (err) {
                    return false;
                }
                return decoded;
            });
            //Valida se o usuário está autentificado
            if (!user) {
                return res.serverError({ error: "Usuário não autentificado." });
            }
            //Verifica a permissão do usuário
            if (user.isAdmin) {
                manual.admin = true;
            } else {
                manual.admin = false;
            }

            //Verificar se foi atribuido uma tarefa para esse usuário
            const assign = await Task.findOne({ user: user.id, manual: manual.id });
            if (assign && !user.isAdmin) {
                manual.task = assign.id;
                manual.assign = true;
                manual.doneTask = assign.readed;
            } else {
                manual.task = false;
                manual.assign = false;
                manual.doneTask = true;
            }

            //Possibilidade de ser feita
            const files = await File.find({ manual: manual.id });
            const countFiles = await File.count({ manual: manual.id }); //Contar a quantidade de arquivos do manual
            var countDoneFiles = 0;
            //Contar a quantidade de arquivos abertos pelo usuário neste manual
            for (file of files) {
                var fileDone = await DoneFile.findOne({ user: user.id, file: file.id })
                if (fileDone) {
                    countDoneFiles++
                }
            }
            //Verifica se os arquivos abertos pelo usuário é igual a quantidade de arquivos deste manual
            if (countDoneFiles === countFiles) {
                manual.readyToDone = true;
            } else {
                manual.readyToDone = false;
            }

            if (files.length == 0) {
                manual.readyToDone = true;
            }

            //Busca se o manual foi marcado como favorito pelo usuário
            const favorite = await Favorite.findOne({ manual: manual.id, user: user.id })
            if (favorite) {
                manual.favorite = true;
            } else {
                manual.favorite = false;
            }

            return res.ok({ success: true, data: manual });
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para retornar os manuais nas páginas de pesquisa
    listManuals: async function(req, res) {
        const { skip, search, sort, category } = req.query; //Receber os parametros para filtro
        const skipParsed = Number(skip) || 0;
        const sortSql = sort ? `ORDER BY ma."createdAt" ${sortFilterMap[sort] || 'ASC'}` : '';
        const datastore = sails.getDatastore();

        try {
            const params = [`%${search}%`, `%${search}%`];
            let categorySql = '';

            if (category) {
                const categories = category.split(',').map(cat => cat.trim());
                const categoryPlaceholders = categories.map((cat, index) => `$${params.length + index + 1}`);
                categorySql = `AND mo.type IN (${categoryPlaceholders.join(',')})`;
                categories.forEach(cat => params.push(cat));
            }

            //Gerar a query para busca
            const query = `
              SELECT ma.*, mo.name as model_name, mo.type as model_type FROM manual ma
              INNER JOIN model mo ON mo.id = ma.model_id
              WHERE (ma.name ILIKE $1 OR mo.name ILIKE $2)
              ${categorySql} ${sortSql}
              LIMIT 10 OFFSET $${params.length + 1};
          `;

            params.push(skipParsed);
            const manual = await datastore.sendNativeQuery(query, params);
            return res.ok(manual.rows); // Retornar os manuais filtrados para a página de busca
        } catch (err) {
            return res.serverError(err);
        }
    },
};