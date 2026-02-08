console.log("Templates module loaded");

// ========================================
// EMAIL DESIGN SYSTEM (Cinematic)
// ========================================

const ASSET_BASE = "https://blanket-smith-landing-page.vercel.app/email-assets/";

// --- Helper Components ---

function getEmailButtonHTML(href: string, text: string): string {
    return `
    <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
      <tr>
        <td align="center" style="background: linear-gradient(135deg, #7C2AE8 0%, #374FD9 75%, #0EC8FC 100%); border-radius: 12px; box-shadow: 0 4px 14px rgba(124, 42, 232, 0.4), 0 0 30px rgba(124, 42, 232, 0.25), 0 0 50px rgba(14, 200, 252, 0.15);">
          <a href="${href}" style="display: inline-block; padding: 16px 32px; color: #ffffff; font-size: 16px; font-family: Poppins, system-ui, sans-serif; font-weight: 600; text-decoration: none; border-radius: 12px;">${text}</a>
        </td>
      </tr>
    </table>
  `;
}

function getGradientTextHTML(text: string): string {
    return `<span class="gradient-text" style="background: linear-gradient(135deg, #7C2AE8 0%, #0EC8FC 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #0EC8FC;">${text}</span>`;
}

function getSectionHeaderHTML(text: string): string {
    return `
    <h1 class="section-header" style="margin: 0 0 16px; padding: 16px 0; font-size: 28px; font-weight: 700; font-family: Poppins, system-ui, sans-serif; color: #1e293b; text-align: center; text-shadow: 0 0 20px rgba(124, 42, 232, 0.25), 0 0 40px rgba(14, 200, 252, 0.15);">
      ${text}
    </h1>
  `;
}

function getEmailHeaderHTML(): string {
    // Cinematic Header
    return `
    <table width="100%" cellpadding="0" cellspacing="0" class="email-header" style="background-color: #ffffff; background-image: radial-gradient(ellipse 400px 300px at 0% 0%, rgba(124, 42, 232, 0.15) 0%, transparent 70%), radial-gradient(ellipse 400px 300px at 100% 100%, rgba(14, 200, 252, 0.12) 0%, transparent 70%), linear-gradient(to right, rgba(100, 116, 139, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(100, 116, 139, 0.04) 1px, transparent 1px); background-size: 100% 100%, 100% 100%, 24px 24px, 24px 24px;">
      <tr>
        <td align="center" style="padding: 40px 20px 40px;">
          <img src="${ASSET_BASE}vertical-logo-slogan.png" class="logo-light" alt="BlanketSmith" width="180" style="display: block; max-width: 180px; height: auto;" />
          <img src="${ASSET_BASE}vertical-logo-slogan-white.png" class="logo-dark" alt="BlanketSmith" width="180" style="display: none; max-width: 180px; height: auto;" />
        </td>
      </tr>
    </table>
  `;
}

