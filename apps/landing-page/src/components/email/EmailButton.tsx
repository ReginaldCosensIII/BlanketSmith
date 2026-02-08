interface EmailButtonProps {
    href: string;
    children: React.ReactNode;
}

export function EmailButton({ href, children }: EmailButtonProps) {
    return (
        <table cellPadding="0" cellSpacing="0" style={{ margin: "0 auto" }}>
            <tbody>
                <tr>
                    <td
                        align="center"
                        style={{
                            background: "linear-gradient(135deg, #7C2AE8 0%, #374FD9 75%, #0EC8FC 100%)",
                            borderRadius: "12px",
                            boxShadow: `
                0 4px 14px rgba(124, 42, 232, 0.4),
                0 0 30px rgba(124, 42, 232, 0.25),
                0 0 50px rgba(14, 200, 252, 0.15)
              `,
                        }}
                    >
                        <a
                            href={href}
                            style={{
                                display: "inline-block",
                                padding: "16px 32px",
                                color: "#ffffff",
                                fontSize: "16px",
                                fontFamily: "Poppins, system-ui, sans-serif",
                                fontWeight: "600",
                                textDecoration: "none",
                                borderRadius: "12px",
                            }}
                        >
                            {children}
                        </a>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

export function getEmailButtonHTML(href: string, text: string): string {
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
