
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ASSET_BASE = "https://blanket-smith-landing-page.vercel.app/email-assets/";

// --- Helper Components ---

export function getEmailButtonHTML(text: string, href: string): string {
    return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 16px 0;">
          <a href="${href}" class="email-button" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7C2AE8 0%, #3B82F6 100%); color: #ffffff; font-family: Inter, system-ui, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(124, 42, 232, 0.2), 0 2px 4px -1px rgba(124, 42, 232, 0.1);">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function getGradientTextHTML(text: string): string {
    // New Trip-Color Gradient: Purple -> Mid Blue -> Cyan
    return `<span class="gradient-text" style="background: linear-gradient(135deg, #7C2AE8 0%, #3B82F6 50%, #0EC8FC 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #0EC8FC;">${text}</span>`;
}

export function getSectionHeaderHTML(text: string): string {
    return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
        <tr>
            <td align="center" style="padding: 24px 0; background: radial-gradient(50% 50% at 50% 50%, rgba(124, 42, 232, 0.1) 0%, rgba(255, 255, 255, 0) 100%);">
                <h2 class="section-header" style="margin: 0; font-size: 24px; font-weight: 700; font-family: Poppins, system-ui, sans-serif; text-align: center; background: linear-gradient(135deg, #7C2AE8 0%, #3B82F6 50%, #0EC8FC 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #7C2AE8;">
                  ${text}
                </h2>
            </td>
        </tr>
    </table>
  `;
}

export function getEmailHeaderHTML(): string {
    // Cinematic Header with Horizontal Logo + Graph Paper Effect
    return `
    <table width="100%" cellpadding="0" cellspacing="0" class="email-header graph-paper-bg" style="background-color: #ffffff;">
      <tr>
        <td align="center" style="padding: 40px 20px 40px;">
          <!-- Light Mode Wrapper -->
          <div class="light-img-box" style="display: block;">
             <img src="${ASSET_BASE}horizontal-logo.png" alt="BlanketSmith" width="260" style="display: block; max-width: 260px; height: auto;" />
          </div>
          <!-- Dark Mode Wrapper (Hidden by default) -->
          <!--[if !mso]><!-->
          <div class="dark-img-box" style="display: none; mso-hide: all; overflow: hidden; width: 0; height: 0; max-height: 0;">
             <img src="https://blanket-smith-landing-page.vercel.app/email-assets/horizontal-logo-white.png?v=8" alt="BlanketSmith" width="260" style="display: block; max-width: 260px; height: auto; border: 0;" />
          </div>
          <!--<![endif]-->
        </td>
      </tr>
    </table>
  `;
}

export function getEmailFooterHTML(): string {
    const year = new Date().getFullYear();
    return `
    <table width="100%" cellpadding="0" cellspacing="0" class="email-footer" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
      <tr>
        <td style="padding: 32px 20px 24px;">
          <!-- Logo - Centered - Vertical No Slogan -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
            <tr>
              <td align="center">
                <!-- Light Mode Wrapper -->
                <div class="light-img-box" style="display: block;">
                  <img src="${ASSET_BASE}vertical-logo-no-slogan.png" alt="BlanketSmith" width="120" style="display: block; max-width: 120px; height: auto;" />
                </div>
                <!-- Dark Mode Wrapper -->
                <!--[if !mso]><!-->
                <div class="dark-img-box" style="display: none; mso-hide: all; overflow: hidden; width: 0; height: 0; max-height: 0;">
                  <img src="${ASSET_BASE}PNG/dark-version/Vetical-Lockup-No-Slogan-PNG.png" alt="BlanketSmith" width="120" style="display: block; max-width: 120px; height: auto;" />
                </div>
                 <!--<![endif]-->
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
                  <!-- Use same heart icon for both modes -->
                  Made with <img src="${ASSET_BASE}favicon-heart.png" alt="love" width="16" height="16" style="display: inline-block; vertical-align: middle;" /> for the community
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

export function getEmailFeatureCardHTML(title: string, description: string, iconUrl: string): string {
    return `
    <td class="feature-card-wrapper" valign="top" style="padding: 8px;">
      <div class="feature-card" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; height: 160px; box-sizing: border-box;">
        <!-- Added Glow Effect to Icon Container -->
        <div class="feature-icon" style="width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(14, 200, 252, 0.08) 100%); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; box-shadow: 0 0 15px rgba(124, 42, 232, 0.3), 0 0 25px rgba(14, 200, 252, 0.15); border: 1px solid rgba(124, 42, 232, 0.15);">
          <img src="${iconUrl}" alt="${title} icon" width="20" height="20" class="feature-icon-svg" style="display: block;" />
        </div>
        <h4 class="feature-title" style="margin: 0 0 8px; font-size: 15px; font-weight: 600; font-family: Poppins, system-ui, sans-serif; color: #1e293b;">${title}</h4>
        <p class="feature-desc" style="margin: 0; font-size: 13px; line-height: 1.5; font-family: Inter, system-ui, sans-serif; color: #64748b;">${description}</p>
      </div>
    </td>
  `;
}

export function getInfoBoxHTML(title: string, description: string, iconUrl: string = `${ASSET_BASE}icons/lightbulb.png`): string {
    // Styling Updates: Gradient border and icon background
    return `
    <div class="info-box" style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-top: 24px; border-left: 4px solid #7C2AE8; border-image: linear-gradient(to bottom, #7C2AE8, #3B82F6) 1 100%;">
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td width="52" valign="top" style="padding-right: 16px;">
                    <!-- Added Glow Effect to Icon Container -->
                    <div class="info-icon-box" style="width: 36px; height: 36px; border-radius: 8px; background: linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(14, 200, 252, 0.08) 100%); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(124, 42, 232, 0.3), 0 0 25px rgba(14, 200, 252, 0.15); border: 1px solid rgba(124, 42, 232, 0.15);">
                        <img src="${iconUrl}" alt="${title} icon" width="18" height="18" class="info-icon-svg" style="display: block;" />
                    </div>
                </td>
                <td valign="top">
                    <!-- Title with Gradient Color if desired, kept dark for readability but could change -->
                    <p class="info-title" style="margin: 0 0 8px; font-size: 15px; font-weight: 600; font-family: Poppins, system-ui, sans-serif; color: #1e293b;">${title}</p>
                    <p class="info-desc" style="margin: 0; font-size: 14px; line-height: 1.6; font-family: Inter, system-ui, sans-serif; color: #64748b;">${description}</p>
                </td>
            </tr>
        </table>
    </div>
    `;
}

export function getEmailProgressRailHTML(currentStep: number): string {
    const steps = [
        { label: "Sign Up", id: 1 },
        { label: "Verification", id: 2 },
        { label: "Beta Access", id: 3 },
        { label: "The Forge", id: 4 },
    ];

    let stepsHTML = "";

    steps.forEach((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        let circleStyle = `width: 24px; height: 24px; border-radius: 50%; display: inline-block; vertical-align: middle; text-align: center; line-height: 24px; font-size: 12px; font-weight: 600; font-family: Inter, sans-serif; margin-bottom: 8px;`;

        if (isActive) {
            // Updated to use brand gradient
            circleStyle += `background: linear-gradient(135deg, #7C2AE8 0%, #3B82F6 50%, #0EC8FC 100%); color: #ffffff; box-shadow: 0 0 0 4px rgba(124, 42, 232, 0.2);`;
        } else if (isCompleted) {
            circleStyle += `background-color: #10b981; color: #ffffff;`;
        } else {
            circleStyle += `background-color: #e2e8f0; color: #94a3b8;`;
        }

        const labelColor = isActive ? "#1e293b" : isCompleted ? "#059669" : "#94a3b8";

        stepsHTML += `
        <td align="center" width="25%">
            <div style="${circleStyle}">
                ${isCompleted ? "✓" : step.id}
            </div>
            <div style="font-size: 10px; font-weight: 500; font-family: Inter, sans-serif; color: ${labelColor}; white-space: nowrap;">
                ${step.label}
            </div>
        </td>
        `;
    });

    return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
            ${stepsHTML}
        </tr>
    </table>
    `;
}

export function getCinematicShellHTML(content: string, isDarkMode: boolean = false, isMobile: boolean = false): string {
    // Modern color palette & variables
    const bgColor = isDarkMode ? "#0f172a" : "#ffffff";
    const textColor = isDarkMode ? "#e2e8f0" : "#1e293b";
    const surfaceColor = isDarkMode ? "#1e293b" : "#f8fafc";

    return `
    <!DOCTYPE html>
    <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <!-- Explicitly declare Dark Mode support -->
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <title>BlanketSmith</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap');
        
        /* Enable Dark Mode in Email Clients */
        :root {
          color-scheme: light dark;
          supported-color-schemes: light dark;
        }

        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        
        body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: ${surfaceColor}; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: ${textColor}; }
        
        /* Robust Logo Swapping via Wrappers */
        .light-img-box { display: block; }
        .dark-img-box { display: none; mso-hide: all; }

        /* Graph Paper Effect */
        /* Updated: Reduced opacity for softer look (0.15 -> 0.08) */
        .graph-paper-bg {
          background-image: 
            radial-gradient(ellipse 400px 300px at 0% 0%, rgba(124, 42, 232, 0.15) 0%, transparent 70%), 
            radial-gradient(ellipse 400px 300px at 100% 100%, rgba(14, 200, 252, 0.12) 0%, transparent 70%), 
            linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), 
            linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px) !important;
          background-size: 100% 100%, 100% 100%, 30px 30px, 30px 30px !important;
        }

        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
          .email-body { background-color: #0f172a !important; color: #e2e8f0 !important; }
          .email-card { background-color: #1e293b !important; border-color: #334155 !important; }
          
          /* Robust Logo Swapping via Wrappers */
          .light-img-box { display: none !important; mso-hide: all !important; font-size: 0 !important; max-height: 0 !important; line-height: 0 !important; }
          .dark-img-box { display: block !important; overflow: visible !important; width: auto !important; height: auto !important; max-height: none !important; }

          .text-primary { color: #e2e8f0 !important; }
          .text-secondary { color: #94a3b8 !important; }
          
          /* Dark Mode Graph Paper */
          .graph-paper-bg {
            background-color: #0f172a !important;
            background-image: 
              radial-gradient(ellipse 400px 300px at 0% 0%, rgba(124, 42, 232, 0.25) 0%, transparent 70%), 
              radial-gradient(ellipse 400px 300px at 100% 100%, rgba(14, 200, 252, 0.22) 0%, transparent 70%), 
              linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), 
              linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px) !important;
          }
        }

        /* Outlook.com / Office 365 Dark Mode Attribute Targeting */
        [data-ogsc] .light-img-box { display: none !important; mso-hide: all !important; font-size: 0 !important; max-height: 0 !important; }
        [data-ogsc] .dark-img-box { display: block !important; overflow: visible !important; width: auto !important; height: auto !important; max-height: none !important; }
        [data-ogsc] .email-body { background-color: #0f172a !important; color: #e2e8f0 !important; }

        
        /* Mobile Optimizations */
        @media screen and (max-width: 600px) {
          .email-container { width: 100% !important; padding: 0 !important; }
          .email-content { padding: 24px 16px !important; }
          .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
        }
      </style>
    </head>
    <body class="email-body">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: ${surfaceColor}; margin: 0; padding: 0;">
        <tr>
          <td align="center">
            <table class="email-container" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; margin: 0 auto; background-color: ${bgColor}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              
              <!-- Cinematic Header -->
              <tr>
                <td>
                  ${getEmailHeaderHTML()}
                </td>
              </tr>

              <!-- Main Content Area -->
              <tr>
                <td class="email-content" style="padding: 0 32px 40px;">
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
            
            <!-- Spacer for bottom padding -->
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr><td height="40" style="font-size: 0; line-height: 0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// TEMPLATE EXPORTS

export const getBetaTemplate = (verificationLink: string) => {
    // Glow Re-centering: Applied to the container behind the header
    // Updated: Elliptical stretch, wider (300px width, 120px height), centered behind text.
    // Removed "hard break" by extending fade out radius and lowering opacity at edges.
    // Updated Position: "raised and centered around the header more" -> `at 50% 30%` (higher up)
    const content = `
    <!-- Header Section with Centered Body Glow -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td align="center" style="padding: 24px 24px 32px; background: radial-gradient(ellipse 340px 160px at 50% 30%, rgba(124, 42, 232, 0.18) 0%, rgba(255, 255, 255, 0) 70%);">
          <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; font-family: Poppins, system-ui, sans-serif; color: #1e293b;">
            Welcome to ${getGradientTextHTML("The Forge")}
          </h1>
          <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.6; color: #64748b; font-family: Inter, system-ui, sans-serif;">
            You're in.
          </p>
          ${getEmailProgressRailHTML(2)}
        </td>
      </tr>
    </table>

    <!-- Intro Text -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
          <td align="left">
            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
              BlanketSmith is currently in a limited Beta, and you've secured a front-row seat to the future of pattern design. We're building something special for makers who value precision, creativity, and a streamlined workflow.
            </p>
          </td>
      </tr>
    </table>

     <!-- What Happens Next (Moved Up) -->
    ${getInfoBoxHTML(
        "What Happens Next?",
        "Once verified, you'll receive your Beta credentials via email within 24-48 hours. These credentials will grant you early access to The Forge where you can start creating patterns, exploring tools, and joining our community of makers."
    )}

    <!-- Verification Call to Action -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
      <tr>
        <td align="center">
            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
              Please verify your email to continue your journey into The Forge.
            </p>
            ${getEmailButtonHTML("Verify Email Address", verificationLink)}
        </td>
      </tr>
    </table>

    <!-- Features Grid -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 16px;">
          ${getEmailFeatureCardHTML(
        "Instant Patterns",
        "Transform your vision into precise, ready-to-use patterns in seconds.",
        "https://blanket-smith-landing-page.vercel.app/icons/magic-wand.png"
    )}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
          ${getEmailFeatureCardHTML(
        "Modern Interface",
        "A beautiful, intuitive design built for the modern maker.",
        "https://blanket-smith-landing-page.vercel.app/icons/layout.png"
    )}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
          ${getEmailFeatureCardHTML(
        "Precision Tools",
        "Fine-tune every detail with our professional-grade editing tools.",
        "https://blanket-smith-landing-page.vercel.app/icons/settings.png"
    )}
        </td>
      </tr>
      <tr>
        <td>
          ${getEmailFeatureCardHTML(
        "Community First",
        "Join a growing community of passionate crafters and creators.",
        "https://blanket-smith-landing-page.vercel.app/icons/users.png"
    )}
        </td>
      </tr>
    </table>
  `;

    return {
        subject: "Welcome to The Forge",
        html: getCinematicShellHTML(content),
    };
};

export const getPartnershipTemplate = (name: string) => {
    const content = `
    <!-- Header Section -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td align="center">
          <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; font-family: Poppins, system-ui, sans-serif; color: #1e293b;">
            Partnership Request Received
          </h1>
          <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.6; color: #64748b; font-family: Inter, system-ui, sans-serif;">
            Thank you for reaching out, ${name}!
          </p>
        </td>
      </tr>
    </table>

    ${getInfoBoxHTML(
        "Our Team is Reviewing Your Request",
        "We're excited to learn more about how we can collaborate. A member of our partnerships team will be in touch shortly."
    )}
    
    <div style="text-align: center; margin-top: 24px;">
        ${getEmailButtonHTML("Learn More About BlanketSmith", "#")}
    </div>
  `;

    return {
        subject: "Partnering with BlanketSmith",
        html: getCinematicShellHTML(content)
    };
};

export const getFeedbackTemplate = (name: string) => {
    const content = `
    <!-- Header Section -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td align="center">
          <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; font-family: Poppins, system-ui, sans-serif; color: #1e293b;">
            Feedback Received
          </h1>
          <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.6; color: #64748b; font-family: Inter, system-ui, sans-serif;">
            Thanks for your input, ${name}!
          </p>
        </td>
      </tr>
    </table>

    ${getInfoBoxHTML(
        "Your Voice Matters",
        "We truly appreciate you taking the time to share your thoughts. Your feedback helps us shape the future of BlanketSmith."
    )}
    
    <div style="text-align: center; margin-top: 24px;">
        ${getEmailButtonHTML("View Our Roadmap", "#")}
    </div>
  `;

    return {
        subject: "We've Received Your Feedback",
        html: getCinematicShellHTML(content)
    };
};

export const getDefaultTemplate = (name: string, email: string, message: string) => {
    const content = `
     <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td align="center">
          <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; font-family: Poppins, system-ui, sans-serif; color: #1e293b;">
            Submission Received
          </h1>
           <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.6; color: #64748b; font-family: Inter, system-ui, sans-serif;">
            Hello ${name}, we have received your message.
          </p>
        </td>
      </tr>
    </table>
     ${getInfoBoxHTML(
        "Message Details",
        `" ${message} " - Sent from ${email}`
    )}
    `;
    return {
        subject: "We received your message",
        html: getCinematicShellHTML(content)
    };
};

export const getAdminAlertTemplate = (category: string, email: string, payload: any) => {
    const content = `
     <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td align="center">
          <h1 style="margin: 0 0 16px; font-size: 28px; font-weight: 700; letter-spacing: -0.02em; font-family: Poppins, system-ui, sans-serif; color: #1e293b;">
            New Submission: ${category}
          </h1>
           <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #64748b; font-family: Inter, system-ui, sans-serif;">
            From: ${email}
          </p>
        </td>
      </tr>
    </table>
    <pre style="background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 12px; color: #334155;">
${JSON.stringify(payload, null, 2)}
    </pre>
    `;
    return {
        subject: `[Admin] New Submission: ${category}`,
        html: getCinematicShellHTML(content)
    };
};
