
import nodemailer from "npm:nodemailer@6.9.16";
import {
    getBetaTemplate,
    getPartnershipTemplate,
    getFeedbackTemplate,
    getDefaultTemplate,
    getAdminAlertTemplate,
    getEmailVerifiedTemplate,
    getBetaAccessTemplate,
    getFirstPatternMilestoneTemplate,
    getPasswordResetTemplate,
    getBetaKickoffTemplate,
    getGenericTemplate
} from "./templates.ts";

// Mock Deno types for the editor's benefit
declare const Deno: any;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper: Send Email via Nodemailer
async function sendEmail(to: string, subject: string, html: string) {
    const hostname = Deno.env.get("SMTP_HOSTNAME");
    const port = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const username = Deno.env.get("SMTP_USERNAME");
    const password = Deno.env.get("SMTP_PASSWORD");

    const transporter = nodemailer.createTransport({
        host: hostname,
        port: port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user: username,
            pass: password,
        },
    });

    await transporter.sendMail({
        from: "info@BlanketSmith.com",
        to: to,
        replyTo: "info@BlanketSmith.com",
        subject: subject,
        html: html,
    });
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const payload = await req.json();

        // --- TEST EMAIL HANDLER ---
        if (payload.type === 'test_email') {
            console.log("Received Test Email Request:", payload);

            const rawEmail = payload.email;
            if (!rawEmail) {
                throw new Error("Missing 'email' in test payload");
            }
            // Support single string or array of strings
            const targetEmails = Array.isArray(rawEmail) ? rawEmail : [rawEmail];

            const templateName = payload.template;
            let testTemplate;

            switch (templateName) {
                case 'verified':
                    testTemplate = getEmailVerifiedTemplate();
                    break;
                case 'access':
                    testTemplate = getBetaAccessTemplate("https://blanketsmith.com/claim-account");
                    break;
                case 'partnership':
                    testTemplate = getPartnershipTemplate("Test Partner");
                    break;
                case 'beta':
                    testTemplate = getBetaTemplate("https://blanketsmith.com/verify");
                    break;
                case 'milestone':
                    testTemplate = getFirstPatternMilestoneTemplate("Test Maker");
                    break;
                case 'password_reset':
                    testTemplate = getPasswordResetTemplate("https://blanketsmith.com/reset-password?token=test");
                    break;
                case 'beta_kickoff':
                    testTemplate = getBetaKickoffTemplate("Test Maker");
                    break;
                case 'generic':
                    const title = payload.title || "Generic Notification";
                    const bodyContent = payload.body || "This is a generic notification from BlanketSmith.";
                    testTemplate = getGenericTemplate("Notification from BlanketSmith", title, bodyContent, payload.ctaText, payload.ctaLink, payload.infoTitle, payload.infoBody);
                    break;
                case 'general':
                    testTemplate = getDefaultTemplate("Test User", targetEmails[0], "This is a test message.");
                    break;
                default:
                    throw new Error(`Unknown test template: ${templateName}`);
            }

            console.log(`Sending Test Email (${templateName}) to:`, targetEmails);

            // Send to all targets in parallel
            const results = await Promise.all(targetEmails.map(async (email: string) => {
                try {
                    await sendEmail(email, `[TEST] ${testTemplate.subject}`, testTemplate.html);
                    return { email, status: 'sent' };
                } catch (err: any) {
                    console.error(`Failed to send test email to ${email}:`, err);
                    return { email, status: 'failed', error: err.message };
                }
            }));

            return new Response(JSON.stringify({
                message: `Test email '${templateName}' processed`,
                results: results,
                success: true
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // --- STANDARD WEBHOOK HANDLER ---
        // Check if this is a database webhook payload (INSERT)
        if (payload.type === 'INSERT' && payload.table === 'contact_submissions') {
            const record = payload.record;

            // 1. Determine Category
            // Normalize legacy 'beta_signup' type to 'beta' category
            let category = record.category || (record.type === 'beta_signup' ? 'beta' : 'unknown');

            // Normalize case
            category = category.toLowerCase();

            // 2. Select User Template
            console.log("Processing submission for:", category);
            console.log("Attempting to render category:", category);

            let userTemplate;
            const name = (record.full_name || record.name || 'Maker').split(' ')[0]; // First name or fallback

            // Attempt to get verification link from record or env, fallback to homepage
            // TODO: Ensure this links to the actual Supabase verification flow if available
            const verificationLink = record.confirmation_url || record.verification_link || "https://blanket-smith-landing-page.vercel.app/verify";

            switch (category) {
                case 'beta':
                    userTemplate = getBetaTemplate(verificationLink);
                    break;
                case 'partnership':
                    userTemplate = getPartnershipTemplate(name);
                    break;
                case 'feedback':
                    userTemplate = getFeedbackTemplate(name);
                    break;
                case 'contact':
                    userTemplate = getDefaultTemplate(name, record.email, record.message || "No message provided");
                    break;
                default:
                    // Safety Fallback
                    console.warn(`Unknown category '${category}' - prompting default template.`);
                    userTemplate = getDefaultTemplate(name, record.email || "unknown@example.com", record.message || "No message provided");
                    break;
            }

            // 3. Send User Email
            if (record.email) {
                try {
                    console.log("Template generated successfully");
                    console.log(`Sending User Email (${category}) to: ${record.email}`);
                    await sendEmail(record.email, userTemplate.subject, userTemplate.html);
                    console.log("User Email sent successfully");
                } catch (userErr: any) {
                    console.error("Failed to send User Email:", userErr);
                }
            } else {
                console.warn("Skipping User Email: No recipient email found in record");
            }

            // 4. Send Admin Alert
            try {
                // Signature: (category: string, email: string, payload: any)
                const adminTmpl = getAdminAlertTemplate(category, record.email || "no-email", record);
                console.log(`Sending Admin Alert to info@BlanketSmith.com`);
                await sendEmail("info@BlanketSmith.com", adminTmpl.subject, adminTmpl.html);
                console.log("Admin Alert sent successfully");
            } catch (adminErr: any) {
                console.error("Failed to send Admin Alert:", adminErr);
                // If Admin fails, we should probably report error, but we've potentially already sent user email.
                // We'll log it heavily.
                return new Response(JSON.stringify({
                    status: "partial_success", // or failure
                    message: "Admin alert failed",
                    details: adminErr?.message || String(adminErr)
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 500
                });
            }

            return new Response(JSON.stringify({
                message: 'Email dispatch processed successfully',
                success: true
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // Default response for non-processed events
        return new Response(JSON.stringify({ message: 'Event ignored' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error: any) {
        console.error('Error processing webhook:', error);
        return new Response(JSON.stringify({ error: error?.message || String(error) }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
