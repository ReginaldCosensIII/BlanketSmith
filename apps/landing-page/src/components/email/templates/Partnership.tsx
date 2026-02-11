// ========================================
// TEMPLATE: Partnership (Cinematic)
// ========================================

import { EmailHeader } from "../EmailHeader";
import { EmailFooter } from "../EmailFooter";
import { EmailButton } from "../EmailButton";
import { GradientText } from "../GradientText";
import { SectionHeader } from "../SectionHeader";

interface EmailTemplateProps {
    name: string;
    isMobile?: boolean; // Added isMobile prop
}

export function PartnershipEmail({ name, isMobile = false }: EmailTemplateProps) {
    const bgColor = "#f8fafc";
    const cardBg = "#ffffff";
    const textColor = "#1e293b";
    const mutedColor = "#64748b";

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
                                        <SectionHeader>
                                            Let's Build the <GradientText>Future of Craft</GradientText>
                                        </SectionHeader>

                                        <p
                                            style={{
                                                margin: "0 0 24px",
                                                fontSize: isMobile ? "14px" : "15px",
                                                lineHeight: "1.7",
                                                color: textColor,
                                            }}
                                        >
                                            Thank you for reaching out about a potential partnership. We sit at the
                                            intersection of craftsmanship and modern software, and we're always excited
                                            to explore collaborations that push the boundaries of what's possible.
                                        </p>

                                        <p
                                            style={{
                                                margin: "0 0 24px",
                                                fontSize: isMobile ? "14px" : "15px",
                                                lineHeight: "1.7",
                                                color: textColor,
                                            }}
                                        >
                                            Our team has received your inquiry and will be reviewing it carefully.
                                            We typically respond within 2-3 business days, but please know that every
                                            partnership opportunity receives our full attention.
                                        </p>

                                        <p
                                            style={{
                                                margin: "0 0 32px",
                                                fontSize: isMobile ? "14px" : "15px",
                                                lineHeight: "1.7",
                                                color: mutedColor,
                                                fontStyle: "italic",
                                            }}
                                        >
                                            "The best tools are built by those who understand both the craft and the maker."
                                        </p>

                                        <div style={{ textAlign: "center", marginBottom: "24px" }}>
                                            <EmailButton href="#">Learn More About BlanketSmith</EmailButton>
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
