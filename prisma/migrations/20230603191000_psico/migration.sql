/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Psicologo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "whats" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "psicologoId" INTEGER NOT NULL,
    "whats" TEXT NOT NULL,
    CONSTRAINT "Cliente_psicologoId_fkey" FOREIGN KEY ("psicologoId") REFERENCES "Psicologo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prontuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataSessao" DATETIME NOT NULL,
    "texto" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    CONSTRAINT "Prontuario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Psicologo_email_key" ON "Psicologo"("email");