function getEmailFooterHTML(): string {
    const year = new Date().getFullYear();
    return `
    <table width="100%" cellpadding="0" cellspacing="0" class="email-footer" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
      <tr>
        <td style="padding: 32px 20px 24px;">
          <!-- Logo -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            <tr>
              <td align="center">
                <img src="${ASSET_BASE}vertical-logo-slogan.png" class="logo-light" alt="BlanketSmith" width="160" style="display: block; max-width: 160px; height: auto;" />
                <img src="${ASSET_BASE}vertical-logo-slogan-white.png" class="logo-dark" alt="BlanketSmith" width="160" style="display: none; max-width: 160px; height: auto;" />
              </td>
            </tr>
          </table>

          <!-- Social Links Row 1 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 8px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 0 12px;"><a href="https://facebook.com/blanketsmith" class="social-link" style="color: #7c2ae8; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">Facebook</a></td>
                    <td style="padding: 0 12px;"><a href="https://twitter.com/blanketsmith" class="social-link" style="color: #7c2ae8; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">Twitter</a></td>
                    <td style="padding: 0 12px;"><a href="https://instagram.com/blanketsmith" class="social-link" style="color: #7c2ae8; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">Instagram</a></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Social Links Row 2 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 0 12px;"><a href="https://youtube.com/@blanketsmith" class="social-link" style="color: #7c2ae8; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">YouTube</a></td>
                    <td style="padding: 0 12px;"><a href="https://tiktok.com/@blanketsmith" class="social-link" style="color: #7c2ae8; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">TikTok</a></td>
                    <td style="padding: 0 12px;"><a href="https://discord.gg/blanketsmith" class="social-link" style="color: #7c2ae8; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">Discord</a></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Legal & Copyright -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <p class="footer-text" style="color: #64748b; font-size: 12px; font-family: Inter, system-ui, sans-serif; margin: 0 0 16px;">
                  <a href="#" class="footer-link" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> · 
                  <a href="#" class="footer-link" style="color: #64748b; text-decoration: underline;">Privacy Policy</a> · 
                  <a href="#" class="footer-link" style="color: #64748b; text-decoration: underline;">Terms of Service</a>
                </p>
                <p class="footer-text" style="color: #64748b; font-size: 12px; font-family: Inter, system-ui, sans-serif; margin: 0;">
                  Made with <img src="${ASSET_BASE}favicon-badge.png" alt="love" width="16" height="16" style="display: inline-block; vertical-align: middle;" /> for the community
                </p>
                <p class="footer-text" style="color: #64748b; font-size: 11px; font-family: Inter, system-ui, sans-serif; margin: 12px 0 0;">
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

function getEmailFeatureCardHTML(title: string, description: string, icon: string = "zap", fullWidth: boolean = false): string {
    const iconPaths: Record<string, string> = {
        zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
        layout: "M3 3h7v9H3V3zm11 0h7v5h-7V3zm0 8h7v9h-7v-9zM3 15h7v6H3v-6z",
        settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z",
        users: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
        lightbulb: "M9 21h6 M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2.8c-1.79-1.04-3-2.98-3-5.2a6 6 0 016-6z",
    };

    const width = fullWidth ? "100%" : "50%";
    const padding = fullWidth ? "8px 0" : "8px";

    return `
    <td width="${width}" class="feature-card-wrapper" valign="top" style="padding: ${padding};">
      <div class="feature-card" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; height: 160px; box-sizing: border-box;">
        <div class="feature-icon" style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(14, 200, 252, 0.08) 100%); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 0 12px rgba(124, 42, 232, 0.2), 0 0 20px rgba(14, 200, 252, 0.1); border: 1px solid rgba(124, 42, 232, 0.15);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="feature-icon-svg" stroke="#7c2ae8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="${iconPaths[icon] || iconPaths.zap}" />
          </svg>
        </div>
        <h4 class="feature-title" style="margin: 0 0 8px; font-size: 15px; font-weight: 600; font-family: Poppins, system-ui, sans-serif; color: #1e293b;">${title}</h4>
        <p class="feature-desc" style="margin: 0; font-size: 13px; line-height: 1.5; font-family: Inter, system-ui, sans-serif; color: #64748b;">${description}</p>
      </div>
    </td>
  `;
}

function getEmailProgressRailHTML(currentStep: number): string {
    const steps = ["Signup", "Verification", "Beta Access", "Forge"];
    // Default Light Mode Colors
    const activeGradient = "linear-gradient(135deg, #7C2AE8 0%, #374FD9 75%, #0EC8FC 100%)";
    const completedGreen = "#22c55e";
    const inactiveBg = "#e2e8f0";
    const textColor = "#1e293b";
    const mutedColor = "#94a3b8";

    const stepsHtml = steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isFuture = index > currentStep;

        // Inline styles for base state (Light Mode)
        const bgStyle = isCompleted ? `background: ${completedGreen};` : (isActive ? `background: ${activeGradient};` : `background: ${inactiveBg};`);
        const labelStyle = isCompleted ? `color: ${completedGreen};` : (isActive ? `color: ${textColor};` : `color: ${mutedColor};`);
        const fontStyle = isActive ? "font-weight: 600;" : "font-weight: 400;";
        const boxShadow = isCompleted ? "box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);" : "";
        const circleContent = isCompleted
            ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`
            : `${index + 1}`;

        let classes = "progress-step";
        if (isCompleted) classes += " completed";
        if (isActive) classes += " active";
        if (isFuture) classes += " future";

        return `
            <td align="center" width="${100 / steps.length}%" style="vertical-align: top;">
                <div class="${classes}-circle" style="width: 32px; height: 32px; border-radius: 50%; ${bgStyle} margin: 0 auto 8px; line-height: 32px; text-align: center; color: ${isFuture ? mutedColor : "#fff"}; font-family: Poppins, system-ui, sans-serif; font-weight: 600; font-size: 14px; ${boxShadow}">
                    ${circleContent}
                </div>
                <span class="${classes}-label" style="display: block; font-size: 12px; font-family: Inter, system-ui, sans-serif; ${labelStyle} ${fontStyle}">
                    ${step}
                </span>
            </td>
        `;
    }).join("");

    return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>${stepsHtml}</tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function getCinematicShellHTML(content: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>BlanketSmith</title>
    <style>
        :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
        }

        @media (prefers-color-scheme: dark) {
            /* Shell & Backgrounds */
            .shell-bg { background-color: #0a0f1a !important; }
            .card-bg { background-color: #0f172a !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important; }
            
            /* Text Colors */
            .text-main { color: #e2e8f0 !important; }
            .text-muted { color: #94a3b8 !important; }
            .section-header { color: #e2e8f0 !important; text-shadow: 0 0 30px rgba(124, 42, 232, 0.5), 0 0 60px rgba(14, 200, 252, 0.3) !important; }
            
            /* Header */
            .email-header { 
                background-color: #0f172a !important;
                background-image: 
                    radial-gradient(ellipse 400px 300px at 0% 0%, rgba(124, 42, 232, 0.35) 0%, transparent 70%),
                    radial-gradient(ellipse 400px 300px at 100% 100%, rgba(14, 200, 252, 0.30) 0%, transparent 70%),
                    linear-gradient(to right, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(148, 163, 184, 0.06) 1px, transparent 1px) !important;
            }
            .logo-light { display: none !important; }
            .logo-dark { display: block !important; }
            
            /* Feature Cards */
            .feature-card { background-color: #1e293b !important; border-color: #334155 !important; }
            .feature-title { color: #f1f5f9 !important; }
            .feature-desc { color: #94a3b8 !important; }
            .feature-icon { 
                background: linear-gradient(135deg, rgba(124, 42, 232, 0.2) 0%, rgba(14, 200, 252, 0.15) 100%) !important;
                box-shadow: 0 0 12px rgba(14, 200, 252, 0.3), 0 0 20px rgba(124, 42, 232, 0.2) !important;
                border-color: rgba(14, 200, 252, 0.2) !important;
            }
            .feature-icon-svg { stroke: #0ec8fc !important; }

            /* Footer */
            .email-footer { background-color: #0f172a !important; border-top-color: #1e293b !important; }
            .social-link { color: #0ec8fc !important; }
            .footer-text { color: #94a3b8 !important; }
            .footer-link { color: #94a3b8 !important; }

             /* Info Box */
            .info-box { background-color: #1e293b !important; }
            .info-title { color: #e2e8f0 !important; }
            .info-desc { color: #94a3b8 !important; }
            .info-icon-box {
                background: linear-gradient(135deg, rgba(124, 42, 232, 0.2) 0%, rgba(14, 200, 252, 0.15) 100%) !important;
                box-shadow: 0 0 12px rgba(14, 200, 252, 0.3), 0 0 20px rgba(124, 42, 232, 0.2) !important;
                 border: 1px solid rgba(14, 200, 252, 0.2) !important;
            }
            .info-icon-svg { stroke: #0ec8fc !important; }
            
            /* Progress Rail */
            .progress-step-circle { background: #1e293b !important; color: #64748b !important; } /* Future steps */
            .progress-step-label { color: #e2e8f0 !important; } /* Active step */
            .future-label { color: #64748b !important; }
            .active-circle { background: linear-gradient(135deg, #7C2AE8 0%, #374FD9 75%, #0EC8FC 100%) !important; color: #fff !important; }
            .completed-circle { background: #22c55e !important; color: #fff !important; box-shadow: 0 0 12px rgba(34, 197, 94, 0.4) !important; }
            .completed-label { color: #22c55e !important; }
        }

        /* Mobile Responsiveness */
        @media only screen and (max-width: 600px) {
            .container-padding { padding: 24px 20px 32px !important; }
            .feature-card-wrapper { display: block !important; width: 100% !important; padding-right: 0 !important; }
            .feature-card { height: auto !important; }
        }
    </style>
</head>
<body class="shell-bg" style="margin: 0; padding: 0; background-color: #f8fafc; font-family: Inter, system-ui, sans-serif; -webkit-font-smoothing: antialiased; word-spacing: normal;">
    <div class="shell-bg" style="background-color: #f8fafc; min-height: 100vh;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
                <td align="center" style="padding: 20px;">
                    <table class="card-bg" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); max-width: 600px; width: 100%;">
                        <!-- Header -->
                        <tr>
                            <td>
                                ${getEmailHeaderHTML()}
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td class="container-padding" style="padding: 32px 40px 40px;">
                                ${content}
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td>
                                ${getEmailFooterHTML()}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
  `;
}

// --- Main Templates ---

export const getBetaTemplate = (name: string) => {
    console.log("Rendering Beta Template for:", name);
    const greeting = name ? `Welcome, ${name}!` : "Welcome!";

    // Feature cards as inline HTML for the template
    const featureCards = `
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                ${getEmailFeatureCardHTML("Instant Patterns", "Transform your vision into precise, ready-to-use patterns in seconds.")}
                ${getEmailFeatureCardHTML("Modern Interface", "A beautiful, intuitive design built for the modern maker.")}
            </tr>
            <tr>
                 ${getEmailFeatureCardHTML("Precision Tools", "Fine-tune every detail with our professional-grade editing tools.")}
                 ${getEmailFeatureCardHTML("Community First", "Join a growing community of passionate crafters and creators.")}
            </tr>
        </table>
    `;

    const content = `
        ${getSectionHeaderHTML(`Welcome to ${getGradientTextHTML("The Forge")}`)}
        
        <p class="text-muted" style="margin: 0 0 32px; fontSize: 18px; fontWeight: 500; color: #64748b; textAlign: center;">
            You're in.
        </p>

        ${getEmailProgressRailHTML(1)}

        <p class="text-main" style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #1e293b;">
            BlanketSmith is currently in a limited Beta, and you've secured a front-row seat to the future of pattern design. We're building something special for makers who value precision, creativity, and a streamlined workflow.
        </p>

        <p class="text-main" style="margin: 0 0 32px; font-size: 15px; line-height: 1.7; color: #1e293b;">
            Please verify your email to continue your journey into The Forge.
        </p>

        <div style="text-align: center; margin-bottom: 32px;">
            ${getEmailButtonHTML("#", "Verify Email Address")}
        </div>

        ${featureCards}

        <!-- Info Box (What Happens Next) -->
        <div class="info-box" style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-top: 24px; border-left: 4px solid #7C2AE8;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td width="52" valign="top" style="padding-right: 16px;">
                        <div class="info-icon-box" style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(14, 200, 252, 0.08) 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(124, 42, 232, 0.2), 0 0 20px rgba(14, 200, 252, 0.1); border: 1px solid rgba(124, 42, 232, 0.15);">
                            <svg class="info-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c2ae8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21h6 M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2.8c-1.79-1.04-3-2.98-3-5.2a6 6 0 016-6z" />
                            </svg>
                        </div>
                    </td>
                    <td valign="top">
                        <p class="info-title" style="margin: 0 0 8px; font-size: 15px; font-weight: 600; font-family: Poppins, system-ui, sans-serif; color: #1e293b;">What Happens Next?</p>
                        <p class="info-desc" style="margin: 0; font-size: 14px; line-height: 1.6; color: #64748b;">Once verified, you'll receive your Beta credentials via email within 24-48 hours. These credentials will grant you early access to The Forge where you can start creating patterns, exploring tools, and joining our community of makers.</p>
                    </td>
                </tr>
            </table>
        </div>
    `;

    return {
        subject: "Welcome to BlanketSmith Beta",
        html: getCinematicShellHTML(content),
    };
};

export const getPartnershipTemplate = (name: string) => {
    console.log("Rendering Partnership Template for:", name);
    const content = `
        ${getSectionHeaderHTML(`Let's Build the ${getGradientTextHTML("Future of Craft")}`)}

        <p class="text-main" style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #1e293b;">
            Thank you for reaching out about a potential partnership. We sit at the intersection of craftsmanship and modern software, and we're always excited to explore collaborations that push the boundaries of what's possible.
        </p>

        <p class="text-main" style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #1e293b;">
            Our team has received your inquiry and will be reviewing it carefully. We typically respond within 2-3 business days, but please know that every partnership opportunity receives our full attention.
        </p>

        <p class="text-muted" style="margin: 0 0 32px; font-size: 15px; line-height: 1.7; color: #64748b; font-style: italic;">
            "The best tools are built by those who understand both the craft and the maker."
        </p>

        <div style="text-align: center; margin-bottom: 24px;">
             ${getEmailButtonHTML("#", "Learn More About BlanketSmith")}
        </div>
    `;

    return {
        subject: "Partnering with BlanketSmith",
        html: getCinematicShellHTML(content),
    };
};

export const getFeedbackTemplate = (name: string) => {
    console.log("Rendering Feedback Template for:", name);
    const content = `
        ${getSectionHeaderHTML(`Your Feedback is in ${getGradientTextHTML("The Forge")}`)}

        <p class="text-main" style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #1e293b;">
            Accuracy and craftsmanship matter deeply to us. Your input is exactly how we evolve, and we want you to know that your feedback has been received and will be carefully reviewed by our team.
        </p>

        <p class="text-main" style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #1e293b;">
            Every suggestion, bug report, and feature request helps us build a better tool for the entire maker community. We're in this together.
        </p>

         <!-- Info Box (What Happens Next) -->
        <div class="info-box" style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 32px; border-left: 4px solid #7C2AE8;">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td width="52" valign="top" style="padding-right: 16px;">
                        <div class="info-icon-box" style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(14, 200, 252, 0.08) 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(124, 42, 232, 0.2), 0 0 20px rgba(14, 200, 252, 0.1); border: 1px solid rgba(124, 42, 232, 0.15);">
                            <svg class="info-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c2ae8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 21h6 M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2.8c-1.79-1.04-3-2.98-3-5.2a6 6 0 016-6z" />
                            </svg>
                        </div>
                    </td>
                    <td valign="top">
                        <p class="info-title" style="margin: 0 0 8px; font-size: 15px; font-weight: 600; font-family: Poppins, system-ui, sans-serif; color: #1e293b;">What happens next?</p>
                        <p class="info-desc" style="margin: 0; font-size: 14px; line-height: 1.6; color: #64748b;">Our team reviews all feedback weekly. If we need more details, we'll reach out directly. Major updates inspired by community input are highlighted in our changelog.</p>
                    </td>
                </tr>
            </table>
        </div>

        <div style="text-align: center;">
            ${getEmailButtonHTML("#", "View Our Roadmap")}
        </div>
    `;

    return {
        subject: "We've Received Your Feedback",
        html: getCinematicShellHTML(content),
    };
};

export const getDefaultTemplate = (name: string) => {
    console.log("Rendering Default Template for:", name);
    const content = `
        ${getSectionHeaderHTML("Message Received")}
        <p class="text-main" style="margin: 0 0 24px; font-size: 15px; line-height: 1.7; color: #1e293b;">
            Hi ${name || "there"}, thank you for contacting BlanketSmith. We have received your message and will get back to you shortly.
        </p>
    `;
    return {
        subject: "We received your message",
        html: getCinematicShellHTML(content)
    };
};

export const getAdminAlertTemplate = (record: any) => {
    console.log("Rendering Admin Alert Template");
    const rows = Object.entries(record).map(([key, value]) => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">${key}</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${String(value)}</td>
        </tr>
    `).join("");

    const content = `
        ${getSectionHeaderHTML("New Submission")}
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
            ${rows}
        </table>
    `;

    return {
        subject: `[Admin] New Submission: ${record.type || "Contact"}`,
        html: getCinematicShellHTML(content)
    };
};
