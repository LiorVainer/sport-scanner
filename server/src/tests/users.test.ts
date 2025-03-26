import request from 'supertest';
import { initServer } from '../server';
import mongoose from 'mongoose';
import { UserRepository } from '../repositories/user.repository';
import { UserWithTokens } from '../types/user.types';
import { Application } from 'express';

let app: Application;

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
    expect(testUser.accessToken).toBeDefined();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('User API Integration Tests', () => {
    test("updates a user's password using their ID", async () => {
        const response = await request(app)
            .put(`/users/${testUser._id}`)
            .set('Authorization', `Bearer ${testUser.accessToken}`)
            .send({ password: 'updatedpassword' });

        expect(response.statusCode).toBe(200);
    });

    test('returns 404 when trying to update a non-existent user', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/users/${nonExistentId}`)
            .set('Authorization', `Bearer ${testUser.accessToken}`)
            .send({ password: 'updatedpassword' });

        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty('message', 'User not found');
    });

    test('returns 401 when trying to update a user with an invalid JWT', async () => {
        const invalidToken = 'invalid.jwt.token';

        const response = await request(app)
            .put(`/users/${testUser._id}`)
            .set('Authorization', `Bearer ${invalidToken}`)
            .send({ password: 'updatedpassword' });

        expect(response.statusCode).toBe(401);
    });
});
