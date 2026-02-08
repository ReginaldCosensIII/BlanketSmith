// ========================================
// TEMPLATE: Feedback (Cinematic)
// ========================================

import { EmailHeader } from "../EmailHeader";
import { EmailFooter } from "../EmailFooter";
import { EmailButton } from "../EmailButton";
import { GradientText } from "../GradientText";
import { SectionHeader } from "../SectionHeader";


interface EmailTemplateProps {
    isDarkMode: boolean;
    isMobile?: boolean;
}

export function FeedbackEmail({ isDarkMode, isMobile = false }: EmailTemplateProps) {
    const bgColor = isDarkMode ? "#0a0f1a" : "#f8fafc";
    const cardBg = isDarkMode ? "#0f172a" : "#ffffff";
    const textColor = isDarkMode ? "#e2e8f0" : "#1e293b";
    const mutedColor = isDarkMode ? "#94a3b8" : "#64748b";
    const infoBoxBg = isDarkMode ? "#1e293b" : "#f1f5f9";
    const iconStroke = isDarkMode ? "#0ec8fc" : "#7c2ae8";
    const iconGlow = isDarkMode
        ? "0 0 12px rgba(14, 200, 252, 0.3), 0 0 20px rgba(124, 42, 232, 0.2)"
        : "0 0 12px rgba(124, 42, 232, 0.2), 0 0 20px rgba(14, 200, 252, 0.1)";
    const iconBgGradient = isDarkMode
        ? "linear-gradient(135deg, rgba(124, 42, 232, 0.2) 0%, rgba(14, 200, 252, 0.15) 100%)"
        : "linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(14, 200, 252, 0.08) 100%)";

    const containerPadding = isMobile ? "24px 20px 32px" : "32px 40px 40px";

    return (
        <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            style={{
                backgroundColor: bgColor,
                fontFamily: "Inter, system-ui, sans-serif",
            }}
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
                                    <td style={{ padding: containerPadding }}>
                                        <SectionHeader isDarkMode={isDarkMode}>
                                            Your Feedback is in <GradientText>The Forge</GradientText>
                                        </SectionHeader>

                                        <p
                                            style={{
                                                margin: "0 0 24px",
                                                fontSize: isMobile ? "14px" : "15px",
                                                lineHeight: "1.7",
                                                color: textColor,
                                            }}
                                        >
                                            Accuracy and craftsmanship matter deeply to us. Your input is exactly how
                                            we evolve, and we want you to know that your feedback has been received
                                            and will be carefully reviewed by our team.
                                        </p>

                                        <p
                                            style={{
                                                margin: "0 0 24px",
                                                fontSize: isMobile ? "14px" : "15px",
                                                lineHeight: "1.7",
                                                color: textColor,
                                            }}
                                        >
                                            Every suggestion, bug report, and feature request helps us build a better
                                            tool for the entire maker community. We're in this together.
                                        </p>

                                        {/* What Happens Next section with icon */}
                                        <div
                                            style={{
                                                backgroundColor: infoBoxBg,
                                                borderRadius: "12px",
                                                padding: isMobile ? "16px" : "20px",
                                                marginBottom: "32px",
                                                borderLeft: "4px solid #7C2AE8",
                                            }}
                                        >
                                            <table width="100%" cellPadding="0" cellSpacing="0">
                                                <tbody>
                                                    <tr>
                                                        {/* Icon */}
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
                                                                <svg
                                                                    width="18"
                                                                    height="18"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke={iconStroke}
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <path d="M9 21h6 M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2.8c-1.79-1.04-3-2.98-3-5.2a6 6 0 016-6z" />
                                                                </svg>
                                                            </div>
                                                        </td>
                                                        {/* Content */}
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
                                                                What happens next?
                                                            </p>
                                                            <p
                                                                style={{
                                                                    margin: "0",
                                                                    fontSize: isMobile ? "13px" : "14px",
                                                                    lineHeight: "1.6",
                                                                    color: mutedColor,
                                                                }}
                                                            >
                                                                Our team reviews all feedback weekly. If we need more details, we'll
                                                                reach out directly. Major updates inspired by community input are
                                                                highlighted in our changelog.
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <div style={{ textAlign: "center" }}>
                                            <EmailButton href="#">View Our Roadmap</EmailButton>
                                        </div>
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