/**
 * @Author: Kevin
 * @Description: Send Ding Message
 * @Date: 2022/01/11
 **/
const request = require("request");
const systemConfig = require('../../../config/system.config')
class sendDingMessageController {
    sendDingMessage(params, callback) {
        // 发送钉钉信息
        request(
            systemConfig.dingUrl,
            {
                method: "POST",
                json: true,
                headers: {
                    "content-type": "application/json",
                },
                body: {
                    "msgtype": "markdown",
                    "markdown": {
                        "title":"Email Queue Operation Log",
                        "text": `#### Email Queue Operation Log  \n > #### Email ${params.action} \n > ${params.status} \n > #### ${params.message} \n #### ${params.time} `
                    },
                }
            },
            (error, response, body) => {
                if(error) return;
                callback(response)
            }
        )

    }
}

module.exports = new sendDingMessageController();
