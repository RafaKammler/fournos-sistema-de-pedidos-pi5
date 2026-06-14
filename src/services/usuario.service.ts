import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const UsuarioService = {
    async buscarTodos() {
        return prisma.usuario.findMany({
            orderBy: {dataCadastro: 'desc'},
            select: {
                id: true,
                nome: true,
                email: true,
                perfil: true,
                dataCadastro: true
            }
        });
    },

    async buscarPorId(id: number) {
        return prisma.usuario.findUnique({
            where: {id},
            select: {id: true, nome: true, email: true, perfil: true}
        });
    },

    async criar(data: any) {
        if (!data.nome || !data.email || !data.senha || !data.perfil) {
            throw new Error("Campos obrigatórios faltando.")
        }

        const emailExistente = await prisma.usuario.findUnique({
            where: { email: data.email }
        })

        if (emailExistente) {
            throw new Error("Este email já está em uso.")
        }

        const senhaHash = await bcrypt.hash(data.senha, 10)

        // Se o perfil for GERENTE, usamos nested writes para criar ambos ao mesmo tempo
        const userData: any = {
            nome: data.nome,
            email: data.email,
            senha: senhaHash,
            perfil: data.perfil
        }

        if (data.perfil === "GERENTE" && data.estabelecimentoId) {
            userData.gerente = {
                create: {
                    estabelecimentoId: parseInt(data.estabelecimentoId)
                }
            }
        }

        return prisma.usuario.create({
            data: userData
        });
    },

    async atualizar(id: number, data: any) {
        if (!data.nome || !data.email || !data.perfil) {
            throw new Error("Campos obrigatórios faltando.")
        }

        const emailExistente = await prisma.usuario.findFirst({
            where: { email: data.email, NOT: { id } }
        })

        if (emailExistente) {
            throw new Error("Este email já está em uso.")
        }

        const updateData: any = {
            nome: data.nome,
            email: data.email,
            perfil: data.perfil
        }

        if (data.senha && data.senha.trim() !== "") {
            updateData.senha = await bcrypt.hash(data.senha, 10)
        }

        if (data.perfil === "GERENTE" && data.estabelecimentoId) {
            updateData.gerente = {
                upsert: {
                    create: { estabelecimentoId: parseInt(data.estabelecimentoId) },
                    update: { estabelecimentoId: parseInt(data.estabelecimentoId) }
                }
            }
        } else {
            updateData.gerente = {
                delete: true
            }
        }

        if (data.perfil !== "GERENTE") {
            const isManager = await prisma.gerente.findUnique({ where: { usuarioId: id }})
            if (isManager) {
                await prisma.gerente.delete({ where: { usuarioId: id }})
            }
            delete updateData.gerente // Removemos para o prisma.update não tentar deletar novamente
        }

        return prisma.usuario.update({
            where: {id},
            data: updateData
        });
    },

    async excluir(id: number) {
        const usuario = await prisma.usuario.findUnique({
            where: { id },
            include: { gerente: true }
        })

        if (!usuario) {
            throw new Error("Usuário não encontrado.")
        }

        if (usuario.gerente) {
            await prisma.gerente.delete({
                where: { usuarioId: id }
            })
        }

        return prisma.usuario.delete({
            where: {id}
        });
    }
}