// ========================================
// COMPONENT: Email Footer (Cinematic)
// ========================================

// ========================================
// Verified PNG Assets (Public Path)
const LIGHT_LOGO = "https://blanket-smith-landing-page.vercel.app/email-assets/vertical-logo-no-slogan-white.png";
const HEART_ICON = "https://blanket-smith-landing-page.vercel.app/email-assets/favicon-heart-v2.png";
import faviconBadge from "@/assets/favicon-badge.svg";

interface EmailFooterProps {
    // No props needed
}

const socialLinks = {
    row1: [
        { label: "Facebook", href: "https://facebook.com/blanketsmith" },
        { label: "Twitter", href: "https://twitter.com/blanketsmith" },
        { label: "Instagram", href: "https://instagram.com/blanketsmith" },
    ],
    row2: [
        { label: "YouTube", href: "https://youtube.com/@blanketsmith" },
        { label: "TikTok", href: "https://tiktok.com/@blanketsmith" },
        { label: "Discord", href: "https://discord.gg/blanketsmith" },
    ],
};

export function EmailFooter({ }: EmailFooterProps = {}) {
    // Universal Dark Mode Colors
    // Universal Dark Mode Colors
    const bgColor = "#1e293b"; // Slate 800 (Lighter than header)
    const textColor = "#94a3b8"; // Slate 400
    const linkColor = "#a78bfa"; // Violet 400
    const borderColor = "#334155"; // Slate 700

    return (
        width = "100%"
            cellPadding = "0"
    cellSpacing = "0"
    style = {{
        background: "linear-gradient(to bottom, #1e293b, #0f172a)",
            backgroundColor: bgColor, // Fallback
                borderTop: `1px solid ${borderColor}`
    }
}
        >
    <tbody>
        <tr>
            <td style={{ padding: "32px 20px 24px" }}>
                {/* Logo centered */}
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "24px" }}>
                    <tbody>
                        <tr>
                            <td align="center">
                                <img
                                    src={LIGHT_LOGO}
                                    alt="BlanketSmith"
                                    width="160"
                                    style={{
                                        display: "block",
                                        maxWidth: "160px",
                                        height: "auto",
                                    }}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Social Links Row 1 - Centered */}
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "8px" }}>
                    <tbody>
                        <tr>
                            <td align="center">
                                <table cellPadding="0" cellSpacing="0">
                                    <tbody>
                                        <tr>
                                            {socialLinks.row1.map((link) => (
                                                <td key={link.label} style={{ padding: "0 12px" }}>
                                                    <a
                                                        href={link.href}
                                                        style={{
                                                            color: linkColor,
                                                            fontSize: "13px",
                                                            fontFamily: "Inter, system-ui, sans-serif",
                                                            textDecoration: "none",
                                                        }}
                                                    >
                                                        {link.label}
                                                    </a>
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Social Links Row 2 - Centered */}
                <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "24px" }}>
                    <tbody>
                        <tr>
                            <td align="center">
                                <table cellPadding="0" cellSpacing="0">
                                    <tbody>
                                        <tr>
                                            {socialLinks.row2.map((link) => (
                                                <td key={link.label} style={{ padding: "0 12px" }}>
                                                    <a
                                                        href={link.href}
                                                        style={{
                                                            color: linkColor,
                                                            fontSize: "13px",
                                                            fontFamily: "Inter, system-ui, sans-serif",
                                                            textDecoration: "none",
                                                        }}
                                                    >
                                                        {link.label}
                                                    </a>
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Legal Links - Centered */}
                <table width="100%" cellPadding="0" cellSpacing="0">
                    <tbody>
                        <tr>
                            <td align="center">
                                <p
                                    style={{
                                        color: textColor,
                                        fontSize: "12px",
                                        fontFamily: "Inter, system-ui, sans-serif",
                                        margin: "0 0 16px",
                                    }}
                                >
                                    <a href="#" style={{ color: textColor, textDecoration: "underline" }}>
                                        Unsubscribe
                                    </a>
                                    {" · "}
                                    <a href="#" style={{ color: textColor, textDecoration: "underline" }}>
                                        Privacy Policy
                                    </a>
                                    {" · "}
                                    <a href="#" style={{ color: textColor, textDecoration: "underline" }}>
                                        Terms of Service
                                    </a>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Community Credit - Centered */}
                <table width="100%" cellPadding="0" cellSpacing="0">
                    <tbody>
                        <tr>
                            <td align="center">
                                <p
                                    style={{
                                        color: textColor,
                                        fontSize: "12px",
                                        fontFamily: "Inter, system-ui, sans-serif",
                                        margin: "0",
                                    }}
                                >
                                    Made with{" "}
                                    <img
                                        src={faviconBadge}
                                        alt="love"
                                        width="16"
                                        height="16"
                                        style={{ display: "inline-block", verticalAlign: "middle" }}
                                    />{" "}
                                    for the community
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Copyright - Centered */}
                <table width="100%" cellPadding="0" cellSpacing="0">
                    <tbody>
                        <tr>
                            <td align="center">
                                <p
                                    style={{
                                        color: textColor,
                                        fontSize: "11px",
                                        fontFamily: "Inter, system-ui, sans-serif",
                                        margin: "12px 0 0",
                                    }}
                                >
                                    © {new Date().getFullYear()} BlanketSmith. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </td>
        </tr>
    </tbody>
        </table >
    );
}

