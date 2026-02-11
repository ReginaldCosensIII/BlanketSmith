// ========================================
// TEMPLATE: First Pattern Achievement (Cinematic)
// ========================================

import { CinematicShell } from "../EmailShell";
import { SectionHeader } from "../SectionHeader";
import { EmailFeatureCard } from "../EmailFeatureCard";
import { EmailButton } from "../EmailButton";
import { GradientText } from "../GradientText";

interface EmailTemplateProps {
    name: string;
    patternName: string;
    imageUrl?: string;
    isMobile?: boolean; // Added isMobile prop
}

export function FirstPatternEmail({ name, patternName, imageUrl, isMobile = false }: EmailTemplateProps) {
    // Fixed Light Mode Colors
    const textColor = "#1e293b";
    const mutedColor = "#64748b";
    const iconStroke = "#7c2ae8";
    const achievementColor = "#f59e0b";

    return (
        <CinematicShell isMobile={isMobile}>
            {/* Trophy Icon */}
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div
                    style={{
                        display: "inline-block",
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${achievementColor} 0%, #ea580c 100%)`,
                        boxShadow: `0 0 30px ${achievementColor}40, 0 0 60px ${achievementColor}20`,
                    }}
                >
                    <table width="100%" cellPadding="0" cellSpacing="0" style={{ height: "100%" }}>
                        <tbody>
                            <tr>
                                <td align="center" valign="middle" style={{ height: "72px" }}>
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 9H4.5a2.5 2.5 0 010-5H6" />
                                        <path d="M18 9h1.5a2.5 2.5 0 000-5H18" />
                                        <path d="M4 22h16" />
                                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                                        <path d="M18 2H6v7a6 6 0 0012 0V2z" />
                                    </svg>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <SectionHeader>
                Your First <GradientText>Pattern!</GradientText>
            </SectionHeader>

            <p
                style={{
                    margin: "0 0 8px",
                    fontSize: isMobile ? "18px" : "20px",
                    fontWeight: "600",
                    fontFamily: "Poppins, system-ui, sans-serif",
                    color: achievementColor,
                    textAlign: "center",
                }}
            >
                🎉 Milestone Unlocked
            </p>

            <p
                style={{
                    margin: "0 0 24px",
                    fontSize: isMobile ? "14px" : "15px",
                    lineHeight: "1.7",
                    color: textColor,
                    textAlign: "center",
                }}
            >
                Congratulations! You've just created your very first pattern in The Forge.
                This is the beginning of something beautiful — every masterpiece starts with a single stitch.
            </p>

            {/* Achievement Card */}
            <div
                style={{
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(234, 88, 12, 0.05) 100%)",
                    borderRadius: "12px",
                    padding: isMobile ? "20px" : "24px",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    textAlign: "center",
                    marginBottom: "28px",
                }}
            >
                <p
                    style={{
                        margin: "0 0 4px",
                        fontSize: "12px",
                        fontWeight: "600",
                        fontFamily: "Inter, system-ui, sans-serif",
                        textTransform: "uppercase" as const,
                        letterSpacing: "0.1em",
                        color: achievementColor,
                    }}
                >
                    Achievement
                </p>
                <p
                    style={{
                        margin: "0 0 4px",
                        fontSize: "22px",
                        fontWeight: "700",
                        fontFamily: "Poppins, system-ui, sans-serif",
                        color: textColor,
                    }}
                >
                    First Pattern Created
                </p>
                <p style={{ margin: "0", fontSize: "13px", color: mutedColor }}>
                    Pattern #001 · Completed just now
                </p>
            </div>

            {/* Feature Cards */}
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "24px" }}>
                <tbody>
                    {isMobile ? (
                        <>
                            <tr>
                                <EmailFeatureCard
                                    title="Share Your Work"
                                    description="Show your creation to the BlanketSmith community and inspire others."
                                    icon="users"
                                    fullWidth
                                />
                            </tr>
                            <tr>
                                <EmailFeatureCard
                                    title="Explore Templates"
                                    description="Discover community patterns and find inspiration for your next project."
                                    icon="layout"
                                    fullWidth
                                />
                            </tr>
                        </>
                    ) : (
                        <tr>
                            <EmailFeatureCard
                                title="Share Your Work"
                                description="Show your creation to the BlanketSmith community and inspire others."
                                icon="users"
                            />
                            <EmailFeatureCard
                                title="Explore Templates"
                                description="Discover community patterns and find inspiration for your next project."
                                icon="layout"
                            />
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ textAlign: "center" }}>
                <EmailButton href="#">View Your Pattern</EmailButton>
            </div>
        </CinematicShell >
    );
}