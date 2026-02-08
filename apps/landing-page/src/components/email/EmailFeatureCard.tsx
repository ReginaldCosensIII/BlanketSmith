// ========================================
// COMPONENT: Email Feature Card (Cinematic)
// ========================================

interface EmailFeatureCardProps {
    title: string;
    description: string;
    isDarkMode: boolean;
    icon?: "zap" | "layout" | "settings" | "users" | "lightbulb";
    fullWidth?: boolean;
}

const iconPaths: Record<string, string> = {
    zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
    layout: "M3 3h7v9H3V3zm11 0h7v5h-7V3zm0 8h7v9h-7v-9zM3 15h7v6H3v-6z",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z",
    users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
    lightbulb: "M9 21h6 M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2.8c-1.79-1.04-3-2.98-3-5.2a6 6 0 016-6z",
};

export function EmailFeatureCard({ title, description, isDarkMode, icon = "zap", fullWidth = false }: EmailFeatureCardProps) {
    const bgColor = isDarkMode ? "#1e293b" : "#ffffff";
    const borderColor = isDarkMode ? "#334155" : "#e2e8f0";
    const titleColor = isDarkMode ? "#f1f5f9" : "#1e293b";
    const textColor = isDarkMode ? "#94a3b8" : "#64748b";
    const iconBgGradient = isDarkMode
        ? "linear-gradient(135deg, rgba(124, 42, 232, 0.2) 0%, rgba(14, 200, 252, 0.15) 100%)"
        : "linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(14, 200, 252, 0.08) 100%)";
    const iconStroke = isDarkMode ? "#0ec8fc" : "#7c2ae8";
    const iconGlow = isDarkMode
        ? "0 0 12px rgba(14, 200, 252, 0.3), 0 0 20px rgba(124, 42, 232, 0.2)"
        : "0 0 12px rgba(124, 42, 232, 0.2), 0 0 20px rgba(14, 200, 252, 0.1)";

    return (
        <td
            width={fullWidth ? "100%" : "50%"}
            valign="top"
            style={{
                padding: fullWidth ? "8px 0" : "8px",
            }}
        >
            <div
                style={{
                    backgroundColor: bgColor,
                    borderRadius: "12px",
                    border: `1px solid ${borderColor}`,
                    padding: "20px",
                    height: "160px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Icon Container */}
                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: iconBgGradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "12px",
                        boxShadow: iconGlow,
                        border: `1px solid ${isDarkMode ? "rgba(14, 200, 252, 0.2)" : "rgba(124, 42, 232, 0.15)"}`,
                        flexShrink: 0,
                    }}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={iconStroke}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d={iconPaths[icon]} />
                    </svg>
                </div>
                <h4
                    style={{
                        margin: "0 0 8px",
                        fontSize: "15px",
                        fontWeight: "600",
                        fontFamily: "Poppins, system-ui, sans-serif",
                        color: titleColor,
                    }}
                >
                    {title}
                </h4>
                <p
                    style={{
                        margin: "0",
                        fontSize: "13px",
                        lineHeight: "1.5",
                        fontFamily: "Inter, system-ui, sans-serif",
                        color: textColor,
                        flex: 1,
                    }}
                >
                    {description}
                </p>
            </div>
        </td>
    );
}

export function getEmailFeatureCardHTML(
    title: string,
    description: string,
    isDarkMode: boolean,
    icon: string = "zap"
): string {
    const bgColor = isDarkMode ? "#1e293b" : "#ffffff";
    const borderColor = isDarkMode ? "#334155" : "#e2e8f0";
    const titleColor = isDarkMode ? "#f1f5f9" : "#1e293b";
    const textColor = isDarkMode ? "#94a3b8" : "#64748b";
    const iconBgGradient = isDarkMode
        ? "linear-gradient(135deg, rgba(124, 42, 232, 0.2) 0%, rgba(14, 200, 252, 0.15) 100%)"
        : "linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(14, 200, 252, 0.08) 100%)";
    const iconStroke = isDarkMode ? "#0ec8fc" : "#7c2ae8";
    const iconGlow = isDarkMode
        ? "0 0 12px rgba(14, 200, 252, 0.3), 0 0 20px rgba(124, 42, 232, 0.2)"
        : "0 0 12px rgba(124, 42, 232, 0.2), 0 0 20px rgba(14, 200, 252, 0.1)";
    const iconBorder = isDarkMode ? "rgba(14, 200, 252, 0.2)" : "rgba(124, 42, 232, 0.15)";

    return `
    <td width="50%" valign="top" style="padding: 8px;">
      <div style="background-color: ${bgColor}; border-radius: 12px; border: 1px solid ${borderColor}; padding: 20px; height: 160px; box-sizing: border-box;">
        <div style="width: 40px; height: 40px; border-radius: 10px; background: ${iconBgGradient}; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: ${iconGlow}; border: 1px solid ${iconBorder};">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${iconStroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="${iconPaths[icon] || iconPaths.zap}" />
          </svg>
        </div>
        <h4 style="margin: 0 0 8px; font-size: 15px; font-weight: 600; font-family: Poppins, system-ui, sans-serif; color: ${titleColor};">${title}</h4>
        <p style="margin: 0; font-size: 13px; line-height: 1.5; font-family: Inter, system-ui, sans-serif; color: ${textColor};">${description}</p>
      </div>
    </td>
  `;
}
