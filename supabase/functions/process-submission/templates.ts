
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ASSET_BASE = "https://blanket-smith-landing-page.vercel.app/";

// --- Helper Components ---

export function getEmailButtonHTML(text: string, href: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 16px 0;">
          <!-- Outlook-compatible button with fallback bgcolor -->
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" bgcolor="#374FD9" style="border-radius: 8px; background: linear-gradient(135deg, #7C2AE8 0%, #374FD9 75%, #0EC8FC 100%); padding: 14px 32px;">
                <a href="${href}" class="email-button" style="display: inline-block; color: #ffffff !important; font-family: Inter, system-ui, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; background: transparent;">
                  <span style="color: #ffffff !important">${text}</span>
                </a>
              </td>
            </tr>
          </table>
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

export function getEmailHeadingHTML(title: string, subtitle: string, extraHTML: string = "", tightSpacing: boolean = false): string {
  // Cinematic Glow Header
  // Radial gradient: Elliptical stretch, wide and centered behind text.

  // Spacing Logic:
  // Standard (Beta): Bottom margin 24px (Subtitle), 20px (Table)
  // Tight (Partnership/Feedback): Bottom margin 8px (Subtitle), 12px (Table)
  const subtitleMargin = tightSpacing ? "0 0 8px" : "0 0 24px";
  const tableMargin = tightSpacing ? "margin-bottom: 12px;" : "margin-bottom: 20px;";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="${tableMargin}">
      <tr>
        <td align="center" style="padding: 24px 24px 24px; background: radial-gradient(ellipse 340px 160px at 50% 30%, rgba(124, 42, 232, 0.18) 0%, rgba(255, 255, 255, 0) 70%);">
          <h1 style="margin: 0 0 16px; font-size: 32px; font-weight: 800; letter-spacing: -0.02em; font-family: Poppins, system-ui, sans-serif; color: #1e293b;">
            ${title}
          </h1>
          <p style="margin: ${subtitleMargin}; font-size: 17px; line-height: 1.6; color: #64748b; font-family: Inter, system-ui, sans-serif;">
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
                  src="${ASSET_BASE}branding/logos/bs-logo-horizontal-white.png" 
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
          <table width="100%" cellpadding="0" cellspacing="0" class="email-footer" style="background-color: #0f172a; background-image: linear-gradient(to bottom, #0f172a, #020617); border-top: 1px solid #334155;" bgcolor="#0f172a">
            <tr>
              <td style="padding: 32px 20px 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center">
                      <img src="${ASSET_BASE}branding/logos/bs-logo-vertical-white.png" alt="BlanketSmith" width="140" style="display: block; max-width: 140px; height: auto;" />
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                  <tr>
                    <td align="center">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding: 0;"><a href="https://www.instagram.com/BlanketSmith_/" style="color: #7C2AE8 !important; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none; padding: 0 8px;">Instagram</a></td>
                          <td style="padding: 0;"><a href="https://www.x.com/BlanketSmith/" style="color: #7C2AE8 !important; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none; padding: 0 8px;">Twitter</a></td>
                          <td style="padding: 0;"><a href="https://youtube.com/@blanketsmithdotcom" style="color: #7C2AE8 !important; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none; padding: 0 8px;">YouTube</a></td>
                        </tr>
                        <tr>
                          <td height="8" style="font-size: 0; line-height: 0;">&nbsp;</td>
                        </tr>
                        <tr>
                          <td style="padding: 0;"><a href="https://www.facebook.com/people/BlanketSmith/61585611386677/" style="color: #7C2AE8 !important; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none; padding: 0 8px;">Facebook</a></td>
                          <td style="padding: 0;"><a href="https://www.tiktok.com/@blanketsmith_" style="color: #7C2AE8 !important; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none; padding: 0 8px;">TikTok</a></td>
                          <td style="padding: 0;"><a href="https://discord.com/invite/cmsAYn7d" style="color: #7C2AE8 !important; font-size: 13px; font-family: Inter, system-ui, sans-serif; text-decoration: none; padding: 0 8px;">Discord</a></td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <p style="color: #7C2AE8; font-size: 12px; font-family: Inter, system-ui, sans-serif; margin: 0 0 16px;">
                        <a href="https://blanketsmith.com" style="color: #7C2AE8 !important; text-decoration: underline;">Unsubscribe</a>
                        <span style="color: #94a3b8;"> · </span>
                        <a href="https://blanketsmith.com" style="color: #7C2AE8 !important; text-decoration: underline;">Privacy Policy</a>
                        <span style="color: #94a3b8;"> · </span>
                        <a href="https://blanketsmith.com" style="color: #7C2AE8 !important; text-decoration: underline;">Terms of Service</a>
                      </p>
                      <p style="color: #cbd5e1 !important; font-size: 12px; font-family: Inter, system-ui, sans-serif; margin: 0;">
                        <span style="color: #cbd5e1 !important;">Made with <img src="${ASSET_BASE}branding/logos/bs-logo-heart.png" alt="love" width="16" height="16" style="display: inline-block; vertical-align: middle;" /> for the community</span>
                      </p>
                      <p style="color: #cbd5e1 !important; font-size: 11px; font-family: Inter, system-ui, sans-serif; margin: 12px 0 0;">
                        <span style="color: #cbd5e1 !important;">© ${year} BlanketSmith. All rights reserved.</span><br/>
                        <span style="color: #334155; font-size: 10px;">Ref: ${refId}</span>
                      </p>
                    </td>
                  </tr>
                </table>
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

export function getInfoBoxHTML(title: string, description: string, iconUrl: string = `${ASSET_BASE}branding/icons/email/icon-info-light-bulb.png`): string {
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
    { label: "The Forge", id: 4 }
  ];

  let stepsHTML = "";

  steps.forEach((step, index) => {
    // Updated Logic:
    // isActive: This STEP is the current active focus -> Gradient Ring + Filled
    // isCompleted: This STEP is behind us -> Green Solid
    // isPending: This STEP is ahead -> Grey

    const isActive = step.id === currentStep;
    const isCompleted = step.id < currentStep;

    let circleStyle = `width: 40px; height: 40px; border-radius: 50%; display: inline-block; vertical-align: middle; text-align: center; line-height: 40px; font-size: 16px; font-weight: 600; font-family: Inter, sans-serif; margin-bottom: 12px;`;

    if (isActive) {
      // Brand Gradient (Active Step)
      circleStyle += ` background-color: #374FD9; background: linear-gradient(135deg, #7C2AE8 0%, #374FD9 62%, #0EC8FC 100%) no-repeat; color: #ffffff; border: 2px solid #0EC8FC; background-clip: padding-box;`;
    } else if (isCompleted) {
      // Success Green (Completed Step)
      circleStyle += ` background-color: #10b981; color: #ffffff;`;
    } else {
      // Grey (Pending Step)
      circleStyle += ` background-color: #e2e8f0; color: #94a3b8;`;
    }

    const labelColor = isActive ? "#1e293b" : (isCompleted ? "#059669" : "#94a3b8");

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
    `<span style="font-size: 150%;">🍾</span> <br/> Welcome to ${getGradientTextHTML("The Forge")}`,
    "🎉 You're in! 🎉",
    getEmailProgressRailHTML(2), // Active Step 2 (Verification) - Green is Step 1
    false // Use standard spacing for Beta
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
    `${ASSET_BASE}branding/icons/email/icon-feature-image-sparkle.png`
  )}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
          ${getEmailFeatureCardHTML(
    "Modern Interface",
    "Experience a beautiful, intuitive design built specifically for the modern maker, with dark mode and touch controls.",
    `${ASSET_BASE}branding/icons/email/icon-feature-dashboard.png`
  )}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
          ${getEmailFeatureCardHTML(
    "Precision Tools",
    "Fine-tune every stitch with professional-grade editing tools designed to give you complete control over your work.",
    `${ASSET_BASE}branding/icons/email/icon-feature-spanner.png`
  )}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
           ${getEmailFeatureCardHTML(
    "Community First",
    "Join a thriving community of makers. Share patterns, get feedback, and help shape the future of the platform.",
    `${ASSET_BASE}branding/icons/email/icon-feature-community.png`
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

export const getEmailVerifiedTemplate = () => {
  // Phase 2: Email Verified ("Waiting Room")
  // Rail: Step 3 (Beta Access) is Active (Gradient). Steps 1 & 2 are Green.
  const content = `
    ${getEmailHeadingHTML(
    `You've been ${getGradientTextHTML("Verified")}`,
    "✔️ Thank you for verifying your email address. ✔️",
    getEmailProgressRailHTML(3),
    false
  )}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
        <tr>
            <td align="left">
                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
                    Your verification is complete, and your application is now in review for final beta approval. We are thrilled to have you join us. ✨
                </p>
                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
                    BlanketSmith is built by makers 🧶, for makers, and your participation is crucial as we refine the platform.
                </p>
            </td>
        </tr>
    </table>

    ${getInfoBoxHTML(
    "What happens next?",
    "Beta access is rolled out in waves to ensure stability. You should receive your access credentials within the next 24-48 hours. The link we send will be valid for 7 days."
  )}

    <div style="text-align: center; margin-top: 32px;">
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
        While you wait, join the conversation in the community.
      </p>
      ${getEmailButtonHTML("Join the Forge", "https://discord.com/invite/cmsAYn7d")}
    </div>
    `;

  return {
    subject: "Verification Complete - You're on the list",
    html: getCinematicShellHTML(content)
  };
};

export const getBetaAccessTemplate = (claimLink: string) => {
  // Phase 2: Beta Access ("Key Delivery")
  // Rail: Step 4 (The Forge) is Active (Gradient). Steps 1, 2, 3 are Green.
  const content = `
    ${getEmailHeadingHTML(
    `Access ${getGradientTextHTML("Granted")}`,
    "🥳 Your account has been approved. 🥳",
    getEmailProgressRailHTML(4),
    false
  )}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
        <tr>
            <td align="left">
                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
                  The wait is over. You have been approved for full access to the BlanketSmith beta. 🚀
                </p>
                 <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
                  You now have full access to our pattern generation and editing tools. This is your workspace to create, experiment, and refine. ✨ Don't hesitate to reach out if you need guidance.
                </p>
                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
                  Click the button below to claim your account and set your secure password. This link is valid for 7 days.
                </p>
            </td>
        </tr>
    </table>

     ${getInfoBoxHTML(
    "What happens next?",
    "As a Beta member, you play a vital role in our development. You may encounter bugs or rough edges—this is normal! Please use the feedback tools to report issues or share ideas. Your voice directly shapes the future of BlanketSmith."
  )}

    <div style="text-align: center; margin: 32px 0;">
      ${getEmailButtonHTML("Enter The Forge", claimLink)}
    </div>
    `;

  return {
    subject: "Access Granted: Welcome to The Forge",
    html: getCinematicShellHTML(content)
  };
};

export const getPartnershipTemplate = (name: string) => {
  const content = `
    <!-- Header Section -->
    ${getEmailHeadingHTML(
    `Forging an ${getGradientTextHTML("Alliance")}`,
    `🤝 Thank you for reaching out, ${name}! 🤝`,
    "",
    true // Use tight spacing
  )}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td align="left">
          <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
            Thank you for reaching out about a potential partnership. We sit at the intersection of craftsmanship and modern software, and we're always excited to explore collaborations that push the boundaries of what's possible.
          </p>

           <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
             Whether it's integrating with new hardware, co-developing community features, or exploring content creation, we believe that the best tools are built in the open. We'd love to hear more about your vision and how we can align our roadmaps.
           </p>
          
          <!-- Highlighted Quote (Steve Jobs) -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
            <tr>
              <td style="border-left: 4px solid #7C2AE8; padding-left: 20px; background-color: #f8fafc; padding: 20px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px; font-size: 18px; font-style: italic; font-weight: 500; line-height: 1.6; color: #475569; font-family: 'Poppins', system-ui, sans-serif;">
                  "Great things in business are never done by one person; they're done by a team of people."
                </p>
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #7C2AE8; font-family: Inter, system-ui, sans-serif;">
                  — Steve Jobs
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${getInfoBoxHTML(
    "What happens next?",
    "Our team has received your inquiry and will be reviewing it carefully. We typically respond within 2-3 business days, but please know that every partnership opportunity receives our full attention."
  )}

    <div style="text-align: center; margin-top: 24px;">
      ${getEmailButtonHTML("View Our Roadmap", "#")}
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
    `Forging the ${getGradientTextHTML("Future")}`,
    `🛠️ Thanks for the input, ${name} 🛠️`,
    "",
    true // Use tight spacing
  )}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td align="left">
          <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
            Accuracy and craftsmanship matter deeply to us. Your input is exactly how we evolve, and we want you to know that your feedback has been received and will be carefully reviewed by our team.
          </p>

          <p style="margin: 0 0 0; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
            Every suggestion, bug report, and feature request helps us build a better tool for the entire maker community. We're in this together. 🧶
          </p>
          
          <!-- Highlighted Quote (Marshall McLuhan - Moved Down) -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
            <tr>
              <td style="border-left: 4px solid #7C2AE8; padding-left: 20px; background-color: #f8fafc; padding: 20px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px; font-size: 18px; font-style: italic; font-weight: 500; line-height: 1.6; color: #475569; font-family: 'Poppins', system-ui, sans-serif;">
                  "We shape our tools and afterwards our tools shape us."
                </p>
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #7C2AE8; font-family: Inter, system-ui, sans-serif;">
                  — Marshall McLuhan
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${getInfoBoxHTML(
    "What happens next?",
    "Our team reviews all feedback as it is received. If we need more details, we'll reach out directly. Major updates inspired by community input will be highlighted in our changelog."
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
    `New Contact ${getGradientTextHTML("Forged")}`,
    `👋 Thank you for reaching out, ${name}. 👋`,
    "",
    true // Use tight spacing
  )}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td align="left">
          <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
            This is an automated confirmation that your message has reached our team. Whether it's a question, a suggestion, or just a hello, we value every signal from the community.
          </p>
          <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
            If you're looking for support or how-to guides, be sure to check out our <a href="#" style="color: #7C2AE8; text-decoration: underline;">Resources & Documentation</a> to get the most out of BlanketSmith.
          </p>
          <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
            We'll get back to you as soon as we can. In the meantime, keep making. 🧶
          </p>
        </td>
      </tr>
    </table>

    ${getInfoBoxHTML(
    "Message Details",
    `"${message}" - Sent from ${email}`
  )}

    <div style="text-align: center; margin-top: 24px;">
      ${getEmailButtonHTML("Join the Forge", "https://discord.com/invite/cmsAYn7d")}
    </div>
  `;
  return {
    subject: "Message Received",
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

/**
 * NEW: Milestone Badge Helper
 * Renders a large circular badge with the brand gradient and an icon.
 */
/**
 * NEW: Milestone Badge Helper
 * Renders a circular badge with the brand gradient and an icon.
 */
export const getFirstPatternMilestoneTemplate = (userName: string = "Maker") => {
  const content = `
    ${getEmailHeadingHTML(
    `<span style="font-size: 150%;">🏆</span> <br/> Your First Pattern ${getGradientTextHTML("Forged")}`,
    "🎉 Milestone Unlocked 🎉",
    "",
    true
  )}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
        <tr>
            <td align="left">
                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
                    Congratulations, ${userName}! You've just created your very first pattern on BlanketSmith. 🧶
                </p>
                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
                    This is a huge step in your journey as a maker. Whether it's a simple test or a masterpiece in the making, you've officially started forging. ⚒️
                </p>
                 <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
                    We'd love to see what you've made. Share your creation with the community to inspire others and get feedback.
                </p>
            </td>
        </tr>
    </table>

    <!-- Inspirational Quote (Standard Style, Moved to Bottom) -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px;">
        <tr>
            <td style="border-left: 4px solid #7C2AE8; padding-left: 20px; background-color: #f8fafc; padding: 20px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px; font-size: 18px; font-style: italic; font-weight: 500; line-height: 1.6; color: #475569; font-family: 'Poppins', system-ui, sans-serif;">
                    "Creativity is contagious, pass it on."
                </p>
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #7C2AE8; font-family: Inter, system-ui, sans-serif;">
                    — Albert Einstein
                </p>
            </td>
        </tr>
    </table>

    <div style="text-align: center; margin: 32px 0;">
      ${getEmailButtonHTML("Share Achievement", "https://discord.com/invite/cmsAYn7d")}
    </div>
    `;

  return {
    subject: "Achievement Unlocked: First Pattern Forged! 🏆",
    html: getCinematicShellHTML(content)
  };
};

export const getPasswordResetTemplate = (resetLink: string) => {
  const content = `
    ${getEmailHeadingHTML(
    `Password ${getGradientTextHTML("Reset")}`,
    "🔐 Secure Account Request 🔐",
    "",
    true
  )}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
        <tr>
            <td align="left">
                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
                    We received a request to reset the password for your BlanketSmith account. If you didn't make this request, you can safely ignore this email.
                </p>
                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
                    To choose a new password, click the button below. This link is valid for 1 hour.
                </p>
            </td>
        </tr>
    </table>

    <div style="text-align: center; margin: 32px 0;">
      ${getEmailButtonHTML("Reset Password", resetLink)}
    </div>
    `;

  return {
    subject: "Reset your BlanketSmith password",
    html: getCinematicShellHTML(content)
  };
};

export const getBetaKickoffTemplate = (name: string = "Maker") => {
  // Cinematic Kickoff - Uses Beta Access style but with "Kickoff" header
  const content = `
    ${getEmailHeadingHTML(
    `<span style="font-size: 150%;">🚀</span> <br/> Beta ${getGradientTextHTML("Kickoff")}`,
    `The Forge is Open, ${name}!`,
    getEmailProgressRailHTML(4), // Step 4 (The Forge) is Active/Gradient
    false
  )}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
        <tr>
            <td align="left">
                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
                    The wait is over! We are officially kicking off the BlanketSmith Beta, and you are among the very first to step inside. ✨
                </p>
                 <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
                    We've built a suite of tools designed to give you unprecedented control over your crochet and knitting patterns. From the Pixel Grid Editor to the new Pattern Generator, everything is ready for you to explore. 🧶
                </p>
            </td>
        </tr>
    </table>

    ${getInfoBoxHTML(
    "Community Resources",
    'We\'ve prepared guides to help you get started. Choose your path below or join the Discord to ask questions live. <br/><br/> <a href="https://blanketsmith.com/docs" style="color: #7C2AE8; text-decoration: underline;">View Documentation</a>'
  )}

    <div style="text-align: center; margin: 32px 0;">
      ${getEmailButtonHTML("Enter The Forge", "https://blanketsmith.com/login")}
    </div>

    <!-- Features Grid (Expanded to 4 items) -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
      <tr>
        <td style="padding-bottom: 16px;">
          ${getEmailFeatureCardHTML(
    "Pattern Generator",
    "Upload or snap photos to create instant charts. Adjust complexity and palette.",
    `${ASSET_BASE}icons/374FD9/image-sparkle.png`
  )}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
           ${getEmailFeatureCardHTML(
    "Pixel Grid Editor",
    "Precision tools: Select, Brush, Fill, Text. Full symmetry support (Vertical, Horizontal, Quadrant).",
    `${ASSET_BASE}icons/374FD9/spanner.png`
  )}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
           ${getEmailFeatureCardHTML(
    "Project Management",
    "Track your progress with the Pattern Book. Organize WIPs and PDFs.",
    `${ASSET_BASE}icons/374FD9/dashboard.png`
  )}
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
           ${getEmailFeatureCardHTML(
    "Community Feedback",
    "Your voice shapes the platform. Join the discussion to request features.",
    `${ASSET_BASE}icons/374FD9/community.png`
  )}
        </td>
      </tr>
    </table>
    `;

  return {
    subject: "The Forge is Open! 🚀",
    html: getCinematicShellHTML(content)
  };
};

export const getGenericTemplate = (subject: string, title: string, body: string, ctaText?: string, ctaLink?: string) => {
  const content = `
    ${getEmailHeadingHTML(
    title,
    "", // No default subtitle for generic
    "",
    true
  )}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
        <tr>
            <td align="left">
                <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155; font-family: Inter, system-ui, sans-serif;">
                    ${body.replace(/\n/g, '<br/>')}
                </p>
            </td>
        </tr>
    </table>

    ${ctaText && ctaLink ? `
    <div style="text-align: center; margin: 32px 0;">
      ${getEmailButtonHTML(ctaText, ctaLink)}
    </div>
    ` : ''}
    `;

  return {
    subject: subject,
    html: getCinematicShellHTML(content)
  };
};
