'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()

  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  async function handleLogin() {
    setErro('')
    try {
      const response = await axios.post('/api/login', {
        login,
        senha,
      })

      const token = response.data?.token

      const dados = response.data

      if (dados?.id) {
        localStorage.setItem('paroquiaId', String(dados.id))
        localStorage.setItem('paroquia', dados.paroquia)
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        localStorage.setItem('sessionExpiresAt', expiresAt)
        router.push('/dashboard')
      } else {
        setErro('Credenciais inválidas.')
      }

    } catch (err) {
      setErro('Erro ao fazer login.')
      console.error(err)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen px-4">
      <div className="w-full max-w-sm space-y-4 p-6 border rounded">
        <h1 className="text-xl font-bold text-center">Login</h1>

        <Input
          placeholder="Usuário"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        {erro && <p className="text-red-500 text-sm">{erro}</p>}

        <Button className="w-full" onClick={handleLogin}>
          Entrar
        </Button>
      </div>
    </div>
  )
}
