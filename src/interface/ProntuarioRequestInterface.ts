export interface ProntuarioRequest {
  Params: { id: number; clienteId: number; prontuarioId: number }
  Body: {
    dataSessao: Date
    texto: string
  }
}
