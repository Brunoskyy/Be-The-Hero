const request = require('supertest')
const app = require('../../src/app')
const connection = require('../../src/database/connection')

async function registerOng(name) {
  const { body } = await request(app)
    .post('/ongs')
    .send({ name, email: `${name}@mail.org`, whatsapp: '47999990000', city: 'Rio do Sul', uf: 'SC' })
  return body.id
}

describe('Incidents', () => {
  beforeEach(async () => {
    await connection.migrate.rollback(undefined, true)
    await connection.migrate.latest()
  })
  afterAll(() => connection.destroy())

  it('creates an incident for the authenticated NGO and lists it on the profile', async () => {
    const id = await registerOng('APAD')
    const created = await request(app)
      .post('/incidents')
      .set('Authorization', id)
      .send({ title: 'Cadela atropelada', description: 'Precisa de cirurgia', value: 120 })
    expect(created.status).toBe(201)
    expect(created.body).toEqual({ id: 1 })

    const profile = await request(app).get('/profile').set('Authorization', id)
    expect(profile.body).toEqual([expect.objectContaining({ id: 1, title: 'Cadela atropelada', ong_id: id })])
    expect((await request(app).get('/profile').set('Authorization', 'ghost123')).status).toBe(401)
  })

  it('pages the public list five at a time, newest first, with the total in a header', async () => {
    const id = await registerOng('APAD')
    for (let i = 1; i <= 7; i += 1) {
      await request(app).post('/incidents').set('Authorization', id).send({ title: `Caso ${i}`, description: 'x', value: i })
    }
    const first = await request(app).get('/incidents')
    expect(first.headers['x-total-count']).toBe('7')
    expect(first.body.map((i) => i.title)).toEqual(['Caso 7', 'Caso 6', 'Caso 5', 'Caso 4', 'Caso 3'])
    expect(first.body[0]).toMatchObject({ name: 'APAD', city: 'Rio do Sul' })
    const second = await request(app).get('/incidents?page=2')
    expect(second.body.map((i) => i.title)).toEqual(['Caso 2', 'Caso 1'])
  })

  it('lets only the owning NGO delete an incident', async () => {
    const owner = await registerOng('APAD')
    const other = await registerOng('Outra')
    const { body } = await request(app).post('/incidents').set('Authorization', owner).send({ title: 'T', description: 'D', value: 1 })
    expect((await request(app).delete(`/incidents/${body.id}`).set('Authorization', other)).status).toBe(401)
    expect((await request(app).delete(`/incidents/999`).set('Authorization', owner)).status).toBe(404)
    expect((await request(app).delete(`/incidents/${body.id}`).set('Authorization', owner)).status).toBe(204)
    expect((await request(app).get('/profile').set('Authorization', owner)).body).toEqual([])
  })

  it('refuses an incident from an unknown NGO', async () => {
    const r = await request(app).post('/incidents').set('Authorization', 'ghost123').send({ title: 'T', description: 'D', value: 1 })
    expect(r.status).toBe(401)
  })
})
