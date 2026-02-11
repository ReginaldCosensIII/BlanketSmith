// ========================================
// COMPONENT: Email Progress Rail (Cinematic)
// ========================================


interface EmailProgressRailProps {
    currentStep: number;
}

const steps = ["Signup", "Verification", "Beta Access", "Forge"];

// Checkmark SVG path
const checkmarkPath = "M20 6L9 17l-5-5";

export function EmailProgressRail({ currentStep }: EmailProgressRailProps) {
    // Fixed Light Mode Colors
    const textColor = "#1e293b";
    const mutedColor = "#94a3b8";
    const activeGradient = "linear-gradient(135deg, #7C2AE8 0%, #374FD9 75%, #0EC8FC 100%)";
    const inactiveBg = "#e2e8f0";
    const completedGreen = "#22c55e"; // Bright green for completed steps

    return (
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "32px" }}>
            <tbody>
                <tr>
                    <td>
                        <table width="100%" cellPadding="0" cellSpacing="0">
                            <tbody>
                                <tr>
                                    {steps.map((step, index) => {
                                        const isCompleted = index < currentStep; // Steps before current are completed
                                        const isActive = index === currentStep;
                                        const isFuture = index > currentStep;

                                        return (
                                            <td
                                                key={step}
                                                align="center"
                                                width={`${100 / steps.length}%`}
                                                style={{ position: "relative" }}
                                            >
                                                {/* Step circle */}
                                                <div
                                                    style={{
                                                        width: "32px",
                                                        height: "32px",
                                                        borderRadius: "50%",
                                                        background: isCompleted ? completedGreen : (isActive ? activeGradient : inactiveBg),
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        margin: "0 auto 8px",
                                                        color: isFuture ? mutedColor : "#fff",
                                                        fontFamily: "Poppins, system-ui, sans-serif",
                                                        fontWeight: "600",
                                                        fontSize: "14px",
                                                        boxShadow: isCompleted ? "0 0 12px rgba(34, 197, 94, 0.4)" : "none",
                                                    }}
                                                >
                                                    {isCompleted ? (
                                                        <svg
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="#fff"
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <path d={checkmarkPath} />
                                                        </svg>
                                                    ) : (
                                                        index + 1
                                                    )}
                                                </div>
                                                {/* Step label */}
                                                <span
                                                    style={{
                                                        display: "block",
                                                        fontSize: "12px",
                                                        fontFamily: "Inter, system-ui, sans-serif",
                                                        color: isCompleted ? completedGreen : (isActive ? textColor : mutedColor),
                                                        fontWeight: isActive ? "600" : "400",
                                                    }}
                                                >
                                                    {step}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>
                        {/* Progress line */}
                        <div
                            style={{
                                position: "relative",
                                height: "4px",
                                backgroundColor: inactiveBg,
                                borderRadius: "2px",
                                marginTop: "-42px",
                                marginBottom: "50px",
                                marginLeft: "12.5%",
                                marginRight: "12.5%",
                                zIndex: -1,
                            }}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    height: "100%",
                                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                                    background: currentStep > 0 ? `linear-gradient(90deg, ${completedGreen} 0%, ${completedGreen} ${((currentStep - 1) / currentStep) * 100}%, #7C2AE8 100%)` : activeGradient,
                                    borderRadius: "2px",
                                }}
                            />
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

export function getEmailProgressRailHTML(currentStep: number): string {
    const textColor = "#1e293b";
    const mutedColor = "#94a3b8";
    const activeGradient = "linear-gradient(135deg, #7C2AE8 0%, #374FD9 75%, #0EC8FC 100%)";
    const inactiveBg = "#e2e8f0";
    const completedGreen = "#22c55e";
    const steps = ["Signup", "Verification", "Beta Access", "Forge"];

    const stepsHtml = steps
        .map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            const isFuture = index > currentStep;
            const bgColor = isCompleted ? completedGreen : (isActive ? activeGradient : inactiveBg);
            const labelColor = isCompleted ? completedGreen : (isActive ? textColor : mutedColor);
            const circleContent = isCompleted
                ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`
                : `${index + 1}`;
            const boxShadow = isCompleted ? "box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);" : "";

            return `
      <td align="center" width="${100 / steps.length}%" style="vertical-align: top;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: ${bgColor}; margin: 0 auto 8px; line-height: 32px; text-align: center; color: ${isFuture ? mutedColor : "#fff"}; font-family: Poppins, system-ui, sans-serif; font-weight: 600; font-size: 14px; ${boxShadow}">
          ${circleContent}
        </div>
        <span style="display: block; font-size: 12px; font-family: Inter, system-ui, sans-serif; color: ${labelColor}; font-weight: ${isActive ? "600" : "400"};">
          ${step}
        </span>
      </td>
    `;
        })
        .join("");

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
