import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { Role } from '../src/user/role.enum';
import { LoginDto } from '../src/auth/auth.controller';

describe('Application (e2e)', () => {
    let app: INestApplication;
    let adminToken: string;
    let user1Id: string;
    let user2Id: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        adminToken = await login({
            email: 'admin@fancy-factory.de',
            password: 'admin'
        });

        user1Id = await createUser({
                email: 'user1@fancy-factory.de',
                employeeNumber: 4711,
                password: 'user',
                firstname: 'Henry',
                lastname: 'Mills',
                roles: [Role.Employee],
            },
            adminToken,
        );
        user2Id = await createUser({
                email: 'user2@fancy-factory.de',
                employeeNumber: 4712,
                password: 'user',
                firstname: 'Todd',
                lastname: 'Graham',
                roles: [Role.Employee],
            },
            adminToken,
        );
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        // TODO
    })

    it("should change Username to Graham 2nd", async () => {
        await request(app.getHttpServer())
            .patch(`/user/${user2Id}`)
            .auth(adminToken, { type: 'bearer' })
            .send({ lastname: "Graham 2nd" })
            .expect(200);
    });


    async function login(data: LoginDto) {
        const { body } = await request(app.getHttpServer())
            .post('/auth/login')
            .send(data)
            .expect(200);
        return body.access_token;
    }

    async function createUser(user: CreateUserDto, token: string) {
        const { body } = await request(app.getHttpServer())
            .post('/user')
            .auth(token, { type: 'bearer' })
            .send(user)
            .expect(201);
            
        expect(body._id).toBeDefined();
        return body._id;
    }
});