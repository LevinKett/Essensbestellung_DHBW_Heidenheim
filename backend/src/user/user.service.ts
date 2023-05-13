import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { PatchUserDto } from './dto/patch-user.dto';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument> ) {}

    async findAllUsers() {
        return this.userModel.find({});
    }

    async findUserByEmail(email: string): Promise<UserDocument | undefined> {
        return this.userModel.findOne({ email });
    }

    async findUserByEmployeeNumber(employeeNumber: Number): Promise<UserDocument | undefined> {
        return this.userModel.findOne({ employeeNumber });
    }

    async findUserById(userId: string): Promise<UserDocument | undefined> {
        const user = await this.userModel.findOne({ _id: this.castToObjectId(userId) });
        if (!user) {
            throw new NotFoundException({
                userId: userId,
                error: 'User not found.'
            });
        }
        return user;
    }

    async hasUser(email: string, employeeNumber: Number) {
        return !!(await this.findUserByEmail(email) || await this.findUserByEmployeeNumber(employeeNumber));
    }

    async ensureUser(createUserDto: CreateUserDto) {
        if (await this.hasUser(createUserDto.email, createUserDto.employeeNumber)) {
            return;
        }
        await this.createUser(createUserDto);
    }

    async createUser(createUserDto: CreateUserDto) {
        const userDocument = new this.userModel(createUserDto);
        await userDocument.save();
        return userDocument;
    }

    async updateUser(userId: string, patchUserDto: PatchUserDto) {
        const user = await this.findUserById(userId);
        Object.assign(user, patchUserDto);
        await user.save();
        return user;
    }

    // No deletion of user objects due to potential of references pointing to null.
    // Instead, the personally identifiable information of a user is deleted. 
    // We need this feature in order to be DSGVO compliant. For further reading, have a look at Art. 17 Abs. 1 lit. a DSGVO.
    async deactivateUser(userId: string) {
        const user = await this.findUserById(userId);
        const deactivatedUserDto = {
            email: `former email of ${userId}`,                 // has to be unique
            employeeNumber: -parseInt(userId.slice(-16), 16),   // has to be unique
            password: "DEACTIVATED",
            firstname: "",
            lastname: "",
            roles: []
        }

        Object.assign(user, deactivatedUserDto);
        await user.save();
        return user;
    }


    castToObjectId(id: string) {
        try {
            return new mongoose.Types.ObjectId(id);
        } catch {
            throw new UnprocessableEntityException({
                id,
                error: 'Given id is not a valid userId',
            });
        }
    }
}