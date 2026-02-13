// ========================================
// COMPONENT: Email Header (Cinematic)
// ========================================


// Verified PNG Assets (Public Path)
// Verified PNG Assets (Public Path)
const UNIVERSAL_LOGO = "https://blanket-smith-landing-page.vercel.app/branding/logos/bs-logo-horizontal-white.png";

interface EmailHeaderProps {
    // No props needed for single mode
}

export function EmailHeader({ }: EmailHeaderProps = {}) {
    // Universal Dark Theme
    const bgColor = "#0f172a"; // Slate 900
    // Multi-stop gradients for "glowing look" (handled inline below)
    const gridColor = "rgba(255, 255, 255, 0.05)"; // White Grid for contrast

    return (
        <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            style={{
                backgroundColor: bgColor,
                backgroundImage: `
          radial-gradient(ellipse 600px 500px at 0% 0%, rgba(167, 139, 250, 0.7) 0%, rgba(124, 42, 232, 0.6) 40%, transparent 80%),
          radial-gradient(ellipse 600px 500px at 100% 100%, rgba(103, 232, 249, 0.7) 0%, rgba(14, 200, 252, 0.6) 40%, transparent 80%),
          linear-gradient(to right, ${gridColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
        `,
                backgroundSize: "100% 100%, 100% 100%, 30px 30px, 30px 30px",
            }}
        >
            <tbody>
                <tr>
                    <td align="center" style={{ padding: "40px 20px 40px" }}>
                        {/* Logo */}
                        <img
                            src="${ASSET_BASE}branding/logos/bs-logo-horizontal-white.png"
                            alt="BlanketSmith"
                            width="180"
                            style={{
                                display: "block",
                                maxWidth: "180px",
                                height: "auto",
                            }}
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

// Export inline HTML version for copy functionality
export function getEmailHeaderHTML(logoUrl: string): string {
    const bgColor = "#0f172a";
    // Gradients defined inline
    const gridColor = "rgba(255, 255, 255, 0.05)";

    // Note: getEmailHeaderHTML is legacy-ish and might not have both urls passed in yet,
    // but we will support the structure. simpler to just output the one relevant logo if we only have one,
    // or both if we are being fancy.
    // However, the prompt asked to update this to match.
    // Since this function returns a string for a specific mode snapshot (usually),
    // we might stick to the rendered version or try to replicate the swap.
    // Given the prompt "Update `getEmailHeaderHTML`... to match this exact structure", I will include both.

    // Fallback if logoDarkUrl is not provided (legacy call sites)
    // Simplified for Single Mode (Light)

    return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${bgColor}; background-image: radial-gradient(ellipse 600px 500px at 0% 0%, rgba(167, 139, 250, 0.7) 0%, rgba(124, 42, 232, 0.6) 40%, transparent 80%), radial-gradient(ellipse 600px 500px at 100% 100%, rgba(103, 232, 249, 0.7) 0%, rgba(14, 200, 252, 0.6) 40%, transparent 80%), linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px); background-size: 100% 100%, 100% 100%, 30px 30px, 30px 30px;">
      <tr>
        <td align="center" style="padding: 40px 20px 40px;">
          <img src="${UNIVERSAL_LOGO}" alt="BlanketSmith" width="180" style="display: block; max-width: 180px; height: auto;" />
        </td>
      </tr>
    </table>
  `;
}

