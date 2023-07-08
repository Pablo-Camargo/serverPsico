import fastify, { FastifyInstance } from "fastify";

import { Cliente, PrismaClient, Prontuario, Psicologo } from "@prisma/client";
import { PsicologoRequest } from "./interface/PsicologoRequestInterface";
import { ClienteRequest } from "./interface/ClienteRequestInterface";
import { ProntuarioRequest } from "./interface/ProntuarioRequestInterface";

const app: FastifyInstance = fastify();
const prisma = new PrismaClient();

// Rota para listar todos os psicólogos
app.get("/psicologos", async (req, res) => {
  try {
    const psicologos: Psicologo[] | null = await prisma.psicologo.findMany();

    if (!psicologos) {
      res.status(404).send({ error: "Psicólogos não encontrados" });
      return;
    }
    res.send(psicologos);
  } catch (error) {
    console.error("Erro ao obter psicólogos:", error);
    res.status(500).send({ error: "Erro ao obter psicólogos" });
  }
});
// Rota para obter um psicólogo pelo ID
app.get<PsicologoRequest>("/psicologos/:psicologoId", async (req, res) => {
  try {
    const { psicologoId } = req.params;

    const psicologo: Psicologo | null = await prisma.psicologo.findUnique({
      where: { id: Number(psicologoId) },
    });

    if (!psicologo) {
      res.status(404).send({ error: "Psicólogo não encontrado" });
      return;
    }

    res.send(psicologo);
  } catch (error) {
    console.error("Erro ao obter psicólogo:", error);
    res.status(500).send({ error: "Erro ao obter psicólogo" });
  }
});

// Rota para listar todos os paciente de um psicólogo
app.get<ClienteRequest>("/psicologos/:clienteId/clientes", async (req, res) => {
  try {
    const { clienteId } = req.params;
    const pacientes: Cliente[] | null = await prisma.cliente.findMany({
      where: { psicologoId: Number(clienteId) },
    });

    if (!Array.isArray(pacientes) || pacientes.length === 0) {
      res.status(404).send({ error: "Pacientes não encontrados" });
      return;
    }
    res.send(pacientes);
  } catch (error) {
    console.error("Erro ao obter pacientes:", error);
    res.status(500).send({ error: "Erro ao obter pacientes" });
  }
});

// Rota para listar todos os prontuarios de um unico paciente
app.get<ProntuarioRequest>("/prontuarios/:clienteId", async (req, res) => {
  try {
    const { clienteId } = req.params;
    const prontuario: Prontuario[] | null = await prisma.prontuario.findMany({
      where: { clienteId: Number(clienteId) },
    });

    if (!Array.isArray(prontuario) || prontuario.length === 0) {
      res.status(404).send({ error: "Prontuarios não encontrados" });
      return;
    }
    res.send(prontuario);
  } catch (error) {
    console.error("Erro ao obter prontuarios:", error);
    res.status(500).send({ error: "Erro ao obter prontuarios" });
  }
});

// Rota para obter um prontuário pelo ID
app.get<ProntuarioRequest>(
  "/clientes/:clienteId/prontuarios/:prontuarioId",
  async (req, res) => {
    try {
      const { clienteId, prontuarioId } = req.params;

      const prontuario: Prontuario | null = await prisma.prontuario.findUnique({
        where: { id: Number(prontuarioId) },
        include: { cliente: true },
      });

      if (!prontuario || prontuario.clienteId !== Number(clienteId)) {
        res.status(404).send({ error: "Prontuário não encontrado" });
        return;
      }

      res.send(prontuario);
    } catch (error) {
      console.error("Erro ao obter prontuário:", error);
      res.status(500).send({ error: "Erro ao obter prontuário" });
    }
  }
);

// Rota para obter um cliente por id
app.get<PsicologoRequest>("/paciente/:pacienteId", async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const paciente: Cliente | null = await prisma.cliente.findUnique({
      where: { id: Number(pacienteId) },
    });

    if (!paciente) {
      res.status(404).send({ error: "paciente não encontrado" });
      return;
    }
    res.send(paciente);
  } catch (error) {
    console.error("Erro ao obter paciente:", error);
    res.status(500).send({ error: "Erro ao obter paciente" });
  }
});

