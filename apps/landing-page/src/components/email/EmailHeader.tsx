// ========================================
// COMPONENT: Email Header (Cinematic)
// ========================================


import verticalLogoSlogan from "@/assets/vertical-logo-slogan.svg";
import verticalLogoSloganWhite from "@/assets/vertical-logo-slogan-white.svg";

interface EmailHeaderProps {
    isDarkMode: boolean;
}

export function EmailHeader({ isDarkMode }: EmailHeaderProps) {
    const bgColor = isDarkMode ? "#0f172a" : "#ffffff";
    const orbColor1 = isDarkMode ? "rgba(124, 42, 232, 0.35)" : "rgba(124, 42, 232, 0.15)";
    const orbColor2 = isDarkMode ? "rgba(14, 200, 252, 0.30)" : "rgba(14, 200, 252, 0.12)";
    const gridColor = isDarkMode ? "rgba(148, 163, 184, 0.06)" : "rgba(100, 116, 139, 0.04)";
    const logo = isDarkMode ? verticalLogoSloganWhite : verticalLogoSlogan;

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
                        <img
                            src={logo}
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
export function getEmailHeaderHTML(isDarkMode: boolean, logoUrl: string): string {
    const bgColor = isDarkMode ? "#0f172a" : "#ffffff";
    const orbColor1 = isDarkMode ? "rgba(124, 42, 232, 0.35)" : "rgba(124, 42, 232, 0.15)";
    const orbColor2 = isDarkMode ? "rgba(14, 200, 252, 0.30)" : "rgba(14, 200, 252, 0.12)";
    const gridColor = isDarkMode ? "rgba(148, 163, 184, 0.06)" : "rgba(100, 116, 139, 0.04)";

    return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: ${bgColor}; background-image: radial-gradient(ellipse 400px 300px at 0% 0%, ${orbColor1} 0%, transparent 70%), radial-gradient(ellipse 400px 300px at 100% 100%, ${orbColor2} 0%, transparent 70%), linear-gradient(to right, ${gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridColor} 1px, transparent 1px); background-size: 100% 100%, 100% 100%, 24px 24px, 24px 24px;">
      <tr>
        <td align="center" style="padding: 40px 20px 40px;">
          <img src="${logoUrl}" alt="BlanketSmith" width="180" style="display: block; max-width: 180px; height: auto;" />
        </td>
      </tr>
    </table>
  `;
}
