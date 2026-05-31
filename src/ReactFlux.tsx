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

    // Destructure properties to avoid object reference changes in dependency arrays
    const { lerp, wheelMultiplier, direction } = options;

    useEffect(() => {
        if (typeof window === "undefined") return;

        let flux: Flux;

        if (root) {
            flux = new Flux({
                direction
            });
        } else {
            if (!wrapperRef.current || !contentRef.current) return;
            flux = new Flux({
                wrapper: wrapperRef.current,
                content: contentRef.current,
                direction
            });
        }

        setFluxInstance(flux);

        return () => {
            flux.destroy();
        };
    }, [root, direction]);

    // Update mutable parameters dynamically without recreating the scroll instance
    useEffect(() => {
        if (fluxInstance) {
            if (lerp !== undefined) {
                fluxInstance.lerp = lerp;
            }
            if (wheelMultiplier !== undefined) {
                fluxInstance.wheelMultiplier = wheelMultiplier;
            }
        }
    }, [fluxInstance, lerp, wheelMultiplier]);

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
                    overflowY: direction === "horizontal" ? "hidden" : "auto",
                    overflowX: direction === "horizontal" ? "auto" : "hidden",
                    position: "relative",
                    ...style
                }}
            >
                <div ref={contentRef}>{children}</div>
            </div>
        </FluxContext.Provider>
    );
}
