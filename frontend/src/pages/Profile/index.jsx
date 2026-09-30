import { useCallback, useEffect, useState } from 'react'
import { FiPower, FiTrash2 } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

import logoImg from '../../assets/logo.svg'
import api from '../../services/api.js'
import { getSocket } from '../../services/socket.js'

import './styles.css'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function Profile() {
  const [incidents, setIncidents] = useState([])
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const ongId = localStorage.getItem('ongId')
  const ongName = localStorage.getItem('ongName')

  const load = useCallback(() => {
    if (!ongId) return Promise.resolve()
    return api
      .get('/profile', { headers: { Authorization: ongId } })
      .then((response) => setIncidents(response.data))
      .catch(() => setError('Não foi possível carregar os casos.'))
  }, [ongId])

  useEffect(() => {
    if (!ongId) {
      navigate('/')
      return
    }
    void load()
  }, [ongId, load, navigate])

  // Another browser registering a case refreshes this list. The listener is
  // removed on unmount, so navigating back and forth does not stack them.
  useEffect(() => {
    if (!ongId) return
    const socket = getSocket()
    const onCreated = () => void load()
    socket.on('incident:created', onCreated)
    return () => {
      socket.off('incident:created', onCreated)
    }
  }, [ongId, load])

  async function handleDeleteIncident(id) {
    try {
      await api.delete(`incidents/${id}`, { headers: { Authorization: ongId } })
      setIncidents((current) => current.filter((incident) => incident.id !== id))
    } catch {
      setError('Erro ao apagar o caso. Tente de novo.')
    }
  }

  function handleLogout() {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className="profile-container">
      <header>
        <img src={logoImg} alt="Be The Hero" />
        <span>Bem-vinda, {ongName}</span>

        <Link className="button" to="/incidents/new">
          Cadastrar novo caso
        </Link>
        <button onClick={handleLogout} type="button" aria-label="Sair">
          <FiPower size={18} color="#e02041" />
        </button>
      </header>

      <h1>Casos cadastrados</h1>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {incidents.length === 0 && !error && <p className="empty">Nenhum caso ainda. Cadastre o primeiro.</p>}

      <ul>
        {incidents.map((incident) => (
          <li key={incident.id}>
            <strong>CASO:</strong>
            <p>{incident.title}</p>

            <strong>DESCRIÇÃO:</strong>
            <p>{incident.description}</p>

            <strong>VALOR:</strong>
            <p>{money.format(incident.value)}</p>

            <button onClick={() => handleDeleteIncident(incident.id)} type="button" aria-label={`Apagar caso ${incident.title}`}>
              <FiTrash2 size={20} color="#a8a8b3" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
