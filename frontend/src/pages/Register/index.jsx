import { useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

import logoImg from '../../assets/logo.svg'
import api from '../../services/api.js'

import './styles.css'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', city: '', uf: '' })
  const [createdId, setCreatedId] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function handleRegister(e) {
    e.preventDefault()
    setError(null)
    try {
      const response = await api.post('ongs', form)
      setCreatedId(response.data.id)
    } catch {
      setError('Erro no cadastro. Confira os campos e tente de novo.')
    }
  }

  if (createdId) {
    return (
      <div className="register-container">
        <div className="content">
          <section>
            <img src={logoImg} alt="Be The Hero" />
            <h1>Cadastro feito</h1>
            <p>
              Seu ID de acesso é <strong data-testid="created-id">{createdId}</strong>. Guarde-o: é com ele que a ONG entra.
            </p>
            <button className="button" type="button" onClick={() => navigate('/')}>
              Ir para o logon
            </button>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="register-container">
      <div className="content">
        <section>
          <img src={logoImg} alt="Be The Hero" />

          <h1>Cadastro</h1>
          <p>Faça seu cadastro, entre na plataforma e ajude pessoas a encontrarem os casos da sua ONG.</p>

          <Link className="back-link" to="/">
            <FiArrowLeft size={16} color="#e02041" />
            Já tenho cadastro
          </Link>
        </section>

        <form onSubmit={handleRegister}>
          <input placeholder="Nome da ONG" aria-label="Nome da ONG" value={form.name} onChange={set('name')} />
          <input type="email" placeholder="E-mail" aria-label="E-mail" value={form.email} onChange={set('email')} />
          <input placeholder="WhatsApp" aria-label="WhatsApp" value={form.whatsapp} onChange={set('whatsapp')} />

          <div className="input-group">
            <input placeholder="Cidade" aria-label="Cidade" value={form.city} onChange={set('city')} />
            <input placeholder="UF" aria-label="UF" style={{ width: 80 }} maxLength={2} value={form.uf} onChange={set('uf')} />
          </div>
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
