import { useEffect, useState } from "react";

export const OdometerDigit = ({ value }: { value: number }) => {
    const [history, setHistory] = useState([value]);

    useEffect(() => {
        setHistory(prev => {
            if (prev[prev.length - 1] === value) return prev;
            return [...prev, value];
        });
    }, [value]);

    const currentIndex = history.length - 1;

    return (
        <div className="w-8 h-9 relative overflow-hidden bg-bg-surface border border-border-strong rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
            <div
                className="absolute inset-x-0 bottom-0 transition-transform duration-500 ease-out flex flex-col-reverse"
                style={{ transform: `translateY(${currentIndex * 2.25}rem)` }}
            >
                {history.map((num, i) => (
                    <div key={i} className="h-9 w-full flex-none flex justify-center items-center text-lg font-bold font-mono">
                        {num}
                    </div>
                ))}
            </div>
            <div className="absolute inset-0 pointer-events-none rounded bg-gradient-to-b from-black/10 via-transparent to-black/10"></div>
        </div>
    );
};