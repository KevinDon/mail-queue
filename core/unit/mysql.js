/**
   * @Author: Kevin
   * @Description: Mysql
   * @Date: 2021/12/29
**/
import "reflect-metadata";
import {createConnection} from "typeorm";
import { emailSubmission } from "../../entity/emailSubmissionEntity";
import dbConfig from "../../config/db.config"


createConnection({
    driver: dbConfig.mysql,
    entities: [
        emailSubmission
    ],
    autoSchemaSync: true,
}).then(connection => {
    // 这里可以写实体操作相关的代码
    console.log('链接数据库成功')
}).catch(error => console.log(error));
