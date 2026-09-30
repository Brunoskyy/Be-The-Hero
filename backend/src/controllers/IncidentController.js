const connection = require('../database/connection')

const PAGE_SIZE = 5

module.exports = {
  async index(request, response) {
    const page = Number(request.query.page ?? 1)

    const [{ count }] = await connection('incidents').count({ count: '*' })

    const incidents = await connection('incidents')
      .join('ongs', 'ongs.id', '=', 'incidents.ong_id')
      .orderBy('incidents.id', 'desc')
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE)
      .select(['incidents.*', 'ongs.name', 'ongs.email', 'ongs.whatsapp', 'ongs.city', 'ongs.uf'])

    response.header('X-Total-Count', String(count))
    return response.json(incidents)
  },

  async create(request, response) {
    const { title, description, value } = request.body
    const ong_id = request.headers.authorization

    const ong = await connection('ongs').where('id', ong_id).first()
    if (!ong) return response.status(401).json({ error: 'Unknown NGO' })

    const [id] = await connection('incidents').insert({ title, description, value, ong_id })
    return response.status(201).json({ id })
  },

  async delete(request, response) {
    const { id } = request.params
    const ong_id = request.headers.authorization

    const incident = await connection('incidents').where('id', id).select('ong_id').first()
    if (!incident) return response.status(404).json({ error: 'Incident not found' })
    if (incident.ong_id !== ong_id) return response.status(401).json({ error: 'Operation not permitted' })

    await connection('incidents').where('id', id).delete()
    return response.status(204).send()
  },
}
