import { BadRequestException, Injectable } from "@nestjs/common";
import { UsersService } from "./users.service";
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";
import { NotFoundException } from "@nestjs/common/exceptions";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async signup(email: string, password: string) {
        //If email is in use
        const users = await this.usersService.find(email);
        if(users.length) {
            throw new BadRequestException('Email already in use');
        } else {
            //Hash the user password

            //Generate a salt
            const salt = randomBytes(8).toString('hex');
            //Hash the salt and password together
            const hash = (await scrypt(password, salt, 32)) as Buffer;
            //Join the hashed results
            const result = `${salt}.${hash.toString('hex')}`;
            //create new user and password
            const user = await this.usersService.create(email, result);
            return user;
        }
    }

    async signin(email: string, password: string) {
        const [user] = await this.usersService.find(email);
        if (!user) {
            throw new NotFoundException('User not found');
        } else {
            const [ salt, storedHash ] = user.password.split('.');
            const hash = (await scrypt(password, salt, 32)) as Buffer;
            if(storedHash !== hash.toString('hex')){
                throw new BadRequestException('Wrong password');
            }
            return user;
        }
    }
}