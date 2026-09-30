import { useState } from 'react'
import { FiLogIn } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

import heroesImg from '../../assets/heroes.png'
import logoImg from '../../assets/logo.svg'
import api from '../../services/api.js'

import './styles.css'

export default function Logon() {
  const [id, setId] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setError(null)
    try {
      const response = await api.post('sessions', { id })
      localStorage.setItem('ongId', id)
      localStorage.setItem('ongName', response.data.name)
      navigate('/profile')
    } catch {
      setError('Falha no login. Confira o ID e tente de novo.')
    }
  }

  return (
    <div className="logon-container">
      <section className="form">
        <img src={logoImg} alt="Be The Hero" />

        <form onSubmit={handleLogin}>
          <h1>Faça seu logon</h1>

          <input placeholder="Sua ID" aria-label="ID da ONG" value={id} onChange={(e) => setId(e.target.value)} />
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}

          <button className="button" type="submit">
            Entrar
          </button>

          <Link className="back-link" to="/register">
            <FiLogIn size={16} color="#e02041" />
            Não tenho cadastro
          </Link>
        </form>
      </section>

      <img src={heroesImg} alt="" />
    </div>
  )
}
