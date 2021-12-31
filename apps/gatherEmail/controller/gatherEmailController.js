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


class GatherEmailController {
    googleUrl = 'https://drive.google.com/file/d/1DtB1f2pj9FbvRRfjUQ9ZO7MFCjlXsA0r/view?usp=sharing';
    SCOPES = ['https://www.googleapis.com/auth/contacts.readonly'];
    TOKEN_PATH = 'token.json';
    /**
     * 下载Google Drive文件
     * @returns {GatherEmailController}
     */
    downloadGoogleFile() {
        console.log('--------------------------------------------------------')
        // Load client secrets from a local file.
        fs.readFile('./resource/key/newaim01-94318d82578f.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Tasks API.
            this.authorize(JSON.parse(content), this.listConnectionNames);
        });

        request.get(this.googleUrl, function(err, response, body){
            //console.log(response);
            let detailsParse = JSON.parse(body);
            console.log(detailsParse)
        });
        return this;
    }


    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    authorize(credentials, callback) {
        const {private_key, client_id, auth_uri} = credentials;
        console.log(private_key, client_id, auth_uri);

        const oAuth2Client = new google.auth.OAuth2(client_id, private_key, auth_uri);

        // Check if we have previously stored a token.
        fs.readFile(this.TOKEN_PATH, (err, token) => {
            if (err) return this.getNewToken(oAuth2Client, callback);
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
    getNewToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', this.TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }

    /**
     * Print the display name if available for 10 connections.
     *
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    listConnectionNames(auth) {
        const service = google.people({version: 'v1', auth});
        service.people.connections.list({
            resourceName: 'people/me',
            pageSize: 10,
            personFields: 'names,emailAddresses',
        }, (err, res) => {
            if (err) return console.error('The API returned an error: ' + err);
            const connections = res.data.connections;
            if (connections) {
                console.log('Connections:');
                connections.forEach((person) => {
                    if (person.names && person.names.length > 0) {
                        console.log(person.names[0].displayName);
                    } else {
                        console.log('No display name found for connection.');
                    }
                });
            } else {
                console.log('No connections found.');
            }
        });
    }
}

module.exports = new GatherEmailController();
