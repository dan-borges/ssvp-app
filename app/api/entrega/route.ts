// app/api/entrega/route.ts
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const { cpf, nome, paroquia } = body

        if (!cpf || !nome || !paroquia) {
            return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
        }

        const response = await axios.post(
            'https://api.retaguarda.net.br/public/index.php/ssvp/v1/entrega',
            { cpf, nome, paroquia },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            }
        )

        return NextResponse.json(response.data)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        console.error('Erro ao registrar entrega:', errorMessage)
        return NextResponse.json(
            { error: 'Erro ao registrar entrega.', detail: null },
            { status: 500 }
        )
    }
}
