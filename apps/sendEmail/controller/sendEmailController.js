/**
 * @Author: Kevin
 * @Description: Send Email
 * @Date: 2022/01/10
 **/

const nodemailer = require('nodemailer');
const fs  = require('fs');
const path = require('path');
const systemConfig = require('../../../config/system.config')
class SendEmailController {

    /**
     *
     * @param params
     */
    sendEmail (params){
        return new Promise((resolve)=> {
            let transporter = nodemailer.createTransport({
                host: systemConfig.host,
                service: systemConfig.service,
                port:  systemConfig.port,
                secureConnection: true,
                auth: {
                    user:  systemConfig.user,
                    pass:  systemConfig.pass,
                }
            });

            let mailOptions = {
                from: 'Newaim Support <' + systemConfig.user +'>', // sender address
                to: params.to, // list of receivers
                subject: params.subject,
                html: params.html, // html body
                attachments: [{
                    filename: params.fileName,
                    path: path.resolve(__dirname, process.cwd(), params.filePath)
                }]
            };
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    resolve(error);
                }
                console.log('Message sent: %s', info.messageId);
                resolve(info);
                // Message sent: <04ec7731-cc68-1ef6-303c-61b0f796b78f@qq.com>
            });
        })

    }
}

module.exports = new SendEmailController();
