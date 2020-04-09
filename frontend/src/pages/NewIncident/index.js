import React, { useState } from 'react'
import io from 'socket.io-client'

import {Link, useHistory} from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi';

import './styles.css'

import logoImg from '../../assets/logo.svg';
import api from '../../services/api';
  
const socket = io('http://localhost:3333')
socket.on('connect', () => console.log('[IO] Connect => A new Connection in New Incident'))

export default function NewIncident(){
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [value, setValue] = useState('')

  const history = useHistory()
  
  const ongId = localStorage.getItem('ongId')

  async function handleNewIncident(e){
    e.preventDefault()

    const data = {title, description, value}

    socket.emit('Generated New incident', data)
    try {
      await api.post('incidents', data, {
        headers: {
          Authorization: ongId
        }
      })

      history.push('/profile')
    } catch(err){
      alert('Não foi possível cadastrar o novo casa, tente novamente.')
    }
  }

  return(
    <div className="new-incident-container">
      <div className="content">
        <section>
        <img src={logoImg} alt="Be The Hero"/>

        <h1>Cadastrar novo caso</h1>
        <p>Descreva o caso detalhadamente para encontrar um herói para resolver isso.</p>

        <Link className="back-link" to="/profile">
            <FiArrowLeft size={16} color="#E02041" />
            Voltar para home
          </Link>
        </section>

        <form onSubmit={handleNewIncident}>
          <input type="text" placeholder="Título do caso" value={title} onChange={e => setTitle(e.target.value)}/>
          <textarea placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)}/>
          <input placeholder="Valor em reais" value={value} onChange={e => setValue(e.target.value)}/>

          <button className="button" type="submit">Cadastrar</button>
        </form>
      </div>
    </div>
  )
}