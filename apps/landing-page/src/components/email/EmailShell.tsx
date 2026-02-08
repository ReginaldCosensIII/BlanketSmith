import { EmailHeader } from "./EmailHeader";
import { EmailFooter } from "./EmailFooter";

export function CinematicShell({
    isDarkMode,
    isMobile,
    children,
}: {
    isDarkMode: boolean;
    isMobile: boolean;
    children: React.ReactNode;
}) {
    const bgColor = isDarkMode ? "#0a0f1a" : "#f8fafc";
    const cardBg = isDarkMode ? "#0f172a" : "#ffffff";

    return (
        <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            style={{ backgroundColor: bgColor, fontFamily: "Inter, system-ui, sans-serif" }}
        >
            <tbody>
                <tr>
                    <td align="center" style={{ padding: isMobile ? "12px" : "20px" }}>
                        <table
                            width={isMobile ? "100%" : "600"}
                            cellPadding="0"
                            cellSpacing="0"
                            style={{
                                backgroundColor: cardBg,
                                borderRadius: "16px",
                                overflow: "hidden",
                                boxShadow: isDarkMode
                                    ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                                    : "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
                                maxWidth: "600px",
                            }}
                        >
                            <tbody>
                                <tr>
                                    <td>
                                        <EmailHeader isDarkMode={isDarkMode} />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: isMobile ? "24px 20px 32px" : "32px 40px 40px" }}>
                                        {children}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <EmailFooter isDarkMode={isDarkMode} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}