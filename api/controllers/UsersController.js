/**
 * UsersController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const moment = require('moment');
const { permission } = require('process');

module.exports = {
    //Função para retornar a view de registro
    registerIndex: async function(req, res) {
        try {
            const lines = await Team.find(); //Buscar as linhas se montagem
            return res.view('pages/register', { lines: lines, token: req.headers['authorization'] });
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para criar novo user
    create: async function(req, res) {
        try {
            const { name, email, password, permission, team, profile_photo } = req.body; //Receber as informações do body
            //Validar se há as informações necessárias para o cadastro
            if (!name || !email || !password || !team) {
                return res.badRequest({ error: 'Todos os campos são obrigatórios.' });
            }
            //Caso a permissão seja de engenheiro deve validar se já não existe um engenheiro atribuido a esta linha de montagem
            if (permission && permission == 1) {
                const userTeam = await User.findOne({ isAdmin: true, team: team }); //Busca se já existe o admin dessa linha de montagem
                if (userTeam) {
                    return res.badRequest({ error: 'Já existe um engenheiro para atribuido a esta linha de montagem.' });
                }
            }
            //Upload da foto de perfil
            const url = await sails.helpers.uploadPhoto(req, "profile_photo");

            //Cadastrar o novo usuário no banco de dados
            if (permission) {
                const user = await User.create({
                    name: name,
                    email: email,
                    password: password,
                    isAdmin: permission,
                    team: team,
                    profile_photo: url
                }).fetch();
            } else {
                const user = await User.create({
                    name: name,
                    email: email,
                    password: password,
                    isAdmin: 0,
                    team: team,
                    profile_photo: url
                }).fetch();
            }

            return res.ok();
        } catch (err) {
            return res.serverError(err);
        }
    },

    //Função para buscar todos os usuários
    list: async function(req, res) {
        try {
            const users = await User.find(); //Buscar todos os usuários no banco de dados
            return res.ok(users);
        } catch (err) {
            return res.serverError(err);
        }
    },

    //Função para buscar todos os montadores
    listMontadores: async function(req, res) {
        try {
            const montadores = await User.find({ isAdmin: false }); //Buscar os usuário que possuem a permissão de montador
            return res.ok(montadores);
        } catch (err) {
            return res.serverError(err);
        }
    },

    //Função para realizar o login
    login: async function(req, res) {
        try {
            const { email, password } = req.body; //Receber as informações do body
            //Validar se as informações foram recebidas
            if (!email || !password) {
                return res.badRequest({ error: 'Preencha todos os campos.' });
            }
            //Buscar se existe um usuário com este e-mail
            const user = await User.findOne({ email: email });
            if (!user) {
                return res.badRequest({ error: 'Email não encontrado.' });
            }
            //Validar se a senha do usuário encontrado é igual a senha recebida
            if (user.password !== password) {
                return res.badRequest({ error: 'Email ou senha incorretos.' });
            }

            // Gerar o token JWT codificando as informações do usuário
            var token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, 'your_secret_key', {
                expiresIn: 86400 // expires in 24 hours
            });

            // Retornar as informações
            return res.ok({
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin
                },
                token: 'Bearer ' + token
            });
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para validar a permissão do montador
    verifyToken: async function(req, res) {
        try {
            const token = req.headers['authorization']; //Recebe o token na autorização passada no header
            //Valida se o token foi fornecido
            if (!token) {
                return res.badRequest({ error: 'Token não fornecido.' });
            }
            jwt.verify(token.split(' ')[1], 'your_secret_key', function(err, decoded) {
                if (err) {
                    return res.badRequest({ error: 'Falha ao autenticar o token.' });
                }
                //Verificar se o usuário é engenheiro
                if (decoded.isAdmin) {
                    return res.badRequest({ error: 'Acesso negado.' });
                }
                return res.ok({ id: decoded.id });
            });
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Verificar a permissão do usuário
    verifyPermission: async function(req, res) {
        try {
            const token = req.headers['authorization']; //Buscar o token no header
            //Valida se o token foi fornecido
            if (!token) {
                return res.badRequest({ error: 'Token não fornecido.' });
            }
            jwt.verify(token.split(' ')[1], 'your_secret_key', function(err, decoded) {
                if (err) {
                    return res.badRequest({ error: 'Falha ao autenticar o token.' });
                }
                //Validar se o usuário é engenheiro ou montador
                if (decoded.isAdmin) {
                    return res.ok({ admin: true });
                } else {
                    return res.ok({ admin: false });
                }
            });
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para verificar a permissão para o engenheiro
    verifyTokenEngineer: async function(req, res) {
        try {
            const token = req.headers['authorization']; //Buscar o token no header
            //Validar se existe token
            if (!token) {
                return res.badRequest({ error: 'Token não fornecido.' });
            }
            jwt.verify(token.split(' ')[1], 'your_secret_key', function(err, decoded) {
                if (err) {
                    return res.badRequest({ error: 'Falha ao autenticar o token.' });
                }
                if (!decoded.isAdmin) {
                    return res.badRequest({ error: 'Acesso negado.' });
                }
                return res.ok({ id: decoded.id });
            });
        } catch (err) {
            return res.serverError(err);
        }
    },
    //Função para listar os engenheiros
    listAdmins: async function(req, res) {
        try {
            const admins = await User.find({ isAdmin: true }); //Buscar todos os usuários com permissã de engenheiro
            return res.json(admins);
        } catch (error) {
            return res.serverError(error);
        }
    },

    //Função para alterar a senha
    changePassword: async function(req, res) {
        try {
            const { email } = req.body; //Receber o e-mail do body
            if (!email) { //Validr se o e-mail foi recebido
                return res.badRequest({ error: 'O campo E-mail é obrigatório.' });
            }

            //Buscar se existe um usário com este e-mail
            user = await User.findOne({ email: email });
            if (!user) {
                return res.badRequest({ error: 'E-mail não encontrado.' });
            }

            //Gerar um token para validar o reset de senha
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = moment().add(1, 'hour').toISOString();

            //Salvar o token no banco de dados com as informações do usuário
            await PasswordResetToken.create({
                token,
                user: user.id,
                expiresAt,
            });

            //Gerar o link para resetar a senha
            const resetLink = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
            //Chamada no helper para envio do e-mail para resetar a senha
            await sails.helpers.sendResetEmail.with({
                to: "dellesinteli@gmail.com",
                subject: 'Redefinição de senha',
                template: 'email-reset-password',
                context: {
                    resetLink,
                },
            });

            return res.ok();
        } catch (error) {
            return res.serverError(error);
        }
    },
    //Função para renderizar a página de resetar a senha
    renderResetPassword: async function(req, res) {
        const { token } = req.query; //Pegar o token
        //Validar se o token existe
        if (!token) {
            return res.badRequest({ error: 'Token é obrigatório' });
        }
        //Validar o token
        const passwordResetToken = await PasswordResetToken.findOne({ token });
        if (!passwordResetToken || moment().isAfter(passwordResetToken.expiresAt)) {
            return res.badRequest({ error: 'Token inválido ou expirado' });
        }
        //Retornar a view depois de validar o token
        return res.view('pages/reset-password', { token });
    },

    //Função para resetar a senha
    resetPassword: async function(req, res) {
        try {
            const { token, newPassword } = req.body; //Receber as informações do body
            //Validar se as informações foram recebidas
            if (!token || !newPassword) {
                return res.badRequest({ error: 'Token e nova senha são obrigatórios' });
            }

            //Validar se o token existe
            const passwordResetToken = await PasswordResetToken.findOne({ token: token });
            if (!passwordResetToken || moment().isAfter(passwordResetToken.expiresAt)) {
                return res.badRequest({ error: 'Token inválido ou expirado' });
            }

            //Buscar o usuário do token
            const user = await User.findOne({ id: passwordResetToken.user });
            if (!user) { //Validar se o usuário existe
                return res.notFound({ error: 'Usuário não encontrado' });
            }

            //Atualizar a senha do usuário
            await User.updateOne({ id: user.id }).set({
                password: newPassword,
            });

            //Deletar o token do banco
            await PasswordResetToken.destroy({ id: passwordResetToken.id });

            return res.ok({ message: 'Senha redefinida com sucesso' });
        } catch (error) {
            console.log(error);
            return res.badRequest({ error: error });
        }
    },
    //Função para regsatar as informações do usuário
    profile: async function(req, res) {
        try {
            const token = req.headers['authorization']; //Pegar o token do header
            //Validar se existe o token
            if (!token) {
                return res.status(401).json({ error: 'Token não fornecido.' });
            }

            const decoded = jwt.verify(token.split(' ')[1], 'your_secret_key');
            const userId = decoded.id;
            const user = await User.findOne({ id: userId }).populate('team');

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            return res.json(user); // Retorne os dados do usuário como JSON
        } catch (err) {
            return res.status(500).json({ error: 'Erro no servidor' });
        }
    },
    //Retornar informações do usuário e do time
    listById: async function(req, res) {
        try {
            const userId = req.param('id'); //Receber o id do usuário
            const user = await User.findOne({ id: userId }).populate('team'); //Buscar o usuário e o relacionamento com o seu time
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }
            return res.status(200).json(user);
        } catch (error) {

            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: 'Token inválido.' });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expirado.' });
            }

            return res.status(500).json({ error: 'Erro no servidor' });
        }
    },
    //Atualizar o time dos usuários
    updateTeamById: async function(req, res) {
        try {
            const { userId, newTeam } = req.body;
            if (!userId || !newTeam) {
                return res.status(401).json({ error: 'É necessário um novo time e o ID do usuário que deseja atualizar de linha de montagem.' });
            }
            const token = req.headers['authorization']; //Receber o token do header
            if (!token) { //Validar se o token existe
                return res.status(401).json({ error: 'Token não fornecido.' });
            }
            const decoded = jwt.verify(token.split(' ')[1], 'your_secret_key');
            if (decoded.isAdmin) {
                const { userId, newTeam } = req.body;
                if (!userId || !newTeam) {
                    return res.status(401).json({ error: 'É necessário um novo time e o ID do usuário que deseja atualizar de linha de montagem.' });
                }
                await User.updateOne({ id: userId }).set({
                    team: newTeam,
                });
                return res.ok({ message: 'Equipe atualizada com sucesso' });
            } else {
                return res.status(401).json({ error: 'Somentes admins podem realizar essa ação.' });
            }
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: 'Token inválido.' });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Token expirado.' });
            }
            return res.status(500).json({ error: 'Erro no servidor' });
        }
    },
    listMountersAndTeams: async function(req, res) {
        try {
            const teams = await Team.find();
            const mounters = await User.find({ where: { isAdmin: false }, select: ['name', 'id', 'email', 'team', 'profile_photo'] });
            return res.ok({ mounters, teams });
        } catch (err) {
            return res.serverError(err);
        }
    },
};