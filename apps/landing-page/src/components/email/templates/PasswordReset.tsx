// ========================================
// TEMPLATE: Password Reset (Cinematic)
// ========================================

import { EmailButton } from "../EmailButton";
import { GradientText } from "../GradientText";
import { SectionHeader } from "../SectionHeader";
import { InfoBox } from "../InfoBox";
import { CinematicShell } from "../EmailShell";

interface EmailTemplateProps {
    resetLink: string;
    isMobile?: boolean;
}

export function PasswordResetEmail({ resetLink, isMobile = false }: EmailTemplateProps) {
    const textColor = "#1e293b";
    const mutedColor = "#64748b";
    const iconStroke = "#7c2ae8";
    const warningColor = "#f59e0b";

    return (
        <CinematicShell isMobile={isMobile}>
            {/* Lock Icon */}
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
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <SectionHeader>
                Reset Your <GradientText>Password</GradientText>
            </SectionHeader>

            <p
                style={{
                    margin: "0 0 24px",
                    fontSize: isMobile ? "14px" : "15px",
                    lineHeight: "1.7",
                    color: textColor,
                    textAlign: "center",
                }}
            >
                We received a request to reset the password associated with your BlanketSmith account.
                Click the button below to create a new password.
            </p>

            {/* CTA Button */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <EmailButton href="#">Reset Password</EmailButton>
            </div>

            {/* Security notice */}
            <InfoBox
                title="Security Notice"
                description="This link expires in 60 minutes. If you didn't request a password reset, you can safely ignore this email — your account remains secure."
                isMobile={isMobile}
                borderColor={warningColor}
                icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={warningColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                }
            />

            <p
                style={{
                    margin: "16px 0 0",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    color: mutedColor,
                    textAlign: "center",
                }}
            >
                Having trouble? Contact us at{" "}
                <a href="mailto:support@blanketsmith.com" style={{ color: iconStroke, textDecoration: "none" }}>
                    support@blanketsmith.com
                </a>
            </p>
        </CinematicShell>
    );
}