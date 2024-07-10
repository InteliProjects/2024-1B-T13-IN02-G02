const cloudinary = require("cloudinary").v2;
module.exports = {
    friendlyName: "Upload",

    description: "Upload a file in cloudinary.",

    inputs: {
        req: {
            type: "ref",
            required: true,
            description: "The http request",
        },
        fieldName: {
            type: "string",
            required: true,
            description: "Field name",
        },
    },

    exits: {
        success: {
            description: "All done.",
        },
    },

    fn: async(inputs, exits) => {
        let url = "";
        const { req, fieldName } = inputs; //Recebe os dados do controller
        await req.file(fieldName).upload(async(err, files) => {
            if (err) {
                throw new Error(err);
            }

            if (!files || files.length === 0) {
                return exits.success("Sucesso");
            }
            //Configura com o Cloudnary (API para upload de arquivos; opção gratuita para o projeto)
            cloudinary.config({
                cloud_name: "ddzb2uqkh",
                api_key: "876665737496418",
                api_secret: "omYZ8RQKma4vaG2ah0rQ7YvDpP8",
            });

            //Realizar o upload de todos os arquivos recebidos
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const result = await cloudinary.uploader.upload(file.fd); //Upload do arquivo no Cloudnary
                url = result.secure_url; //Resgatar url do arquivo
                type = url.split('.'); //Pegar a extensão do arquivo
                const newFile = await File.create({ //Cadastrar o arquivo no banco de dados
                    title: "Teste",
                    type: type[type.length - 1],
                    path: url,
                    manual: req.body.manualId
                }).fetch();
            }

            return exits.success("Sucesso");
        });
    },
};