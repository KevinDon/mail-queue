/**
 * @Author: Kevin
 * @Description: Gather Email
 * @Date: 2021/12/28
 **/
const fs = require('fs');
const {google} = require('googleapis');
const moment = require('moment');
const sendEmailController = require('../../sendEmail/controller/sendEmailController')
const sendDingMessageController = require('../../sendDingMessage/controller/sendDingMessageController')
const systemConfig = require("../../../config/system.config");


class GatherEmailController {
    // 配置权限
    SCOPES = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.appdata',
    ];
    TOKEN_PATH = 'token.json';
    REQUEST_PARAMS;
    PROCESS_STATE;
    /**
     * 下载Google Drive文件
     * @returns {GatherEmailController}
     */
    downloadGoogleFile(body) {
        return new Promise((resolve)=>{
            this.REQUEST_PARAMS = body;
            // Load client secrets from a local file.
            fs.readFile('./resource/key/client_secret_kevin.json', (err, content) => {
                if (err) return console.log('Error loading client secret file:', err);
                // Authorize a client with credentials, then call the Google Tasks API.
                this.authorize(JSON.parse(content), this.listFiles).then(data => {
                    resolve(data);
                });
            });
        })
    }


    /**
     * Create an OAuth2 client with the given credentials, and then execute the given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    authorize(credentials, callback) {
        return new Promise((resolve)=>{
            const {client_secret, client_id, redirect_uris} = credentials.web;
            const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
            let self = this;

            // Check if we have previously stored a token.
            fs.readFile(this.TOKEN_PATH, (err, token) => {
                if (err) return this.getAccessToken(oAuth2Client, callback);
                oAuth2Client.setCredentials(JSON.parse(token));
                callback(oAuth2Client, this).then((data) => {
                    if (data.status) {
                        // all ready
                        sendEmailController.sendEmail({
                            filePath: data.fileData.filePath,
                            fileName: data.fileData.fileName,
                            to: self.REQUEST_PARAMS.to, // list of receivers
                            subject: self.REQUEST_PARAMS.subject, // Subject line
                            html: self.REQUEST_PARAMS.html,// html body
                        }).then((data) => {
                            // 发送成功后nodemailer的返回参数中悔有messageID
                            if (data.messageId) {
                                resolve({
                                    code: 200,
                                    action: 'Send Email',
                                    status: true,
                                    message: 'Email has been sent'
                                })
                            } else {
                                resolve({
                                    code: 201,
                                    action: 'Send Email',
                                    status: false,
                                    message: 'Failed to send the message. Try again later or contact your administrator'
                                })
                            }
                        })
                        sendDingMessageController.sendDingMessage({
                            action: 'Sent',
                            status:'Send Successful',
                            message:`Email from ${systemConfig.user} to ${self.REQUEST_PARAMS.to} succeeded`,
                            time: moment().format("dddd, MMMM Do YYYY, h:mm:ss a")
                        }, ()=>{})
                    }else{
                        resolve(data);
                    }
                });
            })

        })
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {OAuth2Client} oAuth2Client The OAuth2 client to get token for.
     * @param {Function} callback The callback for the authorized client.
     */
    getAccessToken(oAuth2Client, callback) {
        return new Promise(async (resolve, reject) => {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.SCOPES,
            });
            console.log('Authorize this app by visiting this url:', authUrl);
            await oAuth2Client.getToken('4/0AX4XfWidjAzhMRKXgQF9JdqOilwXNOH372fvZuXdNZNVuzfni9gGBAMyiyWfpLWjcEDDFw', (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', this.TOKEN_PATH);
                });
                resolve(oAuth2Client)
            })
        }).catch((err) => {
            console.log(err);
        }).then((res) => {
            callback(res);
        });
    }

    /**
     * Lists the names and IDs of up to 10 files.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     * @param self this
     */
    listFiles(auth, self) {
        return new Promise((resolve, reject)=>{
            // Error Message
            let downloadFileFlag = {
                code: 204,
                action:'Query File',
                status: false,
                message:'This file does not exist, please upload this file to Google Drive'
            };
            let _fileId = self.handleAttachmentLink(self.REQUEST_PARAMS.googleUrl);
            const drive = google.drive({version: 'v3', auth});
            drive.files.list({
                pageSize: 10,
                fields: 'nextPageToken, files(id, name)',
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                const files = res.data.files;
                if (files.length) {
                    files.map((file) => {
                        if (file.id !== _fileId) return downloadFileFlag;
                        downloadFileFlag.status = true;
                        self.downloadFile(auth, file.id, file.name).then(data => {
                            resolve(data);
                        })


                    });
                } else {
                    console.log('No files found.');
                    resolve(downloadFileFlag);
                }
                if(!downloadFileFlag.status) resolve(downloadFileFlag);
            });

        })

    }

    /**
     * 下载文件 ByID
     * @param auth
     * @param fileID
     * @param fileName
     */
    downloadFile(auth, fileID, fileName) {
        return new Promise((resolve)=>{
            // Error Message
            let downloadFileFlag = {
                code: 203,
                action:'Download File',
                status:'false',
                message:'This file does not exist, please upload this file to Google Drive'
            };
            let dest;
            let downloadRes;
            const drive = google.drive({version: 'v3', auth});
            let progress = 0;
            let p = new Promise((resolve) => {
                drive.files.get({
                        fileId: fileID,
                        alt: 'media'
                    },
                    {responseType: 'stream'},
                    async (err, res) => {
                        if (err) {
                            resolve(downloadFileFlag);
                            return console.log('The API returned an error: ' + err);
                        }
                        // 下载附件
                        let time = moment();
                        dest = fs.createWriteStream(`./tmp/${moment(time).valueOf() + '_' + fileName}`);
                        downloadRes = `./tmp/${moment(time).valueOf() + '_' + fileName}`;
                        await res.data.on('end', () => {
                            console.log('Done downloading file.');
                            resolve({
                                code:'202',
                                action:'Download File',
                                status: true,
                                message:'Download Successfully',
                                fileData: {
                                    fileName:`${moment(time).valueOf() + '_' + fileName}`,
                                    filePath: downloadRes,
                                }
                            })
                        }).on('data', (d) => {
                            progress += d.length;
                            if (process.stdout.isTTY) {
                                process.stdout.clearLine();
                                process.stdout.cursorTo(0);
                                process.stdout.write(`Downloaded ${progress} bytes`);
                            }
                        }).pipe(dest)

                        //

                    })
            })


            resolve(p)
        })
    }


    /**
     * get google url's file id
     * @returns google file id
     * @param googleUrl
     */
    handleAttachmentLink(googleUrl) {
        return googleUrl.split("/")[5]
    }
}

module.exports = new GatherEmailController();
