// ========================================
// TEMPLATE: Beta Welcome (Cinematic)
// ========================================

import { EmailHeader } from "../EmailHeader";
import { EmailFooter } from "../EmailFooter";
import { EmailButton } from "../EmailButton";
import { EmailProgressRail } from "../EmailProgressRail";
import { EmailFeatureCard } from "../EmailFeatureCard";
import { GradientText } from "../GradientText";
import { SectionHeader } from "../SectionHeader";


interface EmailTemplateProps {
    name: string;
    isMobile?: boolean; // Added isMobile prop
}

export function BetaWelcomeEmail({ name, isMobile = false }: EmailTemplateProps) {
    const bgColor = "#f8fafc";
    const cardBg = "#ffffff";
    const textColor = "#1e293b";
    const mutedColor = "#64748b";
    const infoBoxBg = "#f1f5f9";
    const iconStroke = "#7c2ae8";
    const iconGlow = "0 0 12px rgba(124, 42, 232, 0.2), 0 0 20px rgba(14, 200, 252, 0.1)";
    const iconBgGradient = "linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(14, 200, 252, 0.08) 100%)";

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
                                {/* Header */}
                                <tr>
                                    <td>
                                        <EmailHeader />
                                    </td>
                                </tr>

                                {/* Body */}
                                <tr>
                                    <td style={{ padding: containerPadding }}>
                                        {/* Welcome Title */}
                                        <SectionHeader>
                                            Welcome to <GradientText>The Forge</GradientText>
                                        </SectionHeader>

                                        <p
                                            style={{
                                                margin: "0 0 32px",
                                                fontSize: isMobile ? "16px" : "18px",
                                                fontWeight: "500",
                                                color: mutedColor,
                                                textAlign: "center",
                                            }}
                                        >
                                            You're in.
                                        </p>

                                        {/* Progress Rail */}
                                        <EmailProgressRail currentStep={1} />

                                        {/* Main Copy */}
                                        <p
                                            style={{
                                                margin: "0 0 24px",
                                                fontSize: isMobile ? "14px" : "15px",
                                                lineHeight: "1.7",
                                                color: textColor,
                                            }}
                                        >
                                            BlanketSmith is currently in a limited Beta, and you've secured a
                                            front-row seat to the future of pattern design. We're building something
                                            special for makers who value precision, creativity, and a streamlined workflow.
                                        </p>

                                        <p
                                            style={{
                                                margin: "0 0 32px",
                                                fontSize: isMobile ? "14px" : "15px",
                                                lineHeight: "1.7",
                                                color: textColor,
                                            }}
                                        >
                                            Please verify your email to continue your journey into The Forge.
                                        </p>

                                        {/* CTA Button */}
                                        <div style={{ textAlign: "center", marginBottom: "32px" }}>
                                            <EmailButton href="#">Verify Email Address</EmailButton>
                                        </div>

                                        {/* Feature Cards - Stack on mobile */}
                                        <table width="100%" cellPadding="0" cellSpacing="0">
                                            <tbody>
                                                {isMobile ? (
                                                    <>
                                                        <tr>
                                                            <EmailFeatureCard
                                                                title="Instant Patterns"
                                                                description="Transform your vision into precise, ready-to-use patterns in seconds."
                                                                icon="zap"
                                                                fullWidth
                                                            />
                                                        </tr>
                                                        <tr>
                                                            <EmailFeatureCard
                                                                title="Modern Interface"
                                                                description="A beautiful, intuitive design built for the modern maker."
                                                                icon="layout"
                                                                fullWidth
                                                            />
                                                        </tr>
                                                        <tr>
                                                            <EmailFeatureCard
                                                                title="Precision Tools"
                                                                description="Fine-tune every detail with our professional-grade editing tools."
                                                                icon="settings"
                                                                fullWidth
                                                            />
                                                        </tr>
                                                        <tr>
                                                            <EmailFeatureCard
                                                                title="Community First"
                                                                description="Join a growing community of passionate crafters and creators."
                                                                icon="users"
                                                                fullWidth
                                                            />
                                                        </tr>
                                                    </>
                                                ) : (
                                                    <>
                                                        <tr>
                                                            <EmailFeatureCard
                                                                title="Instant Patterns"
                                                                description="Transform your vision into precise, ready-to-use patterns in seconds."
                                                                icon="zap"
                                                            />
                                                            <EmailFeatureCard
                                                                title="Modern Interface"
                                                                description="A beautiful, intuitive design built for the modern maker."
                                                                icon="layout"
                                                            />
                                                        </tr>
                                                        <tr>
                                                            <EmailFeatureCard
                                                                title="Precision Tools"
                                                                description="Fine-tune every detail with our professional-grade editing tools."
                                                                icon="settings"
                                                            />
                                                            <EmailFeatureCard
                                                                title="Community First"
                                                                description="Join a growing community of passionate crafters and creators."
                                                                icon="users"
                                                            />
                                                        </tr>
                                                    </>
                                                )}
                                            </tbody>
                                        </table>

                                        {/* What Happens Next section */}
                                        <div
                                            style={{
                                                backgroundColor: infoBoxBg,
                                                borderRadius: "12px",
                                                padding: isMobile ? "16px" : "20px",
                                                marginTop: "24px",
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
                                                                What Happens Next?
                                                            </p>
                                                            <p
                                                                style={{
                                                                    margin: "0",
                                                                    fontSize: isMobile ? "13px" : "14px",
                                                                    lineHeight: "1.6",
                                                                    color: mutedColor,
                                                                }}
                                                            >
                                                                Once verified, you'll receive your Beta credentials via email within 24-48 hours.
                                                                These credentials will grant you early access to The Forge where you can start
                                                                creating patterns, exploring tools, and joining our community of makers.
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>

                                {/* Footer */}
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