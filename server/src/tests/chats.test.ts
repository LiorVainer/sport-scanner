import request from 'supertest';
import { initServer } from '../server';
import mongoose from 'mongoose';
import { UserRepository } from '../repositories/user.repository';
import { UserWithTokens } from '../types/user.types';
import { Application } from 'express';
import { MatchExperienceWithId } from '../models/match-experience.model';
import { chatService } from '../services/chat.service';

let app: Application;

const testMatchExperience: Partial<MatchExperienceWithId> = {
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    matchDate: new Date(),
    league: 'Premier League',
    country: 'England',
    stadium: 'Wembley Stadium',
    title: 'Exciting Match!',
    description: 'This will be an intense match between top teams.',
    likes: [],
    createdAt: new Date(),
    updatedAt: new Date(),
};

const testUser: UserWithTokens = {
    email: 'test1@user.com',
    password: 'testpassword',
    username: 'testuser',
    picture: 'testpicture',
};

const testUser2: UserWithTokens = {
    email: 'test2@user.com',
    password: 'testpassword',
    username: 'testuser2',
    picture: 'testpicture',
};

beforeAll(async () => {
    app = await initServer();
    await UserRepository.deleteMany();

    const registerResponse = await request(app).post('/auth/register').send(testUser);
    expect(registerResponse.statusCode).toBe(200);

    const registerResponse2 = await request(app).post('/auth/register').send(testUser2);
    expect(registerResponse2.statusCode).toBe(200);

    const loginResponse = await request(app).post('/auth/login').send(testUser);
    testUser.accessToken = loginResponse.body.accessToken;
    testUser._id = loginResponse.body._id;
    testUser2._id = registerResponse2.body._id;
    expect(testUser.accessToken).toBeDefined();

    const { createdBy, ...rest } = testMatchExperience;
    const response = await request(app)
        .post('/match-experiences')
        .set('Authorization', `Bearer ${testUser.accessToken}`)
        .send(rest);
    testMatchExperience._id = response.body._id;
    expect(response.statusCode).toBe(200);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Chats API Integration Tests', () => {
    test('get chat for a match experience', async () => {
        const response = await request(app)
            .get(`/chat?matchExperienceId=${testMatchExperience._id}`)
            .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.statusCode).toBe(200);
    });

    test('get chat between user', async () => {
        const response = await request(app)
            .get(
                `/chat?matchExperienceId=${testMatchExperience._id}&visitorId=${testUser2._id}&matchExperienceCreatorId=${testUser._id}`
            )
            .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.statusCode).toBe(200);
    });

    test('returns 500 if chatService.getChatBetweenUsers throws an error', async () => {
        const spy = jest
            .spyOn(chatService, 'getChatBetweenUsers')
            .mockImplementation(() => Promise.reject(new Error('Internal error')));

        const response = await request(app)
            .get(
                `/chat?matchExperienceId=${testMatchExperience._id}&visitorId=${testUser2._id}&matchExperienceCreatorId=${testUser._id}`
            )
            .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error fetching chats');

        spy.mockRestore();
    });

    test('returns 500 if chatService.getChatsForMatchExperience throws an error', async () => {
        const spy = jest
            .spyOn(chatService, 'getChatsForMatchExperience')
            .mockImplementation(() => Promise.reject(new Error('Internal error')));

        const response = await request(app)
            .get(`/chat?matchExperienceId=${testMatchExperience._id}`)
            .set('Authorization', `Bearer ${testUser.accessToken}`);

        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty('error', 'Error fetching chats');

        spy.mockRestore();
    });
});
