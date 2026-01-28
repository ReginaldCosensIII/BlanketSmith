
export const getBetaTemplate = (name: string) => {
    return {
        subject: "Welcome to BlanketSmith Beta",
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to BlanketSmith Beta</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: sans-serif; color: #E2E8F0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #0F172A; min-height: 100vh;">
        <div style="height: 4px; width: 100%; background: linear-gradient(90deg, #7C2AE8 0%, #0EC8FC 100%);"></div>
        <div style="padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; color: #FFFFFF; font-family: 'Poppins', sans-serif;">BlanketSmith</h1>
            </div>
            <h2 style="margin: 0 0 24px; font-size: 24px; color: #F8FAFC; text-align: center;">Welcome to the Beta, ${name}!</h2>
            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #94A3B8;">
                We've received your request to join the BlanketSmith beta. We're thrilled to have you on board as we build the future of pattern creation.
            </p>
            <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #94A3B8;">
                Our team is currently reviewing applications and rolling out access in batches to ensure a smooth experience. You'll receive another email with your access credentials as soon as your spot is ready.
            </p>
            <div style="height: 1px; background-color: #1E293B; margin: 32px 0;"></div>
            <p style="margin: 0; font-size: 14px; color: #64748B; text-align: center;">
                &copy; ${new Date().getFullYear()} BlanketSmith. All rights reserved.<br>
                Made with <span style="color: #F43F5E;">&#10084;</span> for the maker community.
            </p>
        </div>
    </div>
</body>
</html>`
    };
};

export const getPartnershipTemplate = (name: string) => {
    return {
        subject: "Partnering with BlanketSmith",
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: sans-serif; color: #E2E8F0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #0F172A; padding: 40px 20px;">
        <h1 style="color: #FFFFFF;">BlanketSmith</h1>
        <h2 style="color: #F8FAFC;">Thanks for reaching out, ${name}!</h2>
        <p style="color: #94A3B8;">We've received your partnership inquiry. Our team will review your proposal and get back to you shortly.</p>
        <p style="color: #94A3B8;">Excited to see what we can build together.</p>
    </div>
</body>
</html>`
    };
};

export const getFeedbackTemplate = (name: string) => {
    return {
        subject: "Thanks for your Feedback",
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: sans-serif; color: #E2E8F0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #0F172A; padding: 40px 20px;">
        <h1 style="color: #FFFFFF;">BlanketSmith</h1>
        <h2 style="color: #F8FAFC;">We appreciate your feedback, ${name}.</h2>
        <p style="color: #94A3B8;">Our team reviews every report to help improve BlanketSmith for everyone.</p>
        <p style="color: #94A3B8;">If we need more details to resolve a bug, we'll reach out directly.</p>
    </div>
</body>
</html>`
    };
};

export const getDefaultTemplate = (name: string) => {
    return {
        subject: "Thank you for contacting BlanketSmith",
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: sans-serif; color: #E2E8F0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #0F172A; padding: 40px 20px;">
        <h1 style="color: #FFFFFF;">BlanketSmith</h1>
        <h2 style="color: #F8FAFC;">Hello ${name},</h2>
        <p style="color: #94A3B8;">We have received your submission and will process it shortly.</p>
        <p style="color: #94A3B8;">Thank you for your interest in BlanketSmith.</p>
    </div>
</body>
</html>`
    };
};

export const getAdminAlertTemplate = (record: any) => {
    const category = record.category || record.type || "Unknown";
    const name = record.full_name || "Unknown User";
    const email = record.email || "No Email";

    // Format metadata as rows
    const metadataRows = Object.entries(record.metadata || {})
        .map(([key, value]) => `<tr><td style="padding: 8px; border-bottom: 1px solid #334155; color: #94A3B8;">${key}</td><td style="padding: 8px; border-bottom: 1px solid #334155; color: #E2E8F0;">${value}</td></tr>`)
        .join("");

    return {
        subject: `[Admin Alert] New ${category} Submission: ${name}`,
        html: `
<!DOCTYPE html>
<html>
<body style="margin: 0; padding: 0; background-color: #0F172A; font-family: sans-serif; color: #E2E8F0;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #0F172A; padding: 40px 20px;">
        <h2 style="color: #F8FAFC;">New Submission Received</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #334155; color: #94A3B8; width: 30%;">Category</td>
                <td style="padding: 8px; border-bottom: 1px solid #334155; color: #E2E8F0;">${category}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #334155; color: #94A3B8;">Name</td>
                <td style="padding: 8px; border-bottom: 1px solid #334155; color: #E2E8F0;">${name}</td>
            </tr>
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #334155; color: #94A3B8;">Email</td>
                <td style="padding: 8px; border-bottom: 1px solid #334155; color: #E2E8F0;">${email}</td>
            </tr>
             <tr>
                <td style="padding: 8px; border-bottom: 1px solid #334155; color: #94A3B8;">Sub-Type</td>
                <td style="padding: 8px; border-bottom: 1px solid #334155; color: #E2E8F0;">${record.sub_type || '-'}</td>
            </tr>
        </table>
        
        <h3 style="color: #F8FAFC; margin-top: 30px;">Metadata</h3>
        <table style="width: 100%; border-collapse: collapse;">
            ${metadataRows}
        </table>
        
        <h3 style="color: #F8FAFC; margin-top: 30px;">Top-Level Fields</h3>
        <p style="color: #94A3B8;">Primary Craft: ${record.primary_craft || '-'}</p>
        <p style="color: #94A3B8;">Experience: ${record.experience_level || '-'}</p>
        <p style="color: #94A3B8;">Steps to Reproduce: ${record.steps_to_reproduce || '-'}</p>
        <p style="color: #94A3B8;">Expected Behavior: ${record.expected_behavior || '-'}</p>
        <p style="color: #94A3B8;">Message: ${record.message || '-'}</p>
    </div>
</body>
</html>`
    };
};
