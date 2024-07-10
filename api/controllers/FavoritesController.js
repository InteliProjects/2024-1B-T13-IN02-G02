/**
 * FavoritesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
// api/controllers/FavoriteController.js
const jwt = require('jsonwebtoken');
module.exports = {
    //Função para adicionar um manual aos favoritos
    addFavorite: async function(req, res) {
        try {
            const { manualId } = req.body; //Recebe o id do manual
            //Valida se há essa informação
            if (!manualId) {
                return res.status(400).json({ error: "ID do manual é necessário." });
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

            // Verifica se o manual existe
            const manual = await Manual.findOne({ id: manualId });
            if (!manual) {
                return res.status(404).json({ error: "Manual não encontrado." });
            }

            // Verifica se já está nos favoritos
            const existingFavorite = await Favorite.findOne({
                user: user.id,
                manual: manualId,
            });
            if (existingFavorite) {
                return res.status(409).json({ error: "Manual já está nos favoritos." });
            }

            // Adiciona aos favoritos
            const newFavorite = await Favorite.create({
                user: user.id,
                manual: manualId,
            }).fetch();

            return res.status(200).json(newFavorite);
        } catch (error) {
            return res
                .status(500)
                .json({ error: error.message });
        }
    },
    //Função para listar os Favoritos
    listFavorites: async function(req, res) {
        try {
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
            //Procura se algum manual foi marcado como favorito pelo usuário
            const favorites = await Favorite.find({ user: user.id }).populate(
                "manual"
            );
            //Valida se o usuário possui manuais favoritos
            if (favorites.length === 0) {
                return res.status(200).json({ message: "Nenhum Manual como Favorito" });
            }
            return res.status(200).json(favorites);
        } catch (error) {
            return res
                .status(500)
                .json({ error: "Erro interno do servidor.", details: error.message });
        }
    },
    //Função para listar os todos os manuais marcados como favoritos pelo usuário
    listAllFavorites: async function(req, res) {
        try {
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
            //Procura se algum manual foi marcado como favorito pelo usuário
            const favorites = await Favorite.find({ user: user.id }).populate(
                "manual"
            );
            //Valida se o usuário possui manuais favoritos
            if (favorites.length === 0) {
                return res.status(200).json({ message: "Nenhum manual favorito encontrado." });
            }
            //Busca o nome do modelo dos manuais marcados como favoritos
            await Promise.all(favorites.map(async favorite => {
                const model = await Model.findOne({ id: favorite.manual.model });
                favorite.manual.model = model.name;
            }));
            return res.status(200).json(favorites);
        } catch (error) {
            return res
                .status(500)
                .json({ error: "Erro interno do servidor.", details: error.message });
        }
    },
    //Função para remover um manual da lista de favoritos
    deleteFavorite: async function(req, res) {
        try {
            const { manualId } = req.body; //Recebe o id do manual
            //Valida se o id realamente foi recebido
            if (!manualId) {
                return res.status(400).json({ error: "ID do manual é necessário." });
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

            // Verifica se o manual existe
            const manual = await Manual.findOne({ id: manualId });
            if (!manual) {
                return res.status(404).json({ error: "Manual não encontrado." });
            }

            // Verifica se o favorito existe
            const favorite = await Favorite.findOne({
                user: user.id,
                manual: manualId,
            });
            if (!favorite) {
                return res.status(404).json({ error: "Favorito não encontrado." });
            }

            // Deleta o favorito
            await Favorite.destroyOne({ id: favorite.id });

            return res
                .status(200)
                .json({ message: "Favorito deletado com sucesso." });
        } catch (error) {
            return res
                .status(500)
                .json({ error: "Erro interno do servidor.", details: error.message });
        }
    },
};