// Rota para cadastrar um psicólogo
app.post<PsicologoRequest>("/registerPsicologos", async (req, res) => {
  try {
    const { nome, email, senha, whats } = req.body;

    const psicologo = await prisma.psicologo.create({
      data: {
        nome,
        email,
        senha,
        whats,
      },
    });

    res.send(psicologo);
  } catch (error) {
    console.error("Erro ao cadastrar psicólogo:", error);
    res.status(500).send({ error: "Erro ao cadastrar psicólogo" });
  }
});

// Rota para cadastrar um cliente para um psicólogo específico
app.post<ClienteRequest>(
  "/psicologos/:clienteId/clientes",
  async (req, res) => {
    try {
      const { clienteId } = req.params;
      const { nome, whats } = req.body;

      const cliente: Cliente = await prisma.cliente.create({
        data: {
          nome,
          whats,
          psicologo: { connect: { id: Number(clienteId) } },
        },
      });

      res.send(cliente);
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      res.status(500).send({ error: "Erro ao cadastrar cliente" });
    }
  }
);

// Rota para cadastrar um prontuário para um cliente específico
app.post<ProntuarioRequest>("/clientes/:id/prontuarios", async (req, res) => {
  try {
    const { id } = req.params;
    const { dataSessao, texto } = req.body;

    const prontuario: Prontuario = await prisma.prontuario.create({
      data: {
        dataSessao,
        texto,
        cliente: { connect: { id: Number(id) } },
      },
    });

    res.send(prontuario);
  } catch (error) {
    console.error("Erro ao cadastrar prontuário:", error);
    res.status(500).send({ error: "Erro ao cadastrar prontuário" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Verificar se o usuário com o email fornecido existe no banco de dados
    const psicologo: Psicologo | null = await prisma.psicologo.findUnique({
      where: { email },
    });

    // Verificar se o psicólogo existe e se a senha fornecida está correta
    if (!psicologo || psicologo.senha !== senha) {
      res.status(401).send({ error: "Credenciais inválidas" });
      return;
    }

    // Autenticação bem-sucedida
    res.send({ message: "Login bem-sucedido" });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res.status(500).send({ error: "Erro ao fazer login" });
  }
});

// Rota para atualizar os dados de um psicólogo
app.put<PsicologoRequest>("/psicologo/:id", async (req, res) => {
  try {
    const { psicologoId } = req.params;
    const { nome, email, senha, whats } = req.body;

    const psicologo: Psicologo | null = await prisma.psicologo.update({
      where: { id: Number(psicologoId) },
      data: {
        nome,
        email,
        senha,
        whats,
      },
    });
    res.send(psicologo);
  } catch (error) {
    console.error("Erro ao atualizar psicólogo", error);
    res.status(500).send({ error: "Erro ao atualizar psicólogo" });
  }
});

// Rota para atualizar os dados de um cliente
app.put<ClienteRequest>("/cliente/:id", async (req, res) => {
  try {
    const { clienteId } = req.params;
    const { nome, whats } = req.body;

    const psicologo: Psicologo | null = await prisma.psicologo.update({
      where: { id: Number(clienteId) },
      data: {
        nome,

        whats,
      },
    });
    res.send(psicologo);
  } catch (error) {
    console.error("Erro ao atualizar psicólogo", error);
    res.status(500).send({ error: "Erro ao atualizar psicólogo" });
  }
});
// Rota para excluir um cliente
app.delete<ClienteRequest>("/clientes/:clienteId", async (req, res) => {
  try {
    const { clienteId } = req.params;
    const deletedCliente: Cliente | null = await prisma.cliente.delete({
      where: { id: Number(clienteId) },
    });
    if (!deletedCliente) {
      res.status(404).send({ error: "Cliente não encontrado" });
      return;
    }
    res.send(deletedCliente);
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    res.status(500).send({ error: "Erro ao excluir cliente" });
  }
});
app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("🐱‍🏍 HTTP SERVER RUNNING ON http://localhost:3333");
  });
