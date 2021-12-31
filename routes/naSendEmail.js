/**
   * @Author: Kevin
   * @Description: Send Email
   * @Date: 2021/12/28
**/
var express = require('express');
var router = express.Router();
var URL = require('url');
var gatherEmailController = require('../apps/gatherEmail/controller/gatherEmailController')
//加载mysql模块
const mysql = require("mysql2");
const dbConfig = require("../config/db.config");

//创建连接
const connection = mysql.createConnection(dbConfig.mysql);
// //执行创建连接
connection.connect(error => {
    if (error) {
        console.error("Error Connecting to the database: " + error);
        return process.exit();
    }
});
//SQL语句
var  sql = 'SELECT * FROM na_email_submission';



/* Send Email Newaim. */
router.post('/', function(req, res, next) {
    gatherEmailController.downloadGoogleFile();
    connection.query(sql, function (err, result) {
        if(err){
            console.log('[SELECT ERROR] - ',err.message);
            return;
        }
        //把搜索值输出
        console.log(result);
    });
    res
        .status(500)
        .json({ error: 'message' })
});

module.exports = router;
