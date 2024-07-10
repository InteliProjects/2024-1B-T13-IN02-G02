const nodemailer = require('nodemailer');

module.exports = {
    friendlyName: 'Task update email',

    description: 'Send an email using a specified template.',

    inputs: {
        to: {
            type: 'string',
            required: true,
        },
        subject: {
            type: 'string',
            required: true,
        },
        template: {
            type: 'string',
            required: true,
        },
        context: {
            type: 'ref',
            required: true,
        },
    },

    fn: async function(inputs, exits) {
        //Configuar o servidor de e-mail (Mailtrap: Servidor de e-mail para testes; opção gratuita para o sistema)
        const transporter = nodemailer.createTransport({
            host: sails.config.email.host,
            port: sails.config.email.port,
            auth: {
                user: sails.config.email.auth.user,
                pass: sails.config.email.auth.pass,
            },
        });
        //Configura o e-mail par envio
        const mailOptions = {
            from: sails.config.email.from,
            to: inputs.to,
            subject: inputs.subject,
            html: `
            <!doctype html>
            <html>
              <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              </head>
              <body style="font-family: sans-serif;">
                <div style="display: block; margin: auto; max-width: 600px;" class="main">
                  <h1 style="font-size: 18px; font-weight: bold; margin-top: 20px">Manual atualizado!</h1>
                  <p> Um novo manual foi atribuido a você</p>
                  <p>Segue o link para ver o manual que foi atualizado:</p>
                  <a href="${inputs.context.taskUrl}">MANUAL ATRIBUÍDO</a>
                </div>
                <style>
                  .main { background-color: white; }
                  a{border:none; background:#0672CB; color:#FFF;font-size:1rem;padding:10px 20px;margin-top:5px; }
                </style>
              </body>
            </html>
          `,
        };
        //Envia o e-mail para o servidor de teste
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return exits.error(error);
            }
            return exits.success(info);
        });
    },
};