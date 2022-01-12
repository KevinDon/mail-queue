const systemConfig = {
    host: 'smtp.163.com', // host
    service: '163', // nodemailer的内置传输发送邮件
    port: 465, // SMTP 端口
    user: 'kevintang002@163.com', // nodemailer的邮箱
    pass: 'vv34560536',// nodemailer的密码

    dingUrl:'https://oapi.dingtalk.com/robot/send?access_token=05daf035da83d5dd5e5025ab01e3cbe0e3f92473c85fc7a3ee3338e1354e97ea'
}
module.exports = systemConfig;
