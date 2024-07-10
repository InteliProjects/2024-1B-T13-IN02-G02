/**
 * DoneFilesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const jwt = require('jsonwebtoken');
module.exports = {
    //Função para inserir a relação do usuário com o arquivo clicado para validar se um arquivo já foi clicado pelo usuário, antes de passar uma tarefa para concluída
    doneFile: async function(req, res) {
        try {
            const { fileId } = req.body; //Recebe o id do arquivo
            //Valida se há informação foi recebida
            if (!fileId) {
                return res.badRequest({ error: 'As informações Arquivo são obrigatórias.' });
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

            //Procura no banco de dados a relação entre o usuário e o arquivo
            const fileDone = await DoneFile.findOne({
                file: fileId,
                user: user.id
            });
            console.log("Testando o if file done: ",fileDone ? true : false)
            //Caso não exista ele inseri no banco de dados essa relação para validarmos se o arquivo já foi aberto pelo usuário
            if (!fileDone) {
                const doneFile = await DoneFile.create({
                    file: fileId,
                    user: user.id,
                }).fetch();
                console.log("File created: ",doneFile)
                return res.ok({ doneFile: true, success: true });
            } else {
                //Caso já exista esse relacionamento há o retorno da variavel doneFile como false, para valdarmos que o arquivo já foi aberto
                return res.ok({ doneFile: false, success: true });
            }
        } catch (err) {
            return res.serverError(err);
        }
    },

};