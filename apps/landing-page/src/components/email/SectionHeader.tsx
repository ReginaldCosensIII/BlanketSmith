// ========================================
// COMPONENT: Section Header (Cinematic)
// ========================================

export function SectionHeader({
    children,
    isDarkMode,
    align = "center"
}: {
    children: React.ReactNode;
    isDarkMode: boolean;
    align?: "left" | "center";
}) {
    const textColor = isDarkMode ? "#e2e8f0" : "#1e293b";
    const textShadow = isDarkMode
        ? "0 0 30px rgba(124, 42, 232, 0.5), 0 0 60px rgba(14, 200, 252, 0.3)"
        : "0 0 20px rgba(124, 42, 232, 0.25), 0 0 40px rgba(14, 200, 252, 0.15)";

    return (
        <h1
            style={{
                margin: "0 0 16px",
                padding: "16px 0",
                fontSize: "28px",
                fontWeight: "700",
                fontFamily: "Poppins, system-ui, sans-serif",
                color: textColor,
                textAlign: align,
                textShadow: textShadow,
            }}
        >
            {children}
        </h1>
    );
}