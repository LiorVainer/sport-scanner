import request from 'supertest';
import { initServer } from '../server';
import mongoose from 'mongoose';
import { UserRepository } from '../repositories/user.repository';
import { UserWithTokens } from '../types/user.types';
import { Application } from 'express';

let app: Application;
let country = 'Spain';
let league = '140';

const testUser: UserWithTokens = {
    email: 'test1@user.com',
    password: 'testpassword',
    username: 'testuser',
    picture: 'testpicture',
};

beforeAll(async () => {
    app = await initServer();
    await UserRepository.deleteMany();

    const registerResponse = await request(app).post('/auth/register').send(testUser);
    expect(registerResponse.statusCode).toBe(200);

    const loginResponse = await request(app).post('/auth/login').send(testUser);
    testUser.accessToken = loginResponse.body.accessToken;
    testUser._id = loginResponse.body._id;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Soccer API Integration Tests', () => {
    test('get countries', async () => {
        const response = await request(app)
            .get('/soccer/countries')
            .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    test('get leagues', async () => {
        const response = await request(app)
            .get(`/soccer/leagues?country=${country}`)
            .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    test('get venues', async () => {
        const response = await request(app)
            .get(`/soccer/venues?country=${country}`)
            .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    test('get teams', async () => {
        const response = await request(app)
            .get(`/soccer/teams?league=${league}`)
            .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
    });
});
