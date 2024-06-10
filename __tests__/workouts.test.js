import request from 'supertest';
import app from '../server';

describe('Workout CRUD Operations', () => {
    let token;
    let csrfToken;
    const cookieJar = request.agent(app);

    beforeAll(async () => {
        // Register and login user
        await cookieJar
            .post('/register')
            .send({ username: 'testuser', password: 'testpassword' });
        
        const loginRes = await cookieJar
            .post('/login')
            .send({ username: 'testuser', password: 'testpassword' });
        
        token = loginRes.body.token;
        console.log('JWT token:'. token);
        
        const csrfRes = await cookieJar
            .get('/csrf-token')
            .set('Authorization', `Bearer ${token}`)
        
        csrfToken = csrfRes.body.csrfToken;
        console.log('CSRF Token:', csrfToken);
    });

    it('should create a new workout', async () => {

        const res = await cookieJar
            .post('/workouts')
            .set('Authorization', `Bearer ${token}`)
            .set('X-CSRF-Token', csrfToken)
            .send({ type: 'Running', duration: 30 })
            .expect('Content-Type', /json/)
            .expect(201);

        expect(res.body).toHaveProperty('id');
    });

    it('should fetch all workouts', async () => {

        const res = await cookieJar
            .get('/workouts')
            .set('Authorization', `Bearer ${token}`)
            .set('X-CSRF-Token', csrfToken)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(Array.isArray(res.body)).toBeTruthy();
    });
    it('should get a specific workout by ID', async () => {
        const createRes = await cookieJar
            .post('/workouts')
            .set('Authorization', `Bearer ${token}`)
            .set('X-CSRF-Token', csrfToken)
            .send({ type: 'Cycling', duration: 60 })
            .expect(201);

        const workoutId = createRes.body.id;

        const res = await cookieJar
            .get(`/workouts/${workoutId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body).toHaveProperty('type', 'Cycling');
        expect(res.body).toHaveProperty('duration', 60);
    });
        it('should update a workout', async () => {
        const createRes = await cookieJar
            .post('/workouts')
            .set('Authorization', `Bearer ${token}`)
            .set('X-CSRF-Token', csrfToken)
            .send({ type: 'Swimming', duration: 45 })
            .expect(201);

        const workoutId = createRes.body.id;

        const updateRes = await cookieJar
            .put(`/workouts/${workoutId}`)
            .set('Authorization', `Bearer ${token}`)
            .set('X-CSRF-Token', csrfToken)
            .send({ type: 'Swimming', duration: 50 })
            .expect(200);

        expect(updateRes.body).toHaveProperty('changes', 1);
    });

        it('should delete a workout', async () => {
        const createRes = await cookieJar
            .post('/workouts')
            .set('Authorization', `Bearer ${token}`)
            .set('X-CSRF-Token', csrfToken)
            .send({ type: 'Yoga', duration: 30 })
            .expect(201);

        const workoutId = createRes.body.id;

        console.log('Created workout ID:', workoutId); // Logg den opprettede treningsøkten

        const deleteRes = await cookieJar
            .delete(`/workouts/${workoutId}`)
            .set('Authorization', `Bearer ${token}`)
            .set('X-CSRF-Token', csrfToken)
            .expect(200);

        console.log('Delete response:', deleteRes.body); // Logg responsen fra slettingen

        expect(deleteRes.body).toHaveProperty('changes', 1);

        // Verifiser at treningsøkten faktisk er slettet
        const getRes = await cookieJar
            .get(`/workouts/${workoutId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404);

    console.log('Get after delete response:', getRes.body); // Logg responsen etter sletting
});
});