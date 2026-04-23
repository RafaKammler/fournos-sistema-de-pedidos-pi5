"use client";

import { useEffect, useState } from "react";

interface LocationTime {
    location: string;
    time: string;
    loading: boolean;
}

export function useLocationTime(): LocationTime {
    const [location, setLocation] = useState("—");
    const [time, setTime] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const updateTime = () => {
            setTime(
                new Intl.DateTimeFormat("pt-BR", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: false,
                }).format(new Date())
            );
        };

        updateTime();
        const interval = setInterval(updateTime, 60_000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation("Desconhecida");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`
                    );
                    const data = await res.json();

                    const city =
                        data.address?.city ||
                        data.address?.town ||
                        data.address?.village ||
                        data.address?.county ||
                        "Desconhecida";

                    setLocation(city);
                } catch {
                    setLocation("Desconhecida");
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setLocation("Desconhecida");
                setLoading(false);
            },
            { timeout: 8000 }
        );
    }, []);

    return { location, time, loading };
}