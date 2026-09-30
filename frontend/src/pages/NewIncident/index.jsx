import { useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

import logoImg from '../../assets/logo.svg'
import api from '../../services/api.js'
import { getSocket } from '../../services/socket.js'

import './styles.css'

export default function NewIncident() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const ongId = localStorage.getItem('ongId')

  async function handleNewIncident(e) {
    e.preventDefault()
    setError(null)
    const data = { title, description, value: Number(value) }
    try {
      await api.post('incidents', data, { headers: { Authorization: ongId } })
      getSocket().emit('incident:created', data)
      navigate('/profile')
    } catch {
      setError('Não foi possível cadastrar o caso. Confira os campos e tente de novo.')
    }
  }

  return (
    <div className="new-incident-container">
      <div className="content">
        <section>
          <img src={logoImg} alt="Be The Hero" />

          <h1>Cadastrar novo caso</h1>
          <p>Descreva o caso detalhadamente para encontrar um herói para resolver isso.</p>

          <Link className="back-link" to="/profile">
            <FiArrowLeft size={16} color="#E02041" />
            Voltar para home
          </Link>
        </section>

        <form onSubmit={handleNewIncident}>
          <input type="text" placeholder="Título do caso" aria-label="Título do caso" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea placeholder="Descrição" aria-label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="number" min="0" step="0.01" placeholder="Valor em reais" aria-label="Valor em reais" value={value} onChange={(e) => setValue(e.target.value)} />
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}

          <button className="button" type="submit">
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  )
}
