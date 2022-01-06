/**
 * @Author: Kevin
 * @Description: Gather Email
 * @Date: 2021/12/28
 **/
const request = require('request');
const fs = require('fs');
const uuid = require('uuid');
const {google} = require('googleapis');
const moment = require('moment');


class GatherEmailController {
    googleUrl = 'https://drive.google.com/file/d/1DtB1f2pj9FbvRRfjUQ9ZO7MFCjlXsA0r/view?usp=sharing';
    // 配置权限
    SCOPES = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.appdata',
    ];
    TOKEN_PATH = 'token.json';

    /**
     * 下载Google Drive文件
     * @returns {GatherEmailController}
     */
    downloadGoogleFile() {
        console.log('--------------------------------------------------------')
        // Load client secrets from a local file.
        fs.readFile('./resource/key/client_secret_kevin.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Tasks API.
            this.authorize(JSON.parse(content), this.downloadFile);
        });

        request.get(this.googleUrl, function (err, response, body) {
            //console.log(response);
            // let detailsParse = JSON.parse(body);
            // console.log(detailsParse)
        });
        return this;
    }


    /**
     * Create an OAuth2 client with the given credentials, and then execute the given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.web;

        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(this.TOKEN_PATH, (err, token) => {
            if (err) return this.getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
    }

    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    getAccessToken(oAuth2Client, callback) {
        return new Promise(async (resolve, reject) => {
            const authUrl = await oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: this.SCOPES,
            });
            console.log('Authorize this app by visiting this url:', authUrl);
            oAuth2Client.getToken('4/0AX4XfWidjAzhMRKXgQF9JdqOilwXNOH372fvZuXdNZNVuzfni9gGBAMyiyWfpLWjcEDDFw', (err, token) => {
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
     */
    listFiles(auth) {
        const drive = google.drive({version: 'v3', auth});
        drive.files.list({
            pageSize: 10,
            fields: 'nextPageToken, files(id, name)',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const files = res.data.files;
            if (files.length) {
                console.log('Files:');
                files.map((file) => {
                    console.log(`${file.name} (${file.id})`);
                    this.downloadFile(auth, file.id)

                });
            } else {
                console.log('No files found.');
            }
        });
    }

    /**
     * 下载文件 ByID
     * @param auth
     */
    downloadFile(auth, fileID) {
        const drive = google.drive({version: 'v3', auth});
        let _fileId = '1WWXJGRKnxBwfiWcc2tc3ElUd2i8pHLrt', dest;
        let progress = 0;
        if(fileID !== _fileId) return;
        drive.files.get({
                fileId: fileId,
                alt: 'media'
            },
            {responseType: 'stream'},
            (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                let time = moment().format();
                dest = fs.createWriteStream(`./tmp/${uuid.v4().replace(/-/g, '')}_resume.pdf`);
                res.data.on('end', () =>{
                    console.log('Done downloading file.');
                }).on('data', d => {
                    progress += d.length;
                    if (process.stdout.isTTY) {
                        process.stdout.clearLine();
                        process.stdout.cursorTo(0);
                        process.stdout.write(`Downloaded ${progress} bytes`);
                    }
                }).pipe(dest);
        })
    }
}

module.exports = new GatherEmailController();
