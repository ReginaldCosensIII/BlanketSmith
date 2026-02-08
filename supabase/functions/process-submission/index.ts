import nodemailer from "npm:nodemailer@6.9.16";
import {
    getBetaTemplate,
    getPartnershipTemplate,
    getFeedbackTemplate,
    getDefaultTemplate,
    getAdminAlertTemplate
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

            switch (category) {
                case 'beta':
                    userTemplate = getBetaTemplate(name);
                    break;
                case 'partnership':
                    userTemplate = getPartnershipTemplate(name);
                    break;
                case 'feedback':
                    userTemplate = getFeedbackTemplate(name);
                    break;
                case 'contact':
                    userTemplate = getDefaultTemplate(name);
                    break;
                default:
                    // Safety Fallback
                    console.warn(`Unknown category '${category}' - prompting default template.`);
                    userTemplate = getDefaultTemplate(name);
                    break;
            }

            // 3. Send User Email
            if (record.email) {
                try {
                    console.log("Template generated successfully");
                    console.log(`Sending User Email (${category}) to: ${record.email}`);
                    await sendEmail(record.email, userTemplate.subject, userTemplate.html);
                } catch (userErr: any) {
                    console.error("Failed to send User Email:", userErr);
                    // Continue to Admin Alert even if user email fails? 
                    // Yes, we want to know about the submission.
                }
            } else {
                console.warn("Skipping User Email: No recipient email found in record");
                // We typically stop here if it's invalid, but for Admin Alert purposes, we might still want to notify Admin.
                // However, the previous logic returned 200 skipped. 
                // Let's keep the Admin Alert active even if user email is missing, so we can debug the data.
            }

            // 4. Send Admin Alert
            try {
                const adminTmpl = getAdminAlertTemplate(record);
                console.log(`Sending Admin Alert to info@BlanketSmith.com`);
                await sendEmail("info@BlanketSmith.com", adminTmpl.subject, adminTmpl.html);
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
