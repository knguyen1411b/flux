import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState
} from "react";
import { Flux, FluxOptions } from "./Flux";

export const FluxContext = createContext<Flux | null>(null);

export function useFlux(): Flux | null {
    return useContext(FluxContext);
}

export interface ReactFluxProps {
    root?: boolean;
    options?: FluxOptions;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function ReactFlux({
    root = true,
    options = {},
    children,
    className,
    style
}: ReactFluxProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [fluxInstance, setFluxInstance] = useState<Flux | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        let flux: Flux;

        if (root) {
            flux = new Flux(options);
        } else {
            if (!wrapperRef.current || !contentRef.current) return;
            flux = new Flux({
                ...options,
                wrapper: wrapperRef.current,
                content: contentRef.current
            });
        }

        setFluxInstance(flux);

        return () => {
            flux.destroy();
        };
    }, [root, options]);

    if (root) {
        return (
            <FluxContext.Provider value={fluxInstance}>
                {children}
            </FluxContext.Provider>
        );
    }

    return (
        <FluxContext.Provider value={fluxInstance}>
            <div
                ref={wrapperRef}
                className={className}
                style={{
                    height: "100%",
                    overflowY:
                        options.direction === "horizontal" ? "hidden" : "auto",
                    overflowX:
                        options.direction === "horizontal" ? "auto" : "hidden",
                    position: "relative",
                    ...style
                }}
            >
                <div ref={contentRef}>{children}</div>
            </div>
        </FluxContext.Provider>
    );
}
