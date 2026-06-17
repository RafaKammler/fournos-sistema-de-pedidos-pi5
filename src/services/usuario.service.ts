import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const UsuarioService = {
    async buscarTodos() {
        return prisma.usuario.findMany({
            orderBy: { dataCadastro: 'desc' },
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
            where: { id },
            select: {
                id: true,
                nome: true,
                email: true,
                perfil: true,
                gerente: {
                    include: {
                        estabelecimentos: true
                    }
                }
            }
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

        const userData: any = {
            nome: data.nome,
            email: data.email,
            senha: senhaHash,
            perfil: data.perfil
        }

        if (data.perfil === "GERENTE") {
            const idsParaConectar = Array.isArray(data.estabelecimentoIds)
                ? data.estabelecimentoIds.map((id: string) => ({ id: parseInt(id) }))
                : [];

            userData.gerente = {
                create: {
                    estabelecimentos: {
                        connect: idsParaConectar
                    }
                }
            }
        }

        const novoUsuario = await prisma.usuario.create({
            data: userData,
            include: { gerente: true }
        });


        return novoUsuario;
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

        if (data.perfil === "GERENTE") {
            const idsParaConectar = Array.isArray(data.estabelecimentoIds)
                ? data.estabelecimentoIds.map((id: string) => ({ id: parseInt(id) }))
                : [];

            updateData.gerente = {
                upsert: {
                    create: {
                        estabelecimentos: {
                            connect: idsParaConectar
                        }
                    },
                    update: {
                        estabelecimentos: {
                            set: idsParaConectar // O 'set' remove as conexões antigas e aplica apenas as marcadas no checkbox
                        }
                    }
                }
            }
        }

        const usuarioAtualizado = await prisma.usuario.update({
            where: { id },
            data: updateData,
            include: { gerente: true }
        });

        if (data.perfil !== "GERENTE") {
            const isManager = await prisma.gerente.findUnique({ where: { usuarioId: id } })
            if (isManager) {
                await prisma.gerente.delete({ where: { usuarioId: id } })
            }
        }

        return usuarioAtualizado;
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
            where: { id }
        });
    }
}