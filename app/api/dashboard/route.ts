// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function GET(req: NextRequest) {
    const url = req.nextUrl
    const cpf = url.searchParams.get('cpf')

    if (!cpf) {
        return NextResponse.json({ error: 'CPF não informado' }, { status: 400 })
    }

    try {
        const response = await axios.get(
            `https://api.retaguarda.net.br/public/index.php/ssvp/v1/registros/${cpf}`,
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
        console.error('Erro no proxy dashboard:', errorMessage)
        return NextResponse.json(
            { error: 'Erro ao buscar registros', detail: null },
            { status: 500 }
        )
    }
}
