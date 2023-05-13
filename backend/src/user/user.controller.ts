import { Body, ConflictException, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Role } from './role.enum';
import { Roles } from '../auth/roles.decorator';
import { UserDocument } from './user.schema';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OwnRouteOrCafeteriaOperatorGuard } from './guards/own-route-or-cafeteriaOperator.guard';
import { ApiBearerAuth, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { PatchUserDto } from './dto/patch-user.dto';
import { UserDto } from './dto/user.dto';

@Controller('user')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':userId')
    @UseGuards(OwnRouteOrCafeteriaOperatorGuard)
    @ApiResponse({ type: () => UserDto })
    @ApiParam({ name: 'userId' })
    async getUser(@Request() request, @Param('userId') userId: string) {
        const user = await this.userService.findUserById(userId);
        return this.userToRest(user);
    }

    @Roles(Role.CafeteriaOperator)
    @Get('')
    @ApiResponse({ type: () => UserDto, isArray: true })
    async getUsers() {
        const users = await this.userService.findAllUsers();
        return users.map((user) => this.userToRest(user));
    }

    @Roles(Role.CafeteriaOperator)
    @Post('')
    @ApiResponse({ type: () => UserDto })
    @ApiBody({ type: () => CreateUserDto })
    async createUser(@Body() createUserDto: CreateUserDto) {
        if (await this.userService.hasUser(createUserDto.email, createUserDto.employeeNumber)) {
            throw new ConflictException({ email: createUserDto.email, employeeNumber: createUserDto.employeeNumber, error: 'User already exists' },
                'User already exists',
            );
        }
        const user = await this.userService.createUser(createUserDto);
        return this.userToRest(user);
    }

    @Roles(Role.CafeteriaOperator)
    @Patch(':userId')
    @ApiBody({ type: () => PatchUserDto })
    @ApiParam({ name: 'userId' })
    async patchUser(@Param('userId') userId: string, @Body() patchUserDto: PatchUserDto) {
        const user = await this.userService.updateUser(userId, patchUserDto);
        return this.userToRest(user);
    }

    @Roles(Role.CafeteriaOperator)
    @Delete(':userId')
    @ApiBody({ type: () => PatchUserDto })
    @ApiParam({ name: 'userId' })
    async deactivateUser(@Param('userId') userId: string) {
        const user = await this.userService.deactivateUser(userId);
        return this.userToRest(user);
    }

    private userToRest(user: UserDocument) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user.toJSON();
        return result;
    }
}