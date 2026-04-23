"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

interface MenuItem {
    title: string;
    url: string;
}

interface NavbarProps {
    logo?: {
        url: string;
        src: string;
        alt: string;
        title: string;
    };
    menu?: MenuItem[];
    auth?: {
        login: { title: string; url: string };
        signup: { title: string; url: string };
    };
    location?: string;
    time?: string;
}

// Animated nav link with slide-up text effect on hover
const AnimatedNavLink = ({
                             item,
                             isActive = false,
                         }: {
    item: MenuItem;
    isActive?: boolean;
}) => {
    return (
        <a
            href={item.url}
            className="relative group flex flex-col overflow-hidden h-5 items-center"
            style={{ perspective: "100px" }}
        >
            {/* Default label */}
            <span
                className={`
          text-sm tracking-wide transition-all duration-300 ease-out
          group-hover:-translate-y-full group-hover:opacity-0
          ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}
        `}
                style={{ transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)" }}
            >
        {item.title}
      </span>

            {/* Hover label (slides up from below) */}
            <span
                className={`
          absolute top-full text-sm tracking-wide font-medium text-foreground
          transition-all duration-300 ease-out
          group-hover:-translate-y-full group-hover:opacity-100
          opacity-0 translate-y-0
        `}
                style={{ transitionTimingFunction: "cubic-bezier(0.76, 0, 0.24, 1)" }}
                aria-hidden
            >
        {item.title}
      </span>

            {/* Active underline */}
            {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-px bg-foreground" />
            )}
        </a>
    );
};

const Navbar = ({
                    logo = {
                        url: "/",
                        src: "/img.png",
                        alt: "logo",
                        title: "Shadcnblocks.com",
                    },
                    menu = [
                        { title: "Home", url: "/home" },
                        { title: "Categorias", url: "#" },
                        { title: "Buscar", url: "#" },
                        { title: "Suporte", url: "#" },
                    ],
                    auth = {
                        login: { title: "Login", url: "/login" },
                        signup: { title: "Sign up", url: "/signup" },
                    },
                    location = "Brisbane",
                    time = "8:24 PM",
                }: NavbarProps) => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-6">
                {/* Desktop */}
                <nav className="hidden lg:flex items-center justify-between h-16">
                    {/* Logo */}
                    <a href={logo.url} className="flex items-center gap-2 shrink-0">
                        <img
                            src={logo.src}
                            alt={logo.alt}
                            className="h-7 w-7 dark:invert"
                        />
                        <span className="text-sm font-semibold tracking-tight">
              {logo.title}
            </span>
                    </a>

                    {/* Center nav */}
                    <div className="flex items-center gap-8">
                        {menu.map((item, i) => (
                            <AnimatedNavLink key={item.title} item={item} isActive={i === 0} />
                        ))}
                    </div>

                    {/* Right: location/time */}
                    <div className="text-sm text-muted-foreground tabular-nums tracking-wide">
                        {location}&nbsp;&nbsp;/&nbsp;&nbsp;{time}
                    </div>
                </nav>

                {/* Mobile */}
                <div className="flex lg:hidden items-center justify-between h-14">
                    <a href={logo.url} className="flex items-center gap-2">
                        <img src={logo.src} alt={logo.alt} className="h-7 w-7 dark:invert" />
                        <span className="text-sm font-semibold">{logo.title}</span>
                    </a>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                    >
                        {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                    </button>
                </div>

                {/* Mobile drawer */}
                {mobileOpen && (
                    <div className="lg:hidden pb-4 flex flex-col gap-1 border-t border-border/40 pt-4">
                        {menu.map((item, i) => (
                            <a
                                key={item.title}
                                href={item.url}
                                className={`px-2 py-2 text-sm rounded-md hover:bg-muted transition-colors ${
                                    i === 0 ? "font-medium text-foreground" : "text-muted-foreground"
                                }`}
                            >
                                {item.title}
                            </a>
                        ))}
                        <div className="mt-4 flex flex-col gap-2">
                            <a
                                href={auth.login.url}
                                className="px-3 py-2 text-sm text-center border border-border rounded-md hover:bg-muted transition-colors"
                            >
                                {auth.login.title}
                            </a>
                            <a
                                href={auth.signup.url}
                                className="px-3 py-2 text-sm text-center bg-foreground text-background rounded-md hover:opacity-90 transition-opacity"
                            >
                                {auth.signup.title}
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export { Navbar };