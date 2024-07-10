const cloudinary = require("cloudinary").v2;
module.exports = {
    friendlyName: "UploadPhoto",
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
                throw new Error("Arquivo é obrigatorio");
            }
            const file = files[0];
            //Configura com o Cloudnary (API para upload de arquivos; opção gratuita para o projeto)
            cloudinary.config({
                cloud_name: "ddzb2uqkh",
                api_key: "876665737496418",
                api_secret: "omYZ8RQKma4vaG2ah0rQ7YvDpP8",
            });
            //Realizar o upload da foto de perfil na API
            const result = await cloudinary.uploader.upload(file.fd);
            url = result.secure_url; //Retorna a url do upload
            return exits.success(url);
        });
    },
};