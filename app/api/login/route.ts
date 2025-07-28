// app/api/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: NextRequest) {
    try {
        const { login, senha } = await req.json()

        const response = await axios.post(
            'https://api.retaguarda.net.br/public/index.php/ssvp/v1/login',
            {
                login,
                senha,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }

            }
        )

        return NextResponse.json(response.data)
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        console.error('Erro no proxy login:', errorMessage)
        return NextResponse.json(
            { error: 'Erro ao fazer login', detail: null },
            { status: 500 }
        )
    }
}
