// ========================================
// TEMPLATE: Beta Kick-Off (Cinematic)
// ========================================

import { CinematicShell } from "../EmailShell";
import { SectionHeader } from "../SectionHeader";
import { GradientText } from "../GradientText";
import { EmailButton } from "../EmailButton";
import { EmailFeatureCard } from "../EmailFeatureCard";
import { InfoBox } from "../InfoBox";

interface EmailTemplateProps {
    isDarkMode: boolean;
    isMobile?: boolean;
}

export function BetaKickOffEmail({ isDarkMode, isMobile = false }: EmailTemplateProps) {
    const textColor = isDarkMode ? "#e2e8f0" : "#1e293b";
    const mutedColor = isDarkMode ? "#94a3b8" : "#64748b";
    const iconStroke = isDarkMode ? "#0ec8fc" : "#7c2ae8";

    return (
        <CinematicShell isDarkMode={isDarkMode} isMobile={isMobile}>
            {/* Rocket Icon */}
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
                                        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
                                        <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
                                        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                                        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                                    </svg>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <SectionHeader isDarkMode={isDarkMode}>
                The Beta is <GradientText>Live!</GradientText>
            </SectionHeader>

            <p
                style={{
                    margin: "0 0 8px",
                    fontSize: isMobile ? "18px" : "20px",
                    fontWeight: "600",
                    fontFamily: "Poppins, system-ui, sans-serif",
                    color: textColor,
                    textAlign: "center",
                }}
            >
                🚀 Welcome to Day One
            </p>

            <p
                style={{
                    margin: "0 0 28px",
                    fontSize: isMobile ? "14px" : "15px",
                    lineHeight: "1.7",
                    color: textColor,
                    textAlign: "center",
                }}
            >
                The BlanketSmith Beta is officially live, and you're among the first makers to access
                The Forge. This is the moment we've been building toward — and we're thrilled to have
                you along for the ride.
            </p>

            {/* Feature Cards - What's in the Beta */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "16px" }}>
                <tbody>
                    {isMobile ? (
                        <>
                            <tr>
                                <EmailFeatureCard
                                    title="Pattern Generator"
                                    description="Create precise, production-ready patterns from your measurements."
                                    isDarkMode={isDarkMode}
                                    icon="zap"
                                    fullWidth
                                />
                            </tr>
                            <tr>
                                <EmailFeatureCard
                                    title="Precision Editor"
                                    description="Fine-tune every stitch with our professional-grade editing suite."
                                    isDarkMode={isDarkMode}
                                    icon="settings"
                                    fullWidth
                                />
                            </tr>
                            <tr>
                                <EmailFeatureCard
                                    title="The Community"
                                    description="Connect with makers, share patterns, and get feedback in Discord."
                                    isDarkMode={isDarkMode}
                                    icon="users"
                                    fullWidth
                                />
                            </tr>
                            <tr>
                                <EmailFeatureCard
                                    title="Feedback Loop"
                                    description="Shape the product — your input directly influences our roadmap."
                                    isDarkMode={isDarkMode}
                                    icon="lightbulb"
                                    fullWidth
                                />
                            </tr>
                        </>
                    ) : (
                        <>
                            <tr>
                                <EmailFeatureCard
                                    title="Pattern Generator"
                                    description="Create precise, production-ready patterns from your measurements."
                                    isDarkMode={isDarkMode}
                                    icon="zap"
                                />
                                <EmailFeatureCard
                                    title="Precision Editor"
                                    description="Fine-tune every stitch with our professional-grade editing suite."
                                    isDarkMode={isDarkMode}
                                    icon="settings"
                                />
                            </tr>
                            <tr>
                                <EmailFeatureCard
                                    title="The Community"
                                    description="Connect with makers, share patterns, and get feedback in Discord."
                                    isDarkMode={isDarkMode}
                                    icon="users"
                                />
                                <EmailFeatureCard
                                    title="Feedback Loop"
                                    description="Shape the product — your input directly influences our roadmap."
                                    isDarkMode={isDarkMode}
                                    icon="lightbulb"
                                />
                            </tr>
                        </>
                    )}
                </tbody>
            </table>

            <InfoBox
                title="How to make the most of Beta"
                description="Explore freely, break things, and tell us about it. We've built a dedicated feedback channel in Discord and an in-app feedback tool. Every bug report and feature request helps us build a better Forge."
                isDarkMode={isDarkMode}
                isMobile={isMobile}
                icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={iconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                }
            />

            <div style={{ textAlign: "center", marginTop: "24px" }}>
                <EmailButton href="#">Enter The Forge</EmailButton>
            </div>
        </CinematicShell>
    );
}
