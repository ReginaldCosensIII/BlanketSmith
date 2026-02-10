// ========================================
// COMPONENT: Email Header (Cinematic)
// ========================================


import verticalLogoSlogan from "@/assets/Vetical-Logo-SLOGAN.svg";
import verticalLogoSloganWhite from "@/assets/Vetical-Logo-SLOGAN-WHITE.svg";

interface EmailHeaderProps {
    isDarkMode: boolean;
}

export function EmailHeader({ isDarkMode }: EmailHeaderProps) {
    const bgColor = isDarkMode ? "#0f172a" : "#ffffff";
    const orbColor1 = isDarkMode ? "rgba(124, 42, 232, 0.35)" : "rgba(124, 42, 232, 0.15)";
    const orbColor2 = isDarkMode ? "rgba(14, 200, 252, 0.30)" : "rgba(14, 200, 252, 0.12)";
    const gridColor = isDarkMode ? "rgba(148, 163, 184, 0.06)" : "rgba(100, 116, 139, 0.04)";

    return (
        <table
            width="100%"
            cellPadding="0"
            cellSpacing="0"
            style={{
                backgroundColor: bgColor,
                backgroundImage: `
          radial-gradient(ellipse 400px 300px at 0% 0%, ${orbColor1} 0%, transparent 70%),
          radial-gradient(ellipse 400px 300px at 100% 100%, ${orbColor2} 0%, transparent 70%),
          linear-gradient(to right, ${gridColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
        `,
                backgroundSize: "100% 100%, 100% 100%, 24px 24px, 24px 24px",
            }}
        >
            <tbody>
                <tr>
                    <td align="center" style={{ padding: "40px 20px 40px" }}>
                        <style>
                            {`
                            @media (prefers-color-scheme: dark) {
                                .light-img { display: none !important; }
                                .dark-img { display: block !important; }
                            }
                            `}
                        </style>
                        {/* Light Mode Logo */}
                        <img
                            src={verticalLogoSlogan}
                            className="light-img"
                            alt="BlanketSmith"
                            width="180"
                            style={{
                                display: "block",
                                maxWidth: "180px",
                                height: "auto",
                            }}
                        />
                        {/* Dark Mode Logo */}
                        {/* @ts-ignore - msoHide is valid for Outlook but not typed in React */}
                        <img
                            src={verticalLogoSloganWhite}
                            className="dark-img"
                            alt="BlanketSmith"
                            width="180"
                            style={{
                                display: "none",
                                maxWidth: "180px",
                                height: "auto",
                                // @ts-ignore
                                msoHide: "all",
                            }}
                        />
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

// Export inline HTML version for copy functionality
export function getEmailHeaderHTML(isDarkMode: boolean, logoUrl: string, logoDarkUrl?: string): string {
    const bgColor = isDarkMode ? "#0f172a" : "#ffffff";
    const orbColor1 = isDarkMode ? "rgba(124, 42, 232, 0.35)" : "rgba(124, 42, 232, 0.15)";
    const orbColor2 = isDarkMode ? "rgba(14, 200, 252, 0.30)" : "rgba(14, 200, 252, 0.12)";
    const gridColor = isDarkMode ? "rgba(148, 163, 184, 0.06)" : "rgba(100, 116, 139, 0.04)";

    // Note: getEmailHeaderHTML is legacy-ish and might not have both urls passed in yet,
    // but we will support the structure. simpler to just output the one relevant logo if we only have one,
    // or both if we are being fancy.
    // However, the prompt asked to update this to match.
    // Since this function returns a string for a specific mode snapshot (usually),
    // we might stick to the rendered version or try to replicate the swap.
    // Given the prompt "Update `getEmailHeaderHTML`... to match this exact structure", I will include both.

    // Fallback if logoDarkUrl is not provided (legacy call sites)
    const darkUrl = logoDarkUrl || logoUrl;

    return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${bgColor}; background-image: radial-gradient(ellipse 400px 300px at 0% 0%, ${orbColor1} 0%, transparent 70%), radial-gradient(ellipse 400px 300px at 100% 100%, ${orbColor2} 0%, transparent 70%), linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px); background-size: 100% 100%, 100% 100%, 24px 24px, 24px 24px;">
      <tr>
        <td align="center" style="padding: 40px 20px 40px;">
          <style>
            @media (prefers-color-scheme: dark) {
                .light-img { display: none !important; }
                .dark-img { display: block !important; }
            }
          </style>
          <img src="${logoUrl}" class="light-img" alt="BlanketSmith" width="180" style="display: block; max-width: 180px; height: auto;" />
          <img src="${darkUrl}" class="dark-img" alt="BlanketSmith" width="180" style="display: none; max-width: 180px; height: auto; mso-hide: all;" />
        </td>
      </tr>
    </table>
  `;
}

