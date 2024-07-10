/**
 * TeamsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //Função para retornar a página de cadastro da linha de montagem
    index: async function(req, res) {
        try {
            const montadores = await User.find({ isAdmin: false }); //Buscar usuários que possuem a permissão de montador
            const engenheiros = await User.find({ isAdmin: true }); //Buscar usuários que possuem a permissão de engenheiro
            //Retornar a view passando os dados
            return res.view('pages/administrador/team', { montadores: montadores, engenheiros: engenheiros });
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para inserir uma linha de montagem no banco de dados
    create: async function(req, res) {
        try {
            const { name, description, montadores, gestor } = req.body; //Receber informações do body
            //Validar se há as informações
            if (!name || !description || !montadores || !gestor) {
                return res.badRequest({ error: 'Preencha todos os campos.' });
            }

            const team = await Team.create({ //Inserir o time no banco
                name: name,
                description: description,
            }).fetch();
            //Atualizar a linha de montagem dos montadores desta nova linha de montagem
            const montadoresArray = montadores.split(',').map(Number);
            for (let i = 0; i < montadoresArray.length; i++) {
                await User.update({ id: montadoresArray[i] }).set({ team: team.id });
            }
            //Atualizar a linha de montagem do gestor
            await User.update({ id: gestor }).set({ team: team.id })

            return res.ok({ message: 'Equipe criada com sucesso.' });
        } catch (err) {
            return res.serverError(err);
        }
    },

    // lista de equipes
    listTeams: async function(req, res) {
        try {
            const teams = await Team.find();
            return res.ok(teams);
        } catch (err) {
            return res.serverError(err);
        }
    },

    // para listar os usuários de cada equipe
    listTeamUsers: async function(req, res) {
        try {
            const teams = await Team.find().populate('users');
            return res.ok(teams);
        } catch (err) {
            return res.serverError(err);
        }
    },

};