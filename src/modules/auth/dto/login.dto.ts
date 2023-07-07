import {Column, PrimaryColumn} from "typeorm";

export class LoginDto {
    username: string;
    password: string;

}