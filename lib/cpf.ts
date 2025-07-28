export function aplicarMascaraCPF(cpf: string): string {
    // Remove todos os caracteres não numéricos
    const cpfLimpo = cpf.replace(/\D/g, '')
    
    // Aplica a máscara XXX.XXX.XXX-XX
    return cpfLimpo
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14) // Limita a 14 caracteres (incluindo pontos e hífen)
}

export function removerMascaraCPF(cpf: string): string {
    return cpf.replace(/\D/g, '')
}
