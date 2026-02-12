
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ASSET_BASE = "https://blanket-smith-landing-page.vercel.app/email-assets/";

// --- Helper Components ---

export function getEmailButtonHTML(text: string, href: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 16px 0;">
          <a href="${href}" class="email-button" style="display: inline-block; padding: 14px 32px; background-color: #374FD9; background: linear-gradient(135deg, #7C2AE8 0%, #374FD9 75%, #0EC8FC 100%) no-repeat; color: #ffffff !important; font-family: Inter, system-ui, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(124, 42, 232, 0.2), 0 2px 4px -1px rgba(124, 42, 232, 0.1);">
            <span style="color: #ffffff !important">${text}</span>
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function getGradientTextHTML(text: string): string {
  // New Trip-Color Gradient: Purple -> Mid Blue -> Cyan
  // Note: 'display: inline-block' is often needed for background-clip to work on spans.
  // We use a robust fallback color (#3B82F6) and ensure text-fill-color is only applied if supported (mostly).
  return `<span class="gradient-text" style="display: inline-block; background-image: linear-gradient(135deg, #7C2AE8 0%, #374FD9 75%, #0EC8FC 100%); -webkit-background-clip: text; background-clip: text; color: #3B82F6; -webkit-text-fill-color: transparent; font-weight: 800;">${text}</span>`;
}

export function getSectionHeaderHTML(text: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px;">
        <tr>
            <td align="center" style="padding: 24px 0; background-color: #f8fafc; background: radial-gradient(50% 50% at 50% 50%, rgba(124, 42, 232, 0.1) 0%, rgba(255, 255, 255, 0) 100%);">
                <h2 class="section-header" style="margin: 0; font-size: 24px; font-weight: 700; font-family: Poppins, system-ui, sans-serif; text-align: center;">
                  <span style="display: inline-block; background-image: linear-gradient(135deg, #7C2AE8 0%, #374FD9 75%, #0EC8FC 100%); -webkit-background-clip: text; background-clip: text; color: #7C2AE8; -webkit-text-fill-color: transparent;">${text}</span>
                </h2>
            </td>
        </tr>
    </table>
  `;
}

export function getEmailHeadingHTML(title: string, subtitle: string, extraHTML: string = ""): string {
  // Cinematic Glow Header
  // Radial gradient: Elliptical stretch, wide and centered behind text.
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td align="center" style="padding: 24px 24px 32px; background: radial-gradient(ellipse 340px 160px at 50% 30%, rgba(124, 42, 232, 0.18) 0%, rgba(255, 255, 255, 0) 70%);">
          <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; font-family: Poppins, system-ui, sans-serif; color: #1e293b;">
            ${title}
          </h1>
          <p style="margin: 0 0 24px; font-size: 18px; line-height: 1.6; color: #64748b; font-family: Inter, system-ui, sans-serif;">
            ${subtitle}
          </p>
          ${extraHTML}
        </td>
      </tr>
    </table>
  `;
}

export function getEmailHeaderHTML(): string {
  // Universal Dark Header with Horizontal Logo + Graph Paper Effect
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0f172a" style="background-color: #0f172a;">
      <tr>
        <td align="center" valign="top">
          <table width="100%" cellpadding="0" cellspacing="0" class="email-header graph-paper-bg" style="background-color: #0f172a;" bgcolor="#0f172a">
            <tr>
              <td align="center" style="padding: 40px 20px 40px;">
                <!-- Universal White Logo -->
                <img 
                  src="${ASSET_BASE}horizontal-logo-white.png" 
                  alt="BlanketSmith" 
                  width="180" 
                  style="display: block; max-width: 180px; height: auto;" 
                />
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function getEmailFooterHTML(): string {
  const year = new Date().getFullYear();
  const refId = new Date().getTime();
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0f172a" style="background-color: #0f172a;">
      <tr>
        <td align="center" valign="top">
          <table width="100%" cellpadding="0" cellspacing="0" class="email-footer" style="background-color: #0f172a; background-image: linear-gradient(to bottom, #0f172a, #020617); border-top: 1px solid #334155;" bgcolor="#0f172a"><tr><td style="padding: 32px 20px 24px;"><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;"><tr><td align="center"><img src="${ASSET_BASE}vertical-logo-no-slogan-white.png" alt="BlanketSmith" width="140" style="display: block; max-width: 140px; height: auto;" /></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;"><tr><td align="center"><table cellpadding="0" cellspacing="0"><tr><td style="padding: 0 8px; color: #7C2AE8;"><a href="https://www.instagram.com/BlanketSmith_/" style="color: #7C2AE8 !important; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">Instagram</a></td><td style="padding: 0 8px; color: #7C2AE8;"><a href="https://www.x.com/BlanketSmith/" style="color: #7C2AE8 !important; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">Twitter</a></td><td style="padding: 0 8px; color: #7C2AE8;"><a href="https://youtube.com/@blanketsmithdotcom" style="color: #7C2AE8 !important; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">YouTube</a></td></tr><tr><td height="8" style="font-size: 0; line-height: 0;">&nbsp;</td></tr><tr><td style="padding: 0 8px; color: #7C2AE8;"><a href="https://www.facebook.com/people/BlanketSmith/61585611386677/" style="color: #7C2AE8 !important; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">Facebook</a></td><td style="padding: 0 8px; color: #7C2AE8;"><a href="https://www.tiktok.com/@blanketsmith_" style="color: #7C2AE8 !important; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">TikTok</a></td><td style="padding: 0 8px; color: #7C2AE8;"><a href="https://discord.com/invite/cmsAYn7d" style="color: #7C2AE8 !important; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none;">Discord</a></td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><p style="color: #94a3b8; font-size: 12px; font-family: Inter, system-ui, sans-serif; margin: 0 0 16px;"><a href="https://blanketsmith.com" style="color: #7C2AE8 !important; text-decoration: underline;">Unsubscribe</a> · <a href="https://blanketsmith.com" style="color: #7C2AE8 !important; text-decoration: underline;">Privacy Policy</a> · <a href="https://blanketsmith.com" style="color: #7C2AE8 !important; text-decoration: underline;">Terms of Service</a></p><p style="color: #cbd5e1 !important; font-size: 12px; font-family: Inter, system-ui, sans-serif; margin: 0;"><span style="color: #cbd5e1 !important;">Made with <img src="${ASSET_BASE}favicon-heart-v2.png" alt="love" width="16" height="16" style="display: inline-block; vertical-align: middle;" /> for the community</span></p><p style="color: #cbd5e1 !important; font-size: 11px; font-family: Inter, system-ui, sans-serif; margin: 12px 0 0;"><span style="color: #cbd5e1 !important;">© ${year} BlanketSmith. All rights reserved.</span><br/><span style="color: #334155; font-size: 10px;">Ref: ${refId}</span></p></td></tr></table></td></tr></table>
        </td>
      </tr>
    </table>
  `;
}

export function getEmailFeatureCardHTML(title: string, description: string, iconUrl: string): string {
  return `
    <td class="feature-card-wrapper" valign="top" style="padding: 8px;">
      <div class="feature-card" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 24px 20px; min-height: 160px; height: auto; box-sizing: border-box;">
        <!-- Added Glow Effect to Icon Container -->
        <div class="feature-icon" style="width: 40px; height: 40px; line-height: 40px; text-align: center; border-radius: 10px; background-color: #f3e8ff; background: linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(14, 200, 252, 0.08) 100%) no-repeat; margin-bottom: 12px; box-shadow: 0 0 12px rgba(124, 42, 232, 0.2), 0 0 20px rgba(14, 200, 252, 0.1); border: 1px solid rgba(124, 42, 232, 0.15);">
          <img src="${iconUrl}" alt="${title} icon" width="28" height="28" class="feature-icon-svg" style="display: inline-block; vertical-align: middle;" />
        </div>
        <h4 class="feature-title" style="margin: 0 0 8px; font-size: 15px; font-weight: 600; font-family: Poppins, system-ui, sans-serif; color: #1e293b;">${title}</h4>
        <p class="feature-desc" style="margin: 0; font-size: 13px; line-height: 1.5; font-family: Inter, system-ui, sans-serif; color: #64748b;">${description}</p>
      </div>
    </td>
  `;
}

export function getInfoBoxHTML(title: string, description: string, iconUrl: string = `${ASSET_BASE}icons/374FD9/light-bulb.png`): string {
  // Styling Updates: Gradient border and icon background
  return `
    <div class="info-box" style="background-color: #ffffff; border-radius: 12px; padding: 20px; margin-top: 24px; border-left: 4px solid #7C2AE8; border: 1px solid #e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td width="52" valign="top" style="padding-right: 16px;">
                    <!-- Added Glow Effect to Icon Container -->
                    <div class="info-icon-box" style="width: 36px; height: 36px; line-height: 36px; text-align: center; border-radius: 8px; background-color: #f3e8ff; background: linear-gradient(135deg, rgba(124, 42, 232, 0.1) 0%, rgba(14, 200, 252, 0.08) 100%) no-repeat; box-shadow: 0 0 12px rgba(124, 42, 232, 0.2), 0 0 20px rgba(14, 200, 252, 0.1); border: 1px solid rgba(124, 42, 232, 0.15);">
                        <img src="${iconUrl}" alt="${title} icon" width="24" height="24" class="info-icon-svg" style="display: inline-block; vertical-align: middle;" />
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

    let circleStyle = `width: 40px; height: 40px; border-radius: 50%; display: inline-block; vertical-align: middle; text-align: center; line-height: 40px; font-size: 16px; font-weight: 600; font-family: Inter, sans-serif; margin-bottom: 12px;`;

    if (isActive) {
      // Updated to use brand gradient
      circleStyle += `background-color: #374FD9; background: linear-gradient(135deg, #7C2AE8 0%, #374FD9 62%, #0EC8FC 100%) no-repeat; color: #ffffff; border: 2px solid #0EC8FC; background-clip: padding-box;`;
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
      <div style="font-size: 11px; font-weight: 600; font-family: Inter, sans-serif; color: ${labelColor}; white-space: nowrap; letter-spacing: -0.01em;">
        ${step.label}
      </div>
    </td>
      `;
  });

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px; margin-bottom: 0;">
      <tr>
      ${stepsHTML}
      </tr>
    </table>
      `;
}

export function getCinematicShellHTML(content: string, isMobile: boolean = false): string {
  // Modern color palette & variables
  const bgColor = "#ffffff";
  const textColor = "#1e293b";
  const surfaceColor = "#f8fafc";

  return `
    <!DOCTYPE html>
      <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
          <meta charset="utf-8">
          <meta name="color-scheme" content="light dark">
          <meta name="supported-color-schemes" content="light dark">
          <!--[if gte mso 9]>
          <xml>
            <o:OfficeDocumentSettings>
              <o:AllowPNG/>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
          <![endif]-->
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="x-apple-disable-message-reformatting">
          <meta name="color-scheme" content="light dark">
          <meta name="supported-color-schemes" content="light dark">
          <title>BlanketSmith</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700&display=swap');

            body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
            table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
            img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
            
            body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; background-color: ${surfaceColor}; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: ${textColor}; }

            /* Robust Logo Swapping via Wrappers */
            .light-img-box { display: block !important; }

            /* Graph Paper Effect */
            .graph-paper-bg {
              background-image:
                radial-gradient(ellipse 400px 300px at 0% 0%, rgba(124, 42, 232, 0.15) 0%, transparent 70%),
                radial-gradient(ellipse 400px 300px at 100% 100%, rgba(14, 200, 252, 0.12) 0%, transparent 70%),
                linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px) !important;
              background-size: 100% 100%, 100% 100%, 30px 30px, 30px 30px !important;
            }

            /* FORCE LIGHT MODE OVERRIDES */
            :root {
              color-scheme: light;
              supported-color-schemes: light;
            }

            /* Aggressively force white background and dark text even if client is in Dark Mode */
            @media (prefers-color-scheme: dark) {
              body, .email-body, .email-container, .email-content {
                background-color: ${surfaceColor} !important;
                color: ${textColor} !important;
              }
              .email-container, .feature-card, .info-box {
                background-color: ${bgColor} !important;
                color: ${textColor} !important;
              }
              .info-box {
                  background-color: #ffffff !important; /* Force light background for info box to maintain contrast */
                  color: #1e293b !important;
                  border: 1px solid #e2e8f0 !important;
              }
              h1, h2, h3, h4, p, span, a {
                color: inherit !important;
              }
              /* Re-assert specific text colors that might get overridden */
              .feature-title, .info-title { color: ${textColor} !important; }
              .feature-desc, .info-desc, .footer-text { color: #64748b !important; }

              /* Ensure the graph paper background persists */
              .graph-paper-bg {
                background-color: #0f172a !important;
                background-image:
                  radial-gradient(ellipse 400px 300px at 0% 0%, rgba(124, 42, 232, 0.40) 0%, transparent 70%),
                  radial-gradient(ellipse 400px 300px at 100% 100%, rgba(14, 200, 252, 0.40) 0%, transparent 70%),
                  linear-gradient(to right, rgba(255, 255, 255, 0.14) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.14) 1px, transparent 1px) !important;
                background-size: 100% 100%, 100% 100%, 30px 30px, 30px 30px !important;
              }
            }

            /* Mobile Optimizations */
            @media screen and (max-width: 600px) {
              .email-container { width: 100% !important; padding: 0 !important; background-image: linear-gradient(${bgColor}, ${bgColor}) !important; }
              .email-content { padding: 24px 16px !important; }
              .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
            }
          </style>
        </head>
        <body class="email-body">
          <!-- THREADING BUSTER: Invisible Ref ID at the top to prevent Gmail from collapsing content -->
          <div style="display:none; font-size:0; line-height:0; color:#334155; max-height:0; opacity:0; overflow:hidden;">Ref: ${new Date().getTime()}</div>
          
          <!-- VML Background for Outlook Desktop -->
          <!--[if gte mso 9]>
          <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
            <v:fill type="tile" color="#ffffff" />
          </v:background>
          <![endif]-->

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

                  <!-- Main Content Area with Multicolored Ambient Glow -->
                  <tr>
                    <td class="email-content" style="padding: 0 32px 40px; background-color: #ffffff; background-image: radial-gradient(circle at 50% 0%, rgba(124, 42, 232, 0.06) 0%, transparent 40%); background-repeat: no-repeat;">
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
    ${getEmailHeadingHTML(
    `Welcome to ${getGradientTextHTML("The Forge")}`,
    "🎉 You're in! 🎉",
    getEmailProgressRailHTML(2)
  )}

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
    "Generate Patterns",
    "Upload an image or snap a photo on mobile to instantly generate a custom pattern based on your unique settings.",
    `${ASSET_BASE}icons/374FD9/image-sparkle.png`
  )}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
          ${getEmailFeatureCardHTML(
    "Modern Interface",
    "Experience a beautiful, intuitive design built specifically for the modern maker, with dark mode and touch controls.",
    `${ASSET_BASE}icons/374FD9/dashboard.png`
  )}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
          ${getEmailFeatureCardHTML(
    "Precision Tools",
    "Fine-tune every stitch with professional-grade editing tools designed to give you complete control over your work.",
    `${ASSET_BASE}icons/374FD9/spanner.png`
  )}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
          ${getEmailFeatureCardHTML(
    "Community First",
    "Join a thriving community of makers. Share patterns, get feedback, and help shape the future of the platform.",
    `${ASSET_BASE}icons/374FD9/community.png`
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
    ${getEmailHeadingHTML(
    "Partnership Request Received",
    `Thank you for reaching out, ${name}!`
  )}

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
    ${getEmailHeadingHTML(
    "Feedback Received",
    `Thanks for your input, ${name}!`
  )}

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
    ${getEmailHeadingHTML(
    "Submission Received",
    `Hello ${name}, we have received your message.`
  )}
    ${getInfoBoxHTML(
    "Message Details",
    `"${message}" - Sent from ${email}`
  )}
  `;
  return {
    subject: "We received your message",
    html: getCinematicShellHTML(content)
  };
};

export const getAdminAlertTemplate = (category: string, email: string, payload: any) => {
  const content = `
    ${getEmailHeadingHTML(
    `New Submission: ${category}`,
    `From: ${email}`
  )}
    <pre style="background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; word-break: break-word; font-family: monospace; font-size: 12px; color: #334155;">
      ${JSON.stringify(payload, null, 2)}
    </pre>
  `;
  return {
    subject: `[Admin] New Submission: ${category}`,
    html: getCinematicShellHTML(content)
  };
};
