import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// Mock Deno types for the editor's benefit
declare const Deno: any;

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const payload = await req.json();

        // Check if this is a database webhook payload (INSERT)
        // Structure: { type: 'INSERT', table: 'contact_submissions', record: { ... }, schema: 'public' }
        if (payload.type === 'INSERT' && payload.table === 'contact_submissions') {
            const record = payload.record;

            // Only process beta_signup triggers
            if (record.type === 'beta_signup') {
                const metadata = record.metadata || {};
                const firstName = metadata.firstName || (record.full_name || record.name || '').split(' ')[0] || 'Maker';

                console.log(`Processing Beta Signup for: ${record.email}`);

                // Construct Branded HTML Email
                const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to BlanketSmith Beta</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: sans-serif; color: #E2E8F0;">
    <!-- Main Container -->
    <div style="max-width: 600px; margin: 0 auto; background-color: #0F172A; min-height: 100vh;">
        <!-- Gradient Border Top -->
        <div style="height: 4px; width: 100%; background: linear-gradient(90deg, #7C2AE8 0%, #0EC8FC 100%);"></div>
        
        <!-- Content Padding -->
        <div style="padding: 40px 20px;">
            <!-- Logo Wordmark Center -->
            <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #FFFFFF; font-family: 'Poppins', sans-serif;">BlanketSmith</h1>
            </div>
            
            <!-- Greeting -->
            <h2 style="margin: 0 0 24px; font-size: 24px; color: #F8FAFC; text-align: center;">Welcome to the Beta, ${firstName}!</h2>
            
            <!-- Body Text -->
            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #94A3B8;">
                We've received your request to join the BlanketSmith beta. We're thrilled to have you on board as we build the future of pattern creation.
            </p>
            
            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #94A3B8;">
                Our team is currently reviewing applications and rolling out access in batches to ensure a smooth experience. You'll receive another email with your access credentials as soon as your spot is ready.
            </p>

            <!-- Decorative Divider -->
            <div style="height: 1px; background-color: #1E293B; margin: 32px 0;"></div>

            <!-- Footer -->
            <p style="margin: 0; font-size: 14px; color: #64748B; text-align: center;">
                &copy; ${new Date().getFullYear()} BlanketSmith. All rights reserved.<br>
                Made with <span style="color: #F43F5E;">&#10084;</span> for the maker community.
            </p>
        </div>
    </div>
</body>
</html>
        `;

                // Live SMTP Delivery
                const client = new SmtpClient();

                try {
                    await client.connect({
                        hostname: Deno.env.get("SMTP_HOSTNAME") || "",
                        port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
                        username: Deno.env.get("SMTP_USERNAME") || "",
                        password: Deno.env.get("SMTP_PASSWORD") || "",
                    });

                    await client.send({
                        from: "info@BlanketSmith.com",
                        to: "info@BlanketSmith.com", // Hardcoded per requirements
                        replyTo: "info@BlanketSmith.com",
                        subject: "Welcome to BlanketSmith Beta",
                        content: htmlEmail,
                        html: htmlEmail,
                    });

                    await client.close();
                    console.log("Email sent successfully via SMTP.");

                    return new Response(JSON.stringify({
                        message: 'Email processed successfully (SMTP)',
                        success: true
                    }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 200,
                    });

                } catch (smtpError: any) {
                    console.error("SMTP Error:", smtpError);
                    return new Response(JSON.stringify({
                        error: "SMTP Handshake/Send Failed",
                        details: smtpError?.message || String(smtpError)
                    }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                        status: 500
                    });
                }
            }
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
