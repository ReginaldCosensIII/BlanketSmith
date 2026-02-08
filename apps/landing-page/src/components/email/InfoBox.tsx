// ========================================
// COMPONENT: Info Box (Cinematic)
// ========================================

export function InfoBox({
    title,
    description,
    icon,
    isDarkMode,
    isMobile,
    borderColor: borderAccent,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    isDarkMode: boolean;
    isMobile: boolean;
    borderColor?: string;
}) {
    const infoBoxBg = isDarkMode ? "#1e293b" : "#f1f5f9";
    const textColor = isDarkMode ? "#e2e8f0" : "#1e293b";
    const mutedColor = isDarkMode ? "#94a3b8" : "#64748b";
    const iconBgGradient = isDarkMode
        ? "linear-gradient(135deg, rgba(124, 42, 232, 0.2) 0%, rgba(14, 200, 252, 0.15) 100%)"
        : "linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(14, 200, 252, 0.08) 100%)";
    const iconGlow = isDarkMode
        ? "0 0 12px rgba(14, 200, 252, 0.3), 0 0 20px rgba(124, 42, 232, 0.2)"
        : "0 0 12px rgba(124, 42, 232, 0.2), 0 0 20px rgba(14, 200, 252, 0.1)";

    return (
        <div
            style={{
                backgroundColor: infoBoxBg,
                borderRadius: "12px",
                padding: isMobile ? "16px" : "20px",
                borderLeft: `4px solid ${borderAccent || "#7C2AE8"}`,
                marginBottom: "16px",
            }}
        >
            <table width="100%" cellPadding="0" cellSpacing="0">
                <tbody>
                    <tr>
                        <td
                            width={isMobile ? "44px" : "52px"}
                            valign="top"
                            style={{ paddingRight: isMobile ? "12px" : "16px" }}
                        >
                            <div
                                style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "8px",
                                    background: iconBgGradient,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: iconGlow,
                                    border: `1px solid ${isDarkMode ? "rgba(14, 200, 252, 0.2)" : "rgba(124, 42, 232, 0.15)"}`,
                                }}
                            >
                                {icon}
                            </div>
                        </td>
                        <td valign="top">
                            <p
                                style={{
                                    margin: "0 0 8px",
                                    fontSize: isMobile ? "14px" : "15px",
                                    fontWeight: "600",
                                    fontFamily: "Poppins, system-ui, sans-serif",
                                    color: textColor,
                                }}
                            >
                                {title}
                            </p>
                            <p
                                style={{
                                    margin: "0",
                                    fontSize: isMobile ? "13px" : "14px",
                                    lineHeight: "1.6",
                                    color: mutedColor,
                                }}
                            >
                                {description}
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}