import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../user/user.schema';
import { ObjectId } from 'mongoose';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findUserByEmail(email);
        if (user && (await user.validatePassword(pass))) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user.toJSON();
            return result;
        }
        return null;
    }

    async login(user: Partial<User> & { email: string; _id: ObjectId }) { //for testing purposes (see auth.service.spec.ts)
        return {
            access_token: this.jwtService.sign({
                email: user.email,
                employeeNumber: user.employeeNumber,
                sub: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                roles: user.roles,
            }),
            userId: user._id,
        };
    }
}