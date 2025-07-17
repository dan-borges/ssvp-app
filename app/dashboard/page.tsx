'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import axios from 'axios'

interface Registro {
    id: number
    cpf: string
    nome: string
    paroquia: string
    data: string
}

export default function ConsultaRegistro() {
    const router = useRouter()

    const [cpf, setCpf] = useState('')
    const [registros, setRegistros] = useState<Registro[]>([])
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState('')

    const [showCadastro, setShowCadastro] = useState(false)
    const [nome, setNome] = useState('')

    useEffect(() => {
        const paroquia = localStorage.getItem('paroquiaId')
        const expiresAt = localStorage.getItem('sessionExpiresAt')
        if (!paroquia || !expiresAt || new Date() > new Date(expiresAt)) {
            localStorage.removeItem('paroquia')
            localStorage.removeItem('sessionExpiresAt')
            localStorage.removeItem('paroquiaId')
            router.push('/login')
        }
    }, [router])

    async function buscarRegistro() {
        setErro('')
        setRegistros([])
        setShowCadastro(false)
        setLoading(true)

        try {
            const response = await axios.get<Registro[]>(`/api/dashboard?cpf=${cpf}`);


            if (response.data.length > 0) {
                setRegistros(response.data)
            } else {
                setErro('Nenhum registro encontrado.')
                setShowCadastro(true)
            }
        } catch (err) {
            setErro('Erro ao buscar registro.')
            setShowCadastro(true)
        } finally {
            setLoading(false)
        }
    }

    async function cadastrarPessoa() {
        setErro('')
        const paroquiaId = localStorage.getItem('paroquiaId')

        if (!paroquiaId) {
            setErro('ID da paróquia não encontrado.')
            return
        }

        try {
            await axios.post('/api/entrega', {
                cpf: cpf,
                nome: nome,
                paroquia: parseInt(paroquiaId)
            })
            setShowCadastro(false)
            setNome('')
            buscarRegistro() // rebusca após cadastrar
        } catch (error) {
            setErro('Erro ao cadastrar nova pessoa.')
        }
    }

    return (
        <div className="max-w-md mx-auto p-6 space-y-4">
            <h1 className="text-xl font-bold text-center">Consultar Registro</h1>

            <div className="flex gap-2">
                <Input
                    placeholder="Digite o CPF"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                />
                <Button onClick={buscarRegistro} disabled={loading}>
                    {loading ? 'Buscando...' : 'Buscar'}
                </Button>
            </div>

            {erro && <p className="text-red-500">{erro}</p>}

            {showCadastro && (
                <div className="border border-yellow-400 bg-yellow-50 p-4 rounded space-y-2 mt-4">
                    <p>CPF não encontrado. Deseja cadastrar uma nova pessoa?</p>
                    <Input
                        placeholder="Nome completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                    <Button onClick={cadastrarPessoa} className="w-full">
                        Cadastrar Pessoa
                    </Button>
                </div>
            )}

            {registros.length > 0 && (
                <div className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {registros[0].nome} - {registros[0].cpf}
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    {registros.map((registro) => (
                        <Card key={registro.id}>
                            <CardContent className="space-y-2 text-sm">
                                <p>
                                    <strong>Paróquia:</strong> {registro.paroquia}
                                </p>
                                <p>
                                    <strong>Retirada:</strong> {registro.data}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
