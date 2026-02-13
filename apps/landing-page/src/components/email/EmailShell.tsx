import { EmailHeader } from "./EmailHeader";
import { EmailFooter } from "./EmailFooter";

// Helper to get global styles including the force-light-mode overrides
function getGlobalStyles(bgColor: string, surfaceColor: string, textColor: string) {
    return `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap');
        
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        
        body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: ${surfaceColor}; background-image: linear-gradient(${surfaceColor}, ${surfaceColor}); font-family: 'Inter', system-ui, -apple-system, sans-serif; color: ${textColor}; }
        
        /* Robust Logo Swapping via Wrappers */
        .light-img-box { display: block !important; }

        /* Graph Paper Effect */
        .graph-paper-bg {
          background-image: 
            linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px),
            radial-gradient(ellipse 600px 500px at 0% 0%, rgba(124, 42, 232, 0.8) 0%, transparent 70%), 
            radial-gradient(ellipse 600px 500px at 100% 100%, rgba(14, 200, 252, 0.8) 0%, transparent 70%) !important;
          background-size: 30px 30px, 30px 30px, 100% 100%, 100% 100% !important;
        }

        /* FORCE LIGHT MODE OVERRIDES */
        :root {
            color-scheme: light;
            supported-color-schemes: light;
        }
        
        /* Aggressively force white background and dark text even if client is in Dark Mode */
        @media (prefers-color-scheme: dark) {
            body, table, td, .email-body, .email-container, .email-content {
                background-color: ${surfaceColor} !important;
                color: ${textColor} !important;
            }
            .email-container, .feature-card, .info-box {
                background-color: ${bgColor} !important;
                color: ${textColor} !important;
            }
                h1, h2, h3, h4, p, span, a {
                color: inherit !important;
            }
            /* Re-assert specific text colors that might get overridden */
            .feature-title, .info-title { color: ${textColor} !important; }
            .feature-desc, .info-desc, .footer-text { color: #64748b !important; }
            
            /* Ensure the graph paper background persists */
            .graph-paper-bg {
                background-color: #ffffff !important;
                background-image: 
                linear-gradient(to right, rgba(148, 163, 184, 0.05) 1px, transparent 1px), 
                linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 1px, transparent 1px),
                radial-gradient(ellipse 600px 500px at 0% 0%, rgba(124, 42, 232, 0.8) 0%, transparent 70%), 
                radial-gradient(ellipse 600px 500px at 100% 100%, rgba(14, 200, 252, 0.8) 0%, transparent 70%) !important;
                background-size: 30px 30px, 30px 30px, 100% 100%, 100% 100% !important;
            }
        }

        /* Mobile Optimizations */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; padding: 0 !important; background-image: linear-gradient(${bgColor}, ${bgColor}) !important; }
            .email-content { padding: 24px 16px !important; }
            .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
        }
    `;
}

export function CinematicShell({
    isMobile,
    children,
}: {
    isMobile: boolean;
    children: React.ReactNode;
}) {
    // Fixed Light Mode Colors
    const bgColor = "#f8fafc";
    const cardBg = "#ffffff";
    const textColor = "#1e293b";
    const surfaceColor = "#f8fafc";


    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="x-apple-disable-message-reformatting" />
                <title>BlanketSmith</title>
                <style dangerouslySetInnerHTML={{ __html: getGlobalStyles(surfaceColor, textColor) }} />
            </head>
            <body className="email-body" style={{ margin: 0, padding: 0, width: "100%", height: "100%", backgroundColor: surfaceColor, fontFamily: "'Inter', system-ui, -apple-system, sans-serif", color: textColor }}>
                <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ backgroundColor: surfaceColor, margin: 0, padding: 0 }}>
                    <tbody>
                        <tr>
                            <td align="center">
                                <table className="email-container" width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: cardBg, borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" }}>
                                    <tbody>
                                        {/* Cinematic Header */}
                                        <tr>
                                            <td>
                                                <EmailHeader />
                                            </td>
                                        </tr>
                                        {/* Main Content Area */}
                                        <tr>
                                            <td className="email-content" style={{ padding: isMobile ? "24px 16px" : "0 32px 40px" }}>
                                                {children}
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
                                {/* Spacer for bottom padding */}
                                <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
                                    <tbody><tr><td height="40" style={{ fontSize: 0, lineHeight: 0 }}>&nbsp;</td></tr></tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
        </html>
    );
}
