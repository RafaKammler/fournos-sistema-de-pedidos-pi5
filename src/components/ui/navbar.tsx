"use client";

import { Menu, X, LogOut, ShoppingCart, LayoutDashboard, Trash2, Bell } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useLocationTime } from "@/app/hooks/useLocationTime";
import { logoutAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCartStore } from "@/store/cartStore";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

interface MenuItem {
    title: string;
    url: string;
}

interface NavbarProps {
    logo?: { url: string; src: string; alt: string; title: string; };
    menu?: MenuItem[];
    auth?: { login: { title: string; url: string }; signup: { title: string; url: string }; };
    perfil?: string | null;
}

interface Notificacao {
    id: number;
    titulo: string;
    mensagem: string;
    pedidoId?: number;
}

const AnimatedNavLink = ({ item, isActive = false }: { item: MenuItem; isActive?: boolean; }) => {
    return (
        <a href={item.url} className="relative group flex flex-col overflow-hidden h-5 items-center" style={{ perspective: "100px" }}>
            <span className={`text-sm tracking-wide transition-all duration-300 ease-out group-hover:-translate-y-full group-hover:opacity-0 ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`} style={{ transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)" }}>
                {item.title}
            </span>
            <span className={`absolute top-full text-sm tracking-wide font-medium text-foreground transition-all duration-300 ease-out group-hover:-translate-y-full group-hover:opacity-100 opacity-0 translate-y-0`} style={{ transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)" }} aria-hidden>
                {item.title}
            </span>
            {isActive && <span className="absolute bottom-0 left-0 w-full h-px bg-foreground" />}
        </a>
    );
};

const Navbar = ({
                    logo = { url: "/home", src: "/img.png", alt: "logo", title: "Fournos" },
                    menu = [{title: "Home", url: "/home"}, {title: "Categorias", url: "/home#categorias"},
                        {title: "Meus Pedidos", url: "/restrito/meus-pedidos"}],
                    auth = { login: { title: "Login", url: "/login" }, signup: { title: "Cadastrar", url: "/register" } },
                    perfil = null,
                }: NavbarProps) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { location, time, loading } = useLocationTime();
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const [isMounted, setIsMounted] = useState<boolean>(false);

    // Estados para Notificações
    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [notificacoesAntigas, setNotificacoesAntigas] = useState<Notificacao[]>([]);
    const [menuNotifAberto, setMenuNotifAberto] = useState(false);

    const isLogado = !!perfil;

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(() => true);
    }, []);

    // Polling de Notificações
    useEffect(() => {
        if (isMounted && isLogado) {
            const buscarNotificacoes = async () => {
                try {
                    const res = await fetch("/api/notificacoes");
                    if (res.ok) {
                        const data = await res.json();
                        setNotificacoes(data);
                    }
                } catch (err) {
                    console.error("Erro ao carregar notificações", err);
                }
            };

            buscarNotificacoes();
            const interval = setInterval(buscarNotificacoes, 15000); // Atualiza a cada 15s
            return () => clearInterval(interval);
        }
    }, [isMounted, isLogado]);

    const { items, removeItem } = useCartStore();
    const totalItems = items.reduce((acc, item) => acc + item.quantidade, 0);

    const valorTotal = items.reduce((acc, item) => {
        const totalComplementos = item.complementos?.reduce((cAcc, c) => cAcc + (c.preco * c.quantidade), 0) || 0;
        return acc + ((item.precoBase + totalComplementos) * item.quantidade);
    }, 0);

    const locationDisplay = loading ? "..." : `${location}  /  ${time}`;

    const handleLogout = () => {
        startTransition(() => {
            logoutAction();
        });
    };

    const handleAbrirNotificacoes = () => {
        const vaiAbrir = !menuNotifAberto;
        setMenuNotifAberto(vaiAbrir);

        if (!vaiAbrir) {
            setNotificacoesAntigas([]);
        }
    };

    const handleMarcarComoLidas = async () => {
        try {
            await fetch("/api/notificacoes", { method: "PUT" });
            setNotificacoesAntigas((prev) => [...notificacoes, ...prev]);
            setNotificacoes([]);
        } catch (error) {
            console.error("Erro ao limpar notificações", error);
        }
    };


    const handleClicarNotificacao = (n: Notificacao) => {
        setMenuNotifAberto(false); // Fecha o menu primeiro

        const textoCompleto = (n.titulo + " " + n.mensagem).toLowerCase();

        if (perfil === "GERENTE" && (textoCompleto.includes("novo") || textoCompleto.includes("recebido") || textoCompleto.includes("chegou"))) {
            router.push("/restrito/gerente");
            return;
        }

        if (n.pedidoId) {
            router.push(`/restrito/pedidos/${n.pedidoId}`);
            return;
        }

        const match = (n.titulo + " " + n.mensagem).match(/#(\d+)/);
        if (match && match[1]) {
            router.push(`/restrito/pedidos/${match[1]}`);
            return;
        }

        if (perfil === "GERENTE") {
            router.push("/restrito/gerente");
        } else if (perfil === "ADMIN") {
            router.push("/restrito/admin");
        } else {
            router.push("/restrito/meus-pedidos");
        }
    };

    const carrinhoConteudo = (
        <SheetContent className="w-full sm:max-w-md flex flex-col bg-background p-0 z-[100]">
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
                <SheetTitle className="text-lg font-bold tracking-tight">Seu Pedido</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
                        <ShoppingCart className="size-12 opacity-20" />
                        <p className="text-sm">Seu carrinho está vazio</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {items.map((item) => {
                            const totalComplementos = item.complementos?.reduce((acc, c) => acc + (c.preco * c.quantidade), 0) || 0;
                            const precoFinalItem = item.precoBase + totalComplementos;

                            return (
                                <div key={item.cartItemId} className="flex items-center justify-between pb-4 border-b border-border/40 last:border-0 last:pb-0">
                                    <div className="flex-1 pr-4">
                                        <h4 className="font-medium text-base mb-1">{item.nome}</h4>

                                        {item.complementos && item.complementos.length > 0 && (
                                            <div className="flex flex-col mb-1">
                                                {item.complementos.map(c => (
                                                    <span key={c.id} className="text-xs text-muted-foreground">
                                                        + {c.quantidade}x {c.nome}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-sm text-muted-foreground mt-1">
                                            {item.quantidade}x <span className="ml-1">R$ {precoFinalItem.toFixed(2).replace('.', ',')}</span>
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-3">
                                        <p className="font-semibold text-sm text-primary">
                                            R$ {(precoFinalItem * item.quantidade).toFixed(2).replace('.', ',')}
                                        </p>
                                        <button
                                            onClick={() => removeItem(item.cartItemId)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer p-2 rounded-md"
                                            title="Remover item"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {items.length > 0 && (
                <div className="border-t border-border/50 p-6 pt-5 mt-auto bg-background">
                    <div className="flex items-center justify-between mb-5">
                        <span className="text-sm font-bold text-muted-foreground">Total do pedido</span>
                        <span className="font-bold text-xl text-primary">R$ {valorTotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <Button
                        className="w-full h-11 text-base font-semibold rounded-xl transition-transform active:scale-[0.98] cursor-pointer"
                        onClick={() => {
                            if (isLogado) {
                                router.push("/checkout")
                            } else {
                                toast.info("Faça login para continuar", {
                                    description: "Você precisa de uma conta para finalizar o pedido."
                                })
                                router.push(auth.login.url)
                            }
                        }}
                    >
                        Avançar
                    </Button>
                </div>
            )}
        </SheetContent>
    );

    const notificacoesConteudo = isMounted && isLogado ? (
        <div className="relative">
            <button
                onClick={handleAbrirNotificacoes}
                className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center justify-center relative"
            >
                <Bell className="size-5" />
                {notificacoes.length > 0 && (
                    <span className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-pulse">
                        {notificacoes.length}
                    </span>
                )}
            </button>

            {menuNotifAberto && (
                <div className="absolute right-0 mt-2 w-80 bg-card border rounded-xl shadow-lg py-2 z-50 text-left overflow-hidden">
                    <div className="px-4 py-2 border-b flex justify-between items-center bg-muted/10">
                        <span className="font-semibold text-sm">Notificações</span>
                        {notificacoes.length > 0 && (
                            <button
                                onClick={handleMarcarComoLidas}
                                className="text-xs text-primary hover:underline cursor-pointer font-medium"
                            >
                                Marcar como lidas
                            </button>
                        )}
                    </div>

                    <div className="max-h-[22rem] overflow-y-auto">
                        {notificacoes.length === 0 && notificacoesAntigas.length === 0 ? (
                            <div className="py-8 text-center px-4">
                                <Bell className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Você não tem novas notificações.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">

                                {/* BLOCO: NOVAS */}
                                {notificacoes.length > 0 && (
                                    <>
                                        <div className="px-4 py-1.5 bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b">
                                            Novas
                                        </div>
                                        <div className="divide-y divide-border">
                                            {notificacoes.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => handleClicarNotificacao(n)}
                                                    className="p-3 bg-primary/5 hover:bg-primary/10 transition-colors border-l-2 border-primary cursor-pointer"
                                                >
                                                    <p className="text-sm font-bold text-foreground leading-tight mb-0.5">{n.titulo}</p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">{n.mensagem}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* BLOCO: ANTIGAS */}
                                {notificacoesAntigas.length > 0 && (
                                    <>
                                        <div className="px-4 py-1.5 bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-t first:border-t-0">
                                            Anteriores
                                        </div>
                                        <div className="divide-y divide-border">
                                            {notificacoesAntigas.map((n, i) => (
                                                <div
                                                    key={n.id || `antiga-${i}`}
                                                    onClick={() => handleClicarNotificacao(n)}
                                                    className="p-3 opacity-60 hover:opacity-100 hover:bg-muted/30 transition-all cursor-pointer"
                                                >
                                                    <p className="text-sm font-semibold text-foreground leading-tight mb-0.5">{n.titulo}</p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">{n.mensagem}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    ) : null;

    return (
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-6">
                {/* Desktop */}
                <nav className="hidden lg:flex items-center justify-between h-16 relative">
                    <a href={logo.url} className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
                        <img
                            src={logo.src}
                            alt={logo.alt}
                            className="h-8 w-auto object-contain dark:brightness-150"
                        />
                        <span className="text-xl font-bold tracking-tight text-primary">{logo.title}</span>
                    </a>

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-8">
                        {menu.map((item, i) => (
                            <AnimatedNavLink key={item.title} item={item} isActive={i === 0} />
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-sm text-muted-foreground tabular-nums tracking-wide">
                            {locationDisplay}
                        </div>

                        {/* Sininho de Notificações */}
                        {notificacoesConteudo}

                        {/* Carrinho */}
                        {isMounted && (
                            <Sheet>
                                <SheetTrigger className="relative p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center justify-center">
                                    <ShoppingCart className="size-5" />
                                    {totalItems > 0 && (
                                        <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                            {totalItems}
                                        </span>
                                    )}
                                </SheetTrigger>
                                {carrinhoConteudo}
                            </Sheet>
                        )}

                        <ModeToggle />

                        {isLogado ? (
                            <div className="flex items-center gap-4 border-l border-border pl-6">
                                {perfil === "ADMIN" && (
                                    <a href="/restrito/admin" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                                        <LayoutDashboard className="size-4" /> Painel Admin
                                    </a>
                                )}
                                {perfil === "GERENTE" && (
                                    <a href="/restrito/gerente" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                                        <LayoutDashboard className="size-4" /> Painel do Gerente
                                    </a>
                                )}

                                <button onClick={handleLogout} disabled={isPending} className="flex items-center gap-2 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50 cursor-pointer">
                                    <LogOut className="size-4" /> Sair
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 border-l border-border pl-6">
                                <a href={auth.login.url} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Entrar</a>
                                <a href={auth.signup.url} className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">Cadastrar</a>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Mobile */}
                <div className="flex lg:hidden items-center justify-between h-14">
                    <a href={logo.url} className="flex items-center gap-2 shrink-0">
                        <img src={logo.src} alt={logo.alt} className="h-7 w-auto object-contain dark:brightness-150" />
                        <span className="text-sm font-bold text-primary">{logo.title}</span>
                    </a>

                    <div className="flex items-center gap-3">
                        {/* Sininho de Notificações */}
                        {notificacoesConteudo}

                        {/* Carrinho */}
                        {isMounted && (
                            <Sheet>
                                <SheetTrigger className="relative p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center justify-center">
                                    <ShoppingCart className="size-5" />
                                    {totalItems > 0 && (
                                        <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                            {totalItems}
                                        </span>
                                    )}
                                </SheetTrigger>
                                {carrinhoConteudo}
                            </Sheet>
                        )}

                        <ModeToggle />
                        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-md hover:bg-muted transition-colors cursor-pointer">
                            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div className="lg:hidden pb-4 flex flex-col gap-1 border-t border-border/40 pt-4">
                        {menu.map((item, i) => (
                            <a key={item.title} href={item.url} className={`px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors ${i === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                                {item.title}
                            </a>
                        ))}

                        <div className="mt-4 flex flex-col gap-2 pt-4 border-t border-border/40">
                            {isLogado ? (
                                <>
                                    {perfil === "ADMIN" && (
                                        <a href="/restrito/admin" className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md">
                                            <LayoutDashboard className="size-4" /> Painel Admin
                                        </a>
                                    )}
                                    {perfil === "GERENTE" && (
                                        <a href="/restrito/gerente" className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-secondary text-secondary-foreground rounded-md">
                                            <LayoutDashboard className="size-4" /> Painel do Gerente
                                        </a>
                                    )}

                                    <button onClick={handleLogout} disabled={isPending} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20 rounded-md cursor-pointer">
                                        <LogOut className="size-4" /> {isPending ? "Saindo..." : "Sair da Conta"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <a href={auth.login.url} className="flex items-center justify-center px-3 py-2 text-sm font-medium border rounded-md">Entrar</a>
                                    <a href={auth.signup.url} className="flex items-center justify-center px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md">Cadastrar</a>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export { Navbar };