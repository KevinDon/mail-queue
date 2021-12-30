'use strict';
const dbConfig = {

    mysql: {
        database: 'mail_queue',
        password: '123456',
        host: '127.0.0.1',
        user: 'root',
    },

    // TODO redis 暂时不安装
    // redis: {
    //     host: ' 192.168.3.222',
    //     port: 6379,
    //     // password:"",
    //     database: 1,
    //     maxRetries: 1,
    //     retryConnectInterval: 5000
    // }
};

module.exports = dbConfig;