export function getEmailFooterHTML(): string {
    const bgColor = "#1e293b"; // Slate 800
    const textColor = "#94a3b8"; // Slate 400
    const linkColor = "#a78bfa"; // Violet 400
    const borderColor = "#334155"; // Slate 700
    const year = new Date().getFullYear();

    return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(to bottom, #1e293b, #0f172a); background-color: ${bgColor}; border-top: 1px solid ${borderColor};">
      <tr>
        <td style="padding: 32px 20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            <tr>
              <td align="center">
                <img src="${LIGHT_LOGO}" alt="BlanketSmith" width="140" style="display: block; max-width: 140px; height: auto;" />
              </td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 8px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 0 12px;"><a href="https://facebook.com/blanketsmith" style="color: ${linkColor}; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">Facebook</a></td>
                    <td style="padding: 0 12px;"><a href="https://twitter.com/blanketsmith" style="color: ${linkColor}; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">Twitter</a></td>
                    <td style="padding: 0 12px;"><a href="https://instagram.com/blanketsmith" style="color: ${linkColor}; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">Instagram</a></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 0 12px;"><a href="https://youtube.com/@blanketsmith" style="color: ${linkColor}; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">YouTube</a></td>
                    <td style="padding: 0 12px;"><a href="https://tiktok.com/@blanketsmith" style="color: ${linkColor}; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">TikTok</a></td>
                    <td style="padding: 0 12px;"><a href="https://discord.gg/blanketsmith" style="color: ${linkColor}; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">Discord</a></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <p style="color: ${textColor}; font-size: 12px; font-family: Inter, system-ui, sans-serif; margin: 0 0 16px;">
                  <a href="#" style="color: ${textColor}; text-decoration: underline;">Unsubscribe</a> · 
                  <a href="#" style="color: ${textColor}; text-decoration: underline;">Privacy Policy</a> · 
                  <a href="#" style="color: ${textColor}; text-decoration: underline;">Terms of Service</a>
                </p>
              </td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <p style="color: ${textColor}; font-size: 12px; font-family: Inter, system-ui, sans-serif; margin: 0;">
                  Made with <img src="${HEART_ICON}" alt="love" width="16" height="16" style="display: inline-block; vertical-align: middle;" /> for the community
                </p>
              </td>
            </tr>
          </table>
          
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <p style="color: ${textColor}; font-size: 11px; font-family: Inter, system-ui, sans-serif; margin: 12px 0 0;">
                  © ${year} BlanketSmith. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}