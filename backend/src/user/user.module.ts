import { Module, OnModuleInit } from '@nestjs/common';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { Role } from './role.enum';
import { UserController } from './user.controller';
import { OrderModule } from '../order/order.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        OrderModule
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule implements OnModuleInit {
    constructor(private readonly userService: UserService) { }

    async onModuleInit() {
        await this.userService.ensureUser({
            email: 'admin@kantine.de',
            employeeNumber: 0,
            password: 'admin',
            firstname: 'Local',
            lastname: 'Admin',
            roles: [Role.CafeteriaOperator],
        });
        await this.userService.ensureUser({
            email: 'Test@kantine.de',
            employeeNumber: 1,
            password: 'test',
            firstname: 'Test',
            lastname: 'Test',
            roles: [Role.Employee],
        });
    }
}
