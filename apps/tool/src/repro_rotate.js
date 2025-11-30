
function testRotation(startX, startY, startW, startH, gridW, gridH) {
    let x = startX;
    let y = startY;
    let w = startW;
    let h = startH;

    console.log(`Start: x=${x}, y=${y}, w=${w}, h=${h}`);

    for (let i = 1; i <= 4; i++) {
        const newW = h;
        const newH = w;

        let newX = x + Math.trunc((w - newW) / 2);
        let newY = y + Math.trunc((h - newH) / 2);

        // Clamp
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + newW > gridW) newX = gridW - newW;
        if (newY + newH > gridH) newY = gridH - newH;

        x = newX;
        y = newY;
        w = newW;
        h = newH;

        console.log(`Step ${i}: x=${x}, y=${y}, w=${w}, h=${h}`);
    }

    if (x !== startX || y !== startY || w !== startW || h !== startH) {
        console.log('FAIL: Drift detected!');
    } else {
        console.log('PASS: Stable.');
    }
    console.log('---');
}

// Test cases
console.log('Test 1: Center Odd/Even');
testRotation(10, 10, 5, 2, 100, 100);

console.log('Test 2: Center Even/Odd');
testRotation(10, 10, 4, 3, 100, 100);

console.log('Test 3: Edge Top-Left');
testRotation(0, 0, 10, 5, 100, 100);

console.log('Test 4: Edge Bottom-Right');
testRotation(90, 90, 10, 5, 100, 100);
