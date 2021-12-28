/**
   * @Author: Kevin
   * @Description: Send Email
   * @Date: 2021/12/28
**/
var express = require('express');
var router = express.Router();

/* Send Email Newaim. */
router.post('/', function(req, res, next) {
    res
        .status(500)
        .json({ error: 'message' })
});

module.exports = router;
