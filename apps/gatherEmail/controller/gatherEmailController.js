/**
 * @Author: Kevin
 * @Description: Gather Email
 * @Date: 2021/12/28
 **/
const request = require('request');
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const token = require('../../../resource/key/newaim01-94318d82578f.json')
const {OAuth2Client} = require("google-auth-library/build/src/auth/oauth2client");


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

        request.get(this.googleUrl, function(err, response, body){
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
            // const rl = await readline.createInterface({
            //     input: process.stdin,
            //     output: process.stdout,
            // });
           // let { code } = await rl.question('Enter the code from that page here: ')
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
        }).catch((err)=>{
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
    downloadFile(auth){
        const drive = google.drive({version: 'v3', auth});
        let fileId = '1DD-VTVAc2EgpKao9tjinvyWX6lKMzFaflU1t1nYudAU';
        let dest = fs.createWriteStream('./tmp/resume.pdf');
        drive.files.get({
            fileId: fileId,
            mimeType: 'application/pdf'
        }, function(err, metadata){
            if (err) {
                console.error("Error GET files :" +  err);
                return process.exit();
            }

            console.log('Downloading %s...', metadata.data.name);

            let dest = fs.createWriteStream(metadata.data.name);

            drive.files.get({fileId: fileId, mimeType: 'application/pdf'}).on('error', function (err) {
                console.log('Error downloading file', err);
                process.exit();
            }).pipe(dest);

            dest.on('finish', function () {
                console.log('Downloaded %s!', metadata.data.name);
                return true
            }).on('error', function (err) {
                console.log('Error writing file', err);
                return false;
            });
        })
    }
}

module.exports = new GatherEmailController();
