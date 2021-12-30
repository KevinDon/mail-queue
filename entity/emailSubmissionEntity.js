/**
 * @Author: Kevin
 * @Description: Gather Email
 * @Date: 2021/12/28
 **/
import {Table , Column, PrimaryColumn } from "typeorm";

@Table()
export class emailSubmission {
    @PrimaryColumn("int", { generated: true })
    id: number;

    @Column()
    sender: string;

    @Column()
    receiver: string;

    @Column()
    cc: string;

    @Column()
    mail_content: string;

    @Column()
    google_url: string;

    @Column()
    status: string;

    @Column()
    remark: string;

    @Column()
    create_time: string;

    @Column()
    update_time: string;
}
