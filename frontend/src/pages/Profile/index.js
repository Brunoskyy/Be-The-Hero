import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

import { Link, useHistory } from 'react-router-dom'
import { FiPower, FiTrash2 } from 'react-icons/fi'

import api from '../../services/api'

import './styles.css'

import logoImg from '../../assets/logo.svg'

const socket = io('http://localhost:3333')
socket.on('connect', () => console.log('[IO] Connect => A new Connection in Profile'))


// Recebe os dados enviados do Server em Real time, está fora da função para não ficar executando 2 vezes
// socket.on('Send data', socketData => {
//     console.log(socketData)
// })

export default function Profile() {
    const [incidents, setIncidents] = useState([])

    const history = useHistory()
    const ongId = localStorage.getItem('ongId')
    const ongName = localStorage.getItem('ongName')

     useEffect(() => {
         api.get('/profile', {
             headers: {
                 Authorization: ongId
             }
         }).then(response => {
            setIncidents(response.data)
         })
     }, [ongId])

     socket.on('Send data', socketData => {
        api.get('/profile', {
            headers: {
                Authorization: ongId
            }
        }).then(response => {
           setIncidents(response.data)
        })
    })

     async function handleDeleteIncident(id) {
         try {
            await api.delete(`incidents/${id}`, {
                headers: {
                    Authorization: ongId,
                }
            })

            setIncidents(incidents.filter(incident => incident.id !== id))
         } catch(err) {
            alert('Erro ao deletar caso, tente novamente.')
         }
     }

     function handleLogout() {
         localStorage.clear()

         history.push('/')
     }

    return (
        <div className="profile-container">
            <header>
                <img src={logoImg} alt="Be The Hero"/>
                <span>Bem vinda, {ongName}</span>

                <Link className="button" to="/incidents/new">Cadastrar novo caso</Link>
                <button onClick={handleLogout} type="button">
                    <FiPower size={18} color="#e02041"/>
                </button>
            </header>

            <h1>Casos cadastrados</h1>

            <ul>
                {incidents.map(incident => (
                    <li key={incident.id}>
                    <strong>CASO:</strong>
                    <p>{incident.title}</p>
                    
                    <strong>DESCRIÇÃO:</strong>
                    <p>{incident.description}</p>

                    <strong>VALOR:</strong>
                    <p>{Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(incident.value)}</p>

                    <button onClick={() => handleDeleteIncident(incident.id)} type="button">
                        <FiTrash2 size={20} color="#a8a8b3"/>
                    </button>
                </li>
                ))}
            </ul>
        </div>
    )
}