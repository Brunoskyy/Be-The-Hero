import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import api from '../services/api.js'
import Logon from '../pages/Logon/index.jsx'
import Profile from '../pages/Profile/index.jsx'

vi.mock('../services/socket.js', () => ({
  getSocket: () => ({ on: vi.fn(), off: vi.fn(), emit: vi.fn() }),
}))

function renderAt(path, routes) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>{routes}</Routes>
    </MemoryRouter>,
  )
}

describe('Logon', () => {
  it('stores the session and goes to the profile', async () => {
    vi.spyOn(api, 'post').mockResolvedValue({ data: { name: 'APAD' } })
    vi.spyOn(api, 'get').mockResolvedValue({ data: [] })
    const user = userEvent.setup()
    renderAt('/', [<Route key="l" path="/" element={<Logon />} />, <Route key="p" path="/profile" element={<Profile />} />])
    await user.type(screen.getByLabelText('ID da ONG'), 'abcd1234')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Bem-vinda, APAD')).toBeInTheDocument()
    expect(localStorage.getItem('ongId')).toBe('abcd1234')
    expect(api.post).toHaveBeenCalledWith('sessions', { id: 'abcd1234' })
  })

  it('shows an error instead of navigating when the id is unknown', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(new Error('400'))
    const user = userEvent.setup()
    renderAt('/', [<Route key="l" path="/" element={<Logon />} />])
    await user.type(screen.getByLabelText('ID da ONG'), 'nope')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/Falha no login/)
    expect(localStorage.getItem('ongId')).toBeNull()
  })
})

describe('Profile', () => {
  it('lists the NGO’s incidents and deletes one', async () => {
    localStorage.setItem('ongId', 'abcd1234')
    localStorage.setItem('ongName', 'APAD')
    vi.spyOn(api, 'get').mockResolvedValue({
      data: [
        { id: 1, title: 'Cadela atropelada', description: 'Cirurgia', value: 120 },
        { id: 2, title: 'Gato preso', description: 'Resgate', value: 40.5 },
      ],
    })
    const del = vi.spyOn(api, 'delete').mockResolvedValue({})
    const user = userEvent.setup()
    renderAt('/profile', [<Route key="p" path="/profile" element={<Profile />} />])
    expect(await screen.findByText('Cadela atropelada')).toBeInTheDocument()
    expect(screen.getByText('R$ 40,50')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/profile', { headers: { Authorization: 'abcd1234' } })

    await user.click(screen.getByRole('button', { name: 'Apagar caso Gato preso' }))
    await waitFor(() => expect(screen.queryByText('Gato preso')).toBeNull())
    expect(del).toHaveBeenCalledWith('incidents/2', { headers: { Authorization: 'abcd1234' } })
  })

  it('sends a visitor without a session back to the logon', async () => {
    renderAt('/profile', [<Route key="p" path="/profile" element={<Profile />} />, <Route key="l" path="/" element={<Logon />} />])
    expect(await screen.findByText('Faça seu logon')).toBeInTheDocument()
  })
})
