import request from 'supertest';
import app from '../server';
import bcrypt from 'bcrypt';
import db from '../database';

describe('CSRF Protection', () => {
    let token;
    const cookieJar = request.agent(app);

    beforeAll(async () => {
        // Hash passordet før innsending til databasen
        const hashedPassword = await bcrypt.hash('newpassword', 10);

        try {
            // Sett opp en bruker før testing
            await new Promise((resolve, reject) => {
                db.run('INSERT INTO users (username, password) VALUES (?, ?)', ['newuser', hashedPassword], function(err) {
                    if (err) {
                        if (err.message.includes('UNIQUE constraint failed')) {
                            console.log('User already exists. Skipping creation.');
                            resolve(); 
                        } else {
                            console.error('Error creating user:', err.message);
                            reject(err);
                        }
                    } else {
                        console.log('User created: newuser');
                        resolve();
                    }
                });
            });

            // Autentiser brukeren og hent token
            const res = await cookieJar
                .post('/login')
                .send({ username: 'newuser', password: 'newpassword' });

            if (res.body.token) {
                token = res.body.token;
                console.log('Login token:', token); // Bekreft at token er mottatt
            } else {
                console.error('Failed to retrieve login token', res.body);
            }
        } catch (error) {
            console.error('Setup failed:', error);
        }
    });

    it('should return CSRF token when authenticated', async () => {
        console.log('Using token:', token);
        const res = await cookieJar
            .get('/csrf-token')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body).toHaveProperty('csrfToken');
    });

    it('should return 403 for requests with invalid CSRF token', async () => {
        const res = await cookieJar
            .post('/workouts')
            .set('Authorization', `Bearer ${token}`)
            .set('X-CSRF-Token', 'invalid_token')
            .send({ type: 'Running', duration: 30 })
            .expect(403);

        expect(res.text).toContain('invalid csrf token');
    });
});
