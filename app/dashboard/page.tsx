'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import axios from 'axios'
import { aplicarMascaraCPF, removerMascaraCPF } from '@/lib/cpf'

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
    const [confirmandoRetirada, setConfirmandoRetirada] = useState(false)
    const paroquiaLocal = localStorage.getItem('paroquia') || '';

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
            const cpfLimpo = removerMascaraCPF(cpf)
            const response = await axios.get<Registro[]>(`/api/dashboard?cpf=${cpfLimpo}`);

            if (response.data.length > 0) {
                const registrosOrdenados = response.data.sort((a, b) => {
                    const dataA = new Date(a.data.split('/').reverse().join('-'))
                    const dataB = new Date(b.data.split('/').reverse().join('-'))
                    return dataB.getTime() - dataA.getTime()
                })
                setRegistros(registrosOrdenados)
            } else {
                setErro('Nenhum registro encontrado.')
                setShowCadastro(true)
            }
        } catch (err: unknown) {
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
            const cpfLimpo = removerMascaraCPF(cpf)
            await axios.post('/api/entrega', {
                cpf: cpfLimpo,
                nome: nome,
                paroquia: parseInt(paroquiaId)
            })
            setShowCadastro(false)
            setNome('')
            buscarRegistro() // rebusca após cadastrar
        } catch (error: unknown) {
            setErro('Erro ao cadastrar nova pessoa.')
        }
    }

    async function confirmarRetirada(registroId: number) {
        setErro('')
        setConfirmandoRetirada(true)
        const paroquiaId = localStorage.getItem('paroquiaId')

        if (!paroquiaId) {
            setErro('ID da paróquia não encontrado.')
            setConfirmandoRetirada(false)
            return
        }

        try {
            // Usa a mesma API de cadastrarPessoa com os dados do primeiro registro
            const cpfLimpo = removerMascaraCPF(registros[0].cpf)
            await axios.post('/api/entrega', {
                cpf: cpfLimpo,
                nome: registros[0].nome,
                paroquia: parseInt(paroquiaId)
            })
            
            alert('Retirada confirmada com sucesso!')
            // Rebusca os registros para atualizar a lista
            buscarRegistro()
            
        } catch (error: unknown) {
            setErro('Erro ao confirmar retirada.')
        } finally {
            setConfirmandoRetirada(false)
        }
    }

    function extrairMes(data: string): string {
        try {
            // Para datas no formato DD/MM/YYYY, precisamos converter para MM/DD/YYYY
            const partes = data.split('/')
            if (partes.length === 3) {
                const dia = partes[0]
                const mes = partes[1]
                const ano = partes[2]
                // Criar data no formato MM/DD/YYYY
                const dataFormatada = `${mes}/${dia}/${ano}`
                const dataObj = new Date(dataFormatada)
                const mesNome = dataObj.toLocaleDateString('pt-BR', { month: 'long' })
                return mesNome.charAt(0).toUpperCase() + mesNome.slice(1) // Primeira letra maiúscula
            }
            return 'Mês'
        } catch {
            return 'Mês'
        }
    }

    function temRegistroNoMesAtual(registros: Registro[]): boolean {
        const hoje = new Date()
        const mesAtual = hoje.getMonth() + 1 // getMonth() retorna 0-11
        const anoAtual = hoje.getFullYear()
        
        return registros.some(registro => {
            const partes = registro.data.split('/')
            if (partes.length === 3) {
                const mesRegistro = parseInt(partes[1])
                const anoRegistro = parseInt(partes[2])
                return mesRegistro === mesAtual && anoRegistro === anoAtual
            }
            return false
        })
    }

    return (
        <div className="max-w-md mx-auto p-6 space-y-4">
            <div className="flex justify-center mb-4">
                <img 
                    src="/assets/ssvp_logo.png" 
                    alt="SSVP Logo" 
                    className="h-32 w-auto"
                />
            </div>
            <div className="flex flex-col items-center justify-center"> 
                <h1 className="text-xl font-bold text-center"> {paroquiaLocal} </h1>
                <p className="text-md font-bold text-center"> Registrar Entrega </p>
            </div>

            <div className="flex gap-2">
                <Input
                    placeholder="Digite o CPF"
                    value={cpf}
                    onChange={(e) => setCpf(aplicarMascaraCPF(e.target.value))}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading) {
                            buscarRegistro()
                        }
                    }}
                    maxLength={14}
                />
                <Button onClick={buscarRegistro} disabled={loading}>
                    {loading ? 'Buscando...' : 'Buscar'}
                </Button>
            </div>

            {erro && <p className="text-red-500">{erro}</p>}

            {showCadastro && (
                <div className="border border-yellow-400 bg-yellow-50 p-4 rounded space-y-2 mt-4">
                    <p>CPF não encontrado. Deseja cadastrar?</p>
                    <Input
                        placeholder="Digite o nome e sobrenome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                    />
                    <Button onClick={cadastrarPessoa} className="w-full">
                        Cadastrar Pessoa
                    </Button>
                </div>
            )}

            {registros.length > 0 && (
                <div className="space-y-2 mt-4">
                    <Card className="py-3 px-4">
                        <CardHeader className="flex flex-row items-center justify-between p-0">
                            <div>
                                <CardTitle>
                                    {registros[0].nome}
                                </CardTitle>
                                <div className="p-0">
                                    {aplicarMascaraCPF(registros[0].cpf)}
                                </div>
                            </div>
                            <Button 
                                onClick={() => confirmarRetirada(registros[0].id)}
                                disabled={confirmandoRetirada || temRegistroNoMesAtual(registros)}
                                className={`${
                                    temRegistroNoMesAtual(registros) 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-green-600 hover:bg-green-700'
                                } text-white`}
                            >
                                {confirmandoRetirada 
                                    ? 'Confirmando...' 
                                    : temRegistroNoMesAtual(registros) 
                                        ? 'Já retirado este mês' 
                                        : 'Confirmar Retirada'
                                }
                            </Button>
                        </CardHeader>
                    </Card>

                    {registros.map((registro) => {

                        const mesmaParoquia = registro.paroquia === paroquiaLocal;
                        const corBg = mesmaParoquia ? 'bg-green-100' : 'bg-red-100';
                        const corBorder = mesmaParoquia ? 'border-green-300' : 'border-red-300';
                        
                        return (
                            <Card key={registro.id} className={`${corBg} ${corBorder}`}>
                                <CardContent className="flex items-center justify-between px-4">
                                    <div className="space-y-2 text-sm">
                                        <p>
                                        <strong className="text-xl font-bold text-gray-700"> 
                                            {registro.paroquia}</strong>
                                        </p>
                                        <p>
                                        Retirada: <strong className="text-xl font-bold text-gray-700"> 
                                            {registro.data}</strong>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-gray-700">
                                            {extrairMes(registro.data)}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    )
}
