// ========================================
// TEMPLATE: Verification Success (Cinematic)
// ========================================

import { EmailButton } from "../EmailButton";
import { EmailProgressRail } from "../EmailProgressRail";
import { GradientText } from "../GradientText";
import { EmailHeader } from "../EmailHeader";
import { EmailFooter } from "../EmailFooter";
import { SectionHeader } from "../SectionHeader";


interface EmailTemplateProps {
    name: string;
    isMobile?: boolean; // Added isMobile prop
}

export function VerificationSuccessEmail({ name, isMobile = false }: EmailTemplateProps) {
    const bgColor = "#f8fafc";
    const cardBg = "#ffffff";
    const textColor = "#1e293b";
    const mutedColor = "#64748b";
    const infoBoxBg = "#f1f5f9";
    const iconStroke = "#7c2ae8";
    const iconGlow = "0 0 12px rgba(124, 42, 232, 0.2), 0 0 20px rgba(14, 200, 252, 0.1)";
    const iconBgGradient = "linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(14, 200, 252, 0.08) 100%)";
    const successColor = "#22c55e";

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
                                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
                                maxWidth: "600px",
                            }}
                        >
                            <tbody>
                                <tr>
                                    <td>
                                        <EmailHeader />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ padding: containerPadding }}>
                                        {/* Success Icon */}
                                        <div style={{ textAlign: "center", marginBottom: "24px" }}>
                                            <div
                                                style={{
                                                    display: "inline-block",
                                                    width: "72px",
                                                    height: "72px",
                                                    borderRadius: "50%",
                                                    background: `linear-gradient(135deg, ${successColor} 0%, #16a34a 100%)`,
                                                    boxShadow: `0 0 30px ${successColor}40, 0 0 60px ${successColor}20`,
                                                }}
                                            >
                                                <table width="100%" cellPadding="0" cellSpacing="0" style={{ height: "100%" }}>
                                                    <tbody>
                                                        <tr>
                                                            <td align="center" valign="middle" style={{ height: "72px" }}>
                                                                <svg
                                                                    width="36"
                                                                    height="36"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="#ffffff"
                                                                    strokeWidth="3"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <polyline points="20 6 9 17 4 12" />
                                                                </svg>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <SectionHeader>
                                            You're <GradientText>Verified!</GradientText>
                                        </SectionHeader>

                                        {/* Progress Rail - All steps complete */}
                                        <EmailProgressRail currentStep={3} />

                                        <p
                                            style={{
                                                margin: "0 0 24px",
                                                fontSize: isMobile ? "14px" : "15px",
                                                lineHeight: "1.7",
                                                color: textColor,
                                            }}
                                        >
                                            Your email has been verified and your Beta access is now active.
                                            Welcome to The Forge — you're officially part of the BlanketSmith community.
                                        </p>

                                        <p
                                            style={{
                                                margin: "0 0 32px",
                                                fontSize: isMobile ? "14px" : "15px",
                                                lineHeight: "1.7",
                                                color: textColor,
                                            }}
                                        >
                                            Your credentials are ready. Click the button below to access your dashboard
                                            and start creating beautiful, precise patterns.
                                        </p>

                                        {/* CTA Button */}
                                        <div style={{ textAlign: "center", marginBottom: "32px" }}>
                                            <EmailButton href="#">Enter The Forge</EmailButton>
                                        </div>

                                        {/* What's Next section */}
                                        <div
                                            style={{
                                                backgroundColor: infoBoxBg,
                                                borderRadius: "12px",
                                                padding: isMobile ? "16px" : "20px",
                                                borderLeft: `4px solid ${successColor}`,
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
                                                                    border: "1px solid rgba(124, 42, 232, 0.15)",
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
                                                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
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
                                                                Getting Started
                                                            </p>
                                                            <p
                                                                style={{
                                                                    margin: "0",
                                                                    fontSize: isMobile ? "13px" : "14px",
                                                                    lineHeight: "1.6",
                                                                    color: mutedColor,
                                                                }}
                                                            >
                                                                Explore the pattern generator, customize your workspace settings,
                                                                and join our Discord community to connect with fellow makers and
                                                                get tips from the team.
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <EmailFooter />
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
