export interface PsicologoRequest {
  Params: {
    psicologoId: number
  }
  Body: { nome: string; email: string; senha: string; whats: string }
}
