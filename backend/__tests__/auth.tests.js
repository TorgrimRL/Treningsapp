import request from 'supertest';
import app from '../server';
import db from '../database';

describe('User Registration and Login', () => {
    let token;
    let csrfToken;
    const cookieJar = request.agent(app);
    
    beforeAll(async () => {
    // Rens brukere som kan være til hinder for testen
    await db.run('DELETE FROM users WHERE username = ?', ['newuser']);
    });


    it('should register a new user', async () =>{
        const res = await request(app)
            .post('/register')
            .send({ username: 'newuser', password: 'newpassword'})
            .expect(201);
        expect(res.text).toBe('User registered');
    });

    it('should not allow duplicate usernames', async () => {
        const res = await request(app)
            .post('/register')
            .send({ username: 'newuser', password: 'newpassword'})
            .expect(400)
        expect(res.text).toBe('Username already exists');
    });

    it ('should login a regitered user', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'newuser', password: 'newpassword'})
            .expect(200)
        expect(res.body).toHaveProperty('token');
    });

    it ('should not login with wrong credentials', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'newuser', password: 'wrongpassword'})
            .expect(400);
        expect(res.text).toBe('Username or password is incorrect');
    });

    afterAll(async () => {
        await db.run('DELETE FROM users WHERE username = ?', ['newuser']);
    });
});