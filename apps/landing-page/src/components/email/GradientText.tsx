// ========================================
// COMPONENT: Gradient Text (Cinematic)
// ========================================

export function GradientText({ children }: { children: React.ReactNode }) {
    return (
        <span
            style={{
                background: "linear-gradient(135deg, #7C2AE8 0%, #0EC8FC 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
            }}
        >
            {children}
        </span>
    );
}