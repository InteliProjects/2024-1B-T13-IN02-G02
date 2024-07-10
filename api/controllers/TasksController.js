/**
 * TasksController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
    //Função para retornar a página de distribuição de tarefas
    index: async function(req, res) {
        try {
            const equipes = await Team.find(); //Buscar as equipes do banco
            const montadores = await User.find({ isAdmin: false }); //Buscar usuário com a permissão de montador
            const manuais = await Manual.find({ active: true }); //Buscar os manuais
            //Retornar a view passando os dados
            return res.view('pages/administrador/task-distribution', { equipes: equipes, montadores: montadores, manuais: manuais });
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para criação de tasks + notificações
    create: async function(req, res) {
        try {
            let { equipes, manualId, message } = req.body; //Recebe as informações do body
            let equipeIds = [];
            let usuarioIds = [];
            //Valida se as informações foram recebidas corretamente
            if (!equipes || !manualId || !message) {
                return res.badRequest({ error: 'Preencha todos os campos e selecione pelo menos um usuário.' });
            }
            //Busca o manual no banco
            const manual = await Manual.findOne({ id: manualId }).populate('model');
            //Valida se o manual existe no banco de dados
            if (!manual) {
                return res.notFound({ error: 'Manual não encontrado.' });
            }
            //Divide os valores recebidos do array de equipes dividindo em dis arrays um das equipes e um dos usuário
            equipes.forEach(id => {
                //Separa o id da equipe pelo prefixo E
                if (id.startsWith('E')) {
                    equipeIds.push(id.substring(1));
                } else if (id.startsWith('M')) { //Separa o id do montador pelo prefixo M
                    usuarioIds.push(id.substring(1));
                }
            });

            //Percorrer por todas as equipes
            let usuariosDasEquipes = [];
            for (let equipeId of equipeIds) {
                const usuarios = await User.find({ team: equipeId });
                //Adicionar os usuário dessa equipe no array de usuários
                usuariosDasEquipes = usuariosDasEquipes.concat(usuarios);
            }

            //Configurar o array evitando dados duplicados
            const usuarioIdsDasEquipes = usuariosDasEquipes.map(usuario => usuario.id);
            const todosUsuarios = [...new Set([...usuarioIdsDasEquipes, ...usuarioIds])];

            //Cria uma tarefa para cada usuário
            for (let userId of todosUsuarios) {
                const user = await User.findOne({ id: userId }); //Busca o usuário
                if (!user.isAdmin) { //Valida se o usuário não é administrador
                    const existingTask = await Task.findOne({ user: userId, manual: manualId }); //Busca se já existe essa tribuição para esse usuário
                    if (!existingTask) { //Caso não exista ela é criada
                        //Inseri a tarefa no banco de dados
                        await Task.create({
                            user: userId,
                            manual: manualId,
                            readed: false,
                        });
                        //Inseri a notificação dessa tarefa no banco de dados
                        await Notification.create({
                            message: message,
                            sender: 3,
                            receiver: userId,
                            action_url: `/manuals/${manual.id}`
                        });

                        //Gerar url da tarefa
                        const taskUrl = `${req.protocol}://${req.get('host')}/mounter/mounter-manual/${manualId}`;

                        //Chamada do helper par envio do e-mail
                        await sails.helpers.emailTask.with({
                            to: "dellesinteli@gmail.com",
                            subject: 'Atribuição de Manual',
                            template: 'task distribution',
                            context: {
                                taskUrl
                            },
                        });

                        //Conexão com o Websocket para envio da notificação em tempo real
                        if (sails.rooms['user_' + userId]) {
                            console.log("User exits")
                            if (sails.rooms['user_' + userId].size > 0) {
                                console.log("User connected and sending message")
                                sails.rooms['user_' + userId].forEach(socket => socket.send(JSON.stringify({ title: `${manual.model.name}: ${manual.name}`, type: 'new-task', 'date': new Date().toLocaleDateString(), action_url: `/mounter/mounter-manual/${manual.id}` })));
                            }
                        }
                    }
                }
            }
            return res.ok({ message: 'Tarefas e notificações criadas com sucesso.' });
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para validar se a tarefa pode ser marcado como finalizado
    checkFilesStatus: async function(req, res) {
        try {
            const taskId = parseInt(req.params.id); //Receber o id da tarefa
            if (!taskId) { //Validar se a informação foi recebida
                return res.badRequest({ error: 'ID da tarefa não informado.' });
            }
            //Buscar a tarefa no banco de dados
            const task = await Task.findOne({ id: taskId });
            if (!task) { //Validar se a tarefa existe
                return res.notFound({ error: 'Tarefa não encontrada.' });
            }
            //Procurar o manual desta tarefa
            const manual = await Manual.findOne({ id: task.manual });
            if (!manual) { //Validar se o manual existe
                return res.notFound({ error: 'Manual não encontrado.' });
            }

            //Contar os arquivos desse manual
            const files = await File.find({ manual: manual.id });
            const countFiles = await File.count({ manual: manual.id });

            //Contar quantos arquivos foram abertos pelo usuário
            var countDoneFiles = 0;
            for (file of files) {
                var fileDone = await DoneFile.findOne({ user: task.user, file: file.id })
                if (fileDone) {
                    countDoneFiles++
                }
            }

            //Validar se a quantidade de arquivos abertos pelo usuário é igual a quantidade de arquivos do manual
            if (countDoneFiles === countFiles) {
                return res.ok({ readyToDone: true, message: 'Todos os arquivos foram lidos.', success: true });
            } else {
                return res.ok({ readyToDone: false, message: 'Ainda faltam arquivos para serem lidos.', success: true });
            }
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Atualizar a tarefa para concluído
    markTaskAsReadIfReady: async function(req, res) {
        try {
            const taskId = parseInt(req.params.id); //Receber o id da tarefa da rota
            if (!taskId) { //Validar se o id foi reecebido
                return res.badRequest({ message: 'ID da tarefa não informado.' });
            }
            //Buscar a tarefa no banco de dados
            const task = await Task.findOne({ id: taskId });
            if (!task) { //Validar se a tarefa existe
                return res.notFound({ message: 'Tarefa não encontrada.' });
            }
            //Buscar o manual no banco de dados
            const manual = await Manual.findOne({ id: task.manual });
            if (!manual) { //Validar se o manual existe no banco de dados
                return res.notFound({ message: 'Manual não encontrado.' });
            }

            //Buscar os arquivos no banco de dados
            const files = await File.find({ manual: manual.id });
            //Contar os arquivos finalizados pelo usuário
            const countDoneFilesByUser = await DoneFile.getDatastore().sendNativeQuery(
                "SELECT COUNT(*) FROM donefile WHERE user_id = $1 AND file_id IN (SELECT id FROM file WHERE manual_id = $2)", [task.user, manual.id]
            );
            const countDoneFiles = parseInt(countDoneFilesByUser.rows[0].count);

            const readyToDone = countDoneFiles === files.length; //Validar se a quantidade de arquivos abertos pelo usuário é igual a quantidade de arquivos no manual
            if (readyToDone) {
                await Task.updateOne({ id: taskId }).set({ readed: true });
                return res.ok({ message: 'Tarefa concluída com sucesso.', done: true, success: true });
            } else {
                return res.ok({ message: 'Leia todos os arquivos para concluir.', done: false, success: false });
            }
        } catch (err) {
            return res.serverError(err);
        }
    },
    listTasksView: async function(req, res) {
        const task = await Task.findOne({ id: taskId }); //Buscar a tarefa
        if (!task) { //Validar se a tarefa existe no banco de dados
            return res.notFound({ message: 'Tarefa não encontrada.' });
        }
        //Buscar o manual no banco de dados
        const manual = await Manual.findOne({ id: task.manual });
        if (!manual) { //Validar se o manual existe
            return res.notFound({ message: 'Manual não encontrado.' });
        }

        const files = await File.find({ manual: manual.id });
        if (!files.length) {
            return res.notFound({ message: 'Arquivos não encontrados.' });
        }

        const countDoneFilesByUser = await DoneFile.getDatastore().sendNativeQuery(
            "SELECT COUNT(*) FROM donefile WHERE user_id = $1 AND file_id IN (SELECT id FROM file WHERE manual_id = $2)", [task.user, manual.id]
        );

        const countDoneFiles = parseInt(countDoneFilesByUser.rows[0].count);
        const readyToDone = countDoneFiles === files.length;

        if (readyToDone && attemptToMarkAsDone) {
            await task.updateOne({ id: taskId }).set({ readed: true });
            return res.ok({ message: 'Tarefa marcada como lida com sucesso.', success: true });
        } else {
            return res.ok({ message: 'Tarefa ainda não está pronta para ser marcada como lida.', success: false });
        }
    },
    //Função para listar as tarefas do montador
    listTasksByUser: async function(req, res) {
        try {
            const userId = req.user.id;
            //Buscar tarefas do usuário
            const tasks = await Task.find({
                where: { user: userId },
                select: ['manual', 'readed']
            }).populate('manual');
            if (!tasks.length) { //Validar se existe tarefas atribuidas a esse usuário
                return res.notFound({ error: 'Nenhuma tarefa encontrada para este usuário.' });
            }
            //Buscar manual da tarefa
            const manuals = await Promise.all(tasks.map(async task => {
                const model = await Model.findOne({ id: task.manual.model }); //Buscar o modelo desse manual
                return {
                    ...task.manual,
                    readed: task.readed,
                    model: model.name
                };
            }));

            return res.ok(manuals);
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para buscar os dados do grafico 1
    dashboardDataGraph01: async function(req, res) {
        try {
            const teamId = req.param('id'); //Pegar o parametro do id do time
            if (!teamId) { //Validar se esse parametro existe
                return res.badRequest({ error: 'Team ID is required' });
            }
            //Buscar o time no banco de dados
            const team = await Team.findOne({ id: teamId }).populate('users');
            if (!team) { //Validar se o time existe no banco de dados
                return res.notFound({ error: 'Team not found' });
            }

            const dataDashboard = [];
            for (let i = 0; i < team.users.length; i++) {
                const userTasks = await Task.find({
                    where: { user: team.users[i].id },
                })
                const userDoneTasks = await Task.find({
                    where: {
                        user: team.users[i].id,
                        readed: true,
                    },
                })
                const data = Math.floor((userDoneTasks.length / userTasks.length) * 100);
                dataDashboard.push(`M.${i+1} ` + team.users[i].name)
                dataDashboard.push(data);
            }
            return res.ok(dataDashboard);
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para buscar os dados do grafico 2
    dashBoardDataGraph02: async function(req, res) {
        try {
            const teamId = req.param('id'); //Pegar o parametro do id do time
            if (!teamId) { //Validar se esse parametro existe
                return res.badRequest({ error: 'Team ID is required' });
            }
            //Busca o time no banco de dados
            const team = await Team.findOne({ id: teamId }).populate('users');
            if (!team) { //Valida se o time existe
                return res.notFound({ error: 'Team not found' });
            }

            const dataDashboard = [];
            for (let i = 0; i < team.users.length; i++) {
                const userFalseTasks = await Task.find({
                    where: {
                        user: team.users[i].id,
                        readed: false,
                    },
                })
                const data = userFalseTasks.length;
                dataDashboard.push(data);
            }

            return res.ok(dataDashboard);
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para buscar os dados do grafico 3
    dashBoardDataGraph03: async function(req, res) {
        try {
            const teamId = req.param('id'); //Pegar o parametro do id do time
            if (!teamId) { //Validar se esse parametro existe
                return res.badRequest({ error: 'Team ID is required' });
            }
            //Busca o time no banco de dados
            const team = await Team.findOne({ id: teamId }).populate('users');
            if (!team) { //Valida se o time existe
                return res.notFound({ error: 'Team not found' });
            }

            let allTasks = 0;
            let doneTasks = 0;
            const dataDashboard = [];

            for (let i = 0; i < team.users.length; i++) {
                const userTasks = await Task.find({
                    where: { user: team.users[i].id },
                })
                const userDoneTasks = await Task.find({
                    where: {
                        user: team.users[i].id,
                        readed: true,
                    },
                })
                allTasks += userTasks.length;
                doneTasks += userDoneTasks.length;
            }

            const done = Math.floor((doneTasks / allTasks) * 100);
            const notDone = 100 - done;
            dataDashboard.push(done, notDone);

            return res.ok(dataDashboard);

        } catch (err) {
            return res.serverError(err);
        }
    },
    findTaskByManualId: async function(req, res) {
        try {
            const manualId = req.param('manualId');

            if (!manualId) {
                return res.badRequest({ error: 'Manual Id is required' });
            }

            const tasks = await Task.find({
                where: {
                    manual: manualId,
                },
            });

            if (!tasks || tasks.length === 0) {
                return res.badRequest({ error: 'No tasks found for this manual' });
            }

            const userIds = tasks.map(task => `M${task.user}`);

            return res.ok({ userIds });
        } catch (error) {
            sails.log.error('Erro ao buscar tasks:', error.message);
            return res.serverError({ error: error.message });
        }
    },
};