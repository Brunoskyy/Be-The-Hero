const request = require('supertest')
const app = require('../../src/app')
const connection = require('../../src/database/connection')

const ong = { name: 'APAD', email: 'contato@apad.org', whatsapp: '47999990000', city: 'Rio do Sul', uf: 'sc' }

describe('NGOs', () => {
  beforeEach(async () => {
    await connection.migrate.rollback(undefined, true)
    await connection.migrate.latest()
  })
  afterAll(() => connection.destroy())

  it('registers an NGO and returns an 8-character id', async () => {
    const response = await request(app).post('/ongs').send(ong)
    expect(response.status).toBe(201)
    expect(response.body.id).toHaveLength(8)
    const list = await request(app).get('/ongs')
    expect(list.body).toEqual([expect.objectContaining({ id: response.body.id, name: 'APAD', uf: 'SC' })])
  })

  it('validates the body', async () => {
    const response = await request(app).post('/ongs').send({ ...ong, whatsapp: '123', uf: 'Santa Catarina' })
    expect(response.status).toBe(400)
    expect(response.body.validation.body.keys).toEqual(expect.arrayContaining(['whatsapp']))
  })

  it('opens a session for a known id and refuses an unknown one', async () => {
    const { body } = await request(app).post('/ongs').send(ong)
    expect((await request(app).post('/sessions').send({ id: body.id })).body).toEqual({ name: 'APAD' })
    expect((await request(app).post('/sessions').send({ id: 'nope1234' })).status).toBe(400)
  })
})
