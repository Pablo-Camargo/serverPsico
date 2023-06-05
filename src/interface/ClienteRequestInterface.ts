export interface ClienteRequest {
  Params: { clienteId: number }
  Body: {
    nome: string
    whats: string
  }
}
