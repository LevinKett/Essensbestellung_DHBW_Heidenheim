import { Body, ConflictException, Controller, Get, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService
    ) {}

    @Post('register')
    @ApiBody({ type: () => CreateUserDto })
    @HttpCode(200)
    async register(@Body() createUserDto: CreateUserDto) {
        if (await this.userService.hasUser(createUserDto.email, createUserDto.employeeNumber)) {
            throw new ConflictException({ email: createUserDto.email, employeeNumber: createUserDto.employeeNumber, error: 'User already exists' },
                'User already exists',
            );
        }
        const user = await this.userService.createUser(createUserDto);
        return this.authService.login(user);
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiBody({ type: () => LoginDto })
    @HttpCode(200)
    async login(@Request() req) {
        return this.authService.login(req.user);
    }
}

export { LoginDto };
