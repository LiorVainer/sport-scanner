import request from 'supertest';
import { initServer } from '../server';
import mongoose from 'mongoose';
import { Express } from 'express';
import { UserRepository } from '../repositories/user.repository';
import { UserWithTokens } from '../types/user.types';

let app: Express;

const baseUrl = '/auth';

const testUser: UserWithTokens = {
    email: 'test@user.com',
    password: 'testpassword',
    username: 'testuser',
    picture: 'testpicture',
};

beforeAll(async () => {
    app = await initServer();
    await UserRepository.deleteMany();
});

afterAll((done) => {
    console.log('afterAll');
    mongoose.connection.close();
    done();
});

describe('Auth API Tests', () => {
    test('Registers a new user successfully', async () => {
        const response = await request(app)
            .post(baseUrl + '/register')
            .send(testUser);
        expect(response.statusCode).toBe(200);
    });

    test('Fails to register a user with invalid data', async () => {
        const response = await request(app)
            .post(baseUrl + '/register')
            .send({ email: 'invalidemail' });
        expect(response.statusCode).not.toBe(200);

        const response2 = await request(app)
            .post(baseUrl + '/register')
            .send({ email: '', password: 'short' });
        expect(response2.statusCode).not.toBe(200);
    });

    test('Logs in an existing user successfully', async () => {
        const response = await request(app)
            .post(baseUrl + '/login')
            .send(testUser);
        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        expect(response.body._id).toBeDefined();

        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;
        testUser._id = response.body._id;
    });

    test('Ensures access and refresh tokens are unique for each login', async () => {
        const response = await request(app)
            .post(baseUrl + '/login')
            .send(testUser);
        const newAccessToken = response.body.accessToken;
        const newRefreshToken = response.body.refreshToken;

        expect(newAccessToken).not.toBe(testUser.accessToken);
        expect(newRefreshToken).not.toBe(testUser.refreshToken);
    });

    test('Fails to log in with incorrect credentials', async () => {
        const response = await request(app)
            .post(baseUrl + '/login')
            .send({ email: testUser.email, password: 'wrongpassword' });
        expect(response.statusCode).not.toBe(200);

        const response2 = await request(app)
            .post(baseUrl + '/login')
            .send({ email: 'nonexistent@user.com', password: 'testpassword' });
        expect(response2.statusCode).not.toBe(200);
    });

    test('Successfully refreshes tokens', async () => {
        const response = await request(app)
            .post(baseUrl + '/refresh')
            .send({ refreshToken: testUser.refreshToken });
        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();

        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;
    });

    test("Fails to reuse a refresh token after it's already been used", async () => {
        const response = await request(app)
            .post(baseUrl + '/refresh')
            .send({ refreshToken: testUser.refreshToken });
        expect(response.statusCode).toBe(200);

        const newRefreshToken = response.body.refreshToken;

        const response2 = await request(app)
            .post(baseUrl + '/refresh')
            .send({ refreshToken: testUser.refreshToken });
        expect(response2.statusCode).toBe(400);

        const response3 = await request(app)
            .post(baseUrl + '/refresh')
            .send({ refreshToken: newRefreshToken });
        expect(response3.statusCode).toBe(400);
    });

    test('Retrieves the authenticated user profile (/me)', async () => {
        const response = await request(app).get(`${baseUrl}/me`).set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(testUser._id);
        expect(response.body.email).toBe(testUser.email);
        expect(response.body.username).toBe(testUser.username);
    });

    test('Fails to retrieve profile with invalid token', async () => {
        const response = await request(app).get(`${baseUrl}/me`).set('Authorization', `Bearer invalidToken`);
        expect(response.statusCode).toBe(401);
    });

    test('Fails to retrieve profile with no token', async () => {
        const response = await request(app).get(`${baseUrl}/me`);
        expect(response.statusCode).toBe(401);
    });
});
