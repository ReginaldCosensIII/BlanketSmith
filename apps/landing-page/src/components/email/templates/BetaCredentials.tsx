// ========================================
// TEMPLATE: Beta Credentials (Cinematic)
// ========================================

import { CinematicShell } from "../EmailShell";
import { EmailButton } from "../EmailButton";
import { EmailProgressRail } from "../EmailProgressRail";
import { GradientText } from "../GradientText";
import { SectionHeader } from "../SectionHeader";
import { InfoBox } from "../InfoBox";

interface EmailTemplateProps {
    isDarkMode: boolean;
    isMobile?: boolean;
}

export function BetaCredentialsEmail({ isDarkMode, isMobile = false }: EmailTemplateProps) {
    const textColor = isDarkMode ? "#e2e8f0" : "#1e293b";
    const mutedColor = isDarkMode ? "#94a3b8" : "#64748b";
    const iconStroke = isDarkMode ? "#0ec8fc" : "#7c2ae8";
    const infoBoxBg = isDarkMode ? "#1e293b" : "#f1f5f9";
    const codeBg = isDarkMode ? "#0a0f1a" : "#f1f5f9";
    const codeColor = isDarkMode ? "#0ec8fc" : "#7c2ae8";

    return (
        <CinematicShell isDarkMode={isDarkMode} isMobile={isMobile}>
            {/* Key Icon */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div
                    style={{
                        display: "inline-block",
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #7C2AE8 0%, #374FD9 75%, #0EC8FC 100%)",
                        boxShadow:
                            "0 0 30px rgba(124, 42, 232, 0.3), 0 0 60px rgba(14, 200, 252, 0.15)",
                    }}
                >
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{ height: "100%" }}>
                        <tbody>
                            <tr>
                                <td align="center" valign="middle" style={{ height: "72px" }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                                    </svg>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <SectionHeader isDarkMode={isDarkMode}>
                Your Beta <GradientText>Credentials</GradientText>
            </SectionHeader>

            {/* Progress Rail - Step 3 (Beta Access) */}
            <EmailProgressRail currentStep={2} isDarkMode={isDarkMode} />

            <p
                style={{
                    margin: "0 0 24px",
                    fontSize: isMobile ? "14px" : "15px",
                    lineHeight: "1.7",
                    color: textColor,
                }}
            >
                Great news — your Beta credentials are ready! Use the details below to log in to
                The Forge and start exploring. This is your personal access — please keep it secure.
            </p>

            {/* Credentials Card */}
            <div
                style={{
                    backgroundColor: codeBg,
                    borderRadius: "12px",
                    padding: isMobile ? "20px" : "24px",
                    border: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`,
                    marginBottom: "24px",
                }}
            >
                <table width="100%" cellPadding="0" cellSpacing="0">
                    <tbody>
                        <tr>
                            <td style={{ paddingBottom: "12px" }}>
                                <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" as const, letterSpacing: "0.1em", color: mutedColor, fontFamily: "Inter, system-ui, sans-serif" }}>
                                    Login URL
                                </p>
                                <p style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: codeColor, fontFamily: "monospace" }}>
                                    forge.blanketsmith.com
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ paddingBottom: "12px", borderTop: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`, paddingTop: "12px" }}>
                                <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" as const, letterSpacing: "0.1em", color: mutedColor, fontFamily: "Inter, system-ui, sans-serif" }}>
                                    Username
                                </p>
                                <p style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: textColor, fontFamily: "monospace" }}>
                                    your-email@example.com
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ borderTop: `1px solid ${isDarkMode ? "#1e293b" : "#e2e8f0"}`, paddingTop: "12px" }}>
                                <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" as const, letterSpacing: "0.1em", color: mutedColor, fontFamily: "Inter, system-ui, sans-serif" }}>
                                    Temporary Password
                                </p>
                                <p style={{ margin: "0", fontSize: "14px", fontWeight: "600", color: codeColor, fontFamily: "monospace" }}>
                                    ••••••••••••
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
                <EmailButton href="#">Log In to The Forge</EmailButton>
            </div>

            <InfoBox
                title="Important"
                description="You'll be prompted to set a new password on your first login. Your temporary credentials expire in 7 days."
                isDarkMode={isDarkMode}
                isMobile={isMobile}
                borderColor="#7C2AE8"
                icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                }
            />
        </CinematicShell>
    );
}
