// --- Wheel Data ---
// This array represents your WheelData!F2:F39 range in wheel order
// IMPORTANT: Make sure this exactly matches the order on your physical wheel (0, 00, 1-36)
// Use numbers for 1-36 and 0. Use string "00" if that's how you enter it.
const wheelData = [
    0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, "00", 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2
];

const wheelSize = wheelData.length; // Should be 38 for double zero. If no 00, change to 37.

// --- History Storage ---
let spinHistory = []; // This array will store all entered spin results

// --- Get HTML Elements ---
const spinInput = document.getElementById('spinInput');
const addSpinButton = document.getElementById('addSpinButton');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const validationFeedback = document.getElementById('validationFeedback');

const lastSpinQuadrantOutput = document.getElementById('lastSpinQuadrantOutput');
const lastSpinHalfOutput = document.getElementById('lastSpinHalfOutput');
const sum4Output = document.getElementById('sum4Output');
const avg10Output = document.getElementById('avg10Output');
const spatialOutput = document.getElementById('spatialOutput'); // Reference for Spatial output
const trendOutput = document.getElementById('trendOutput'); // Reference for Trend output
const volatilityOutput = document.getElementById('volatilityOutput'); // Reference for Volatility output


const suggestionOutput = document.getElementById('suggestionOutput');
const surroundingNumbersOutput = document.getElementById('surroundingNumbersOutput');
const last10SpinsList = document.getElementById('last10SpinsList');
const last10QuadrantsList = document.getElementById('last10QuadrantsList');
const last10HalvesList = document.getElementById('last10HalvesList');


// --- Helper Function: Get Quadrant (Equivalent to Column B logic) ---
function getQuadrant(number) {
    // Ensure input is a number for comparison, handle "00" and 0 appropriately
    if (number === "00") return "00"; // Return "00" specifically
    if (number === 0) return 0; // Return 0 specifically

    const num = parseFloat(number); // Try converting
    if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 36) {
         return null; // Not a valid number 1-36
    }

    if (num >= 1 && num <= 9) return 1;
    if (num >= 10 && num <= 18) return 2;
    if (num >= 19 && num <= 27) return 3;
    if (num >= 28 && num <= 36) return 4;

    return null; // Should not happen for 1-36, but as a fallback
}

// --- Helper Function: Get Half (Equivalent to Column C logic) ---
function getHalf(number) {
    // Handle "00" and 0 appropriately
     if (number === "00") return "00";
     if (number === 0) return 0;

    const num = parseFloat(number); // Try converting
     if (isNaN(num) || !Number.isInteger(num) || num < 1 || num > 36) {
         return null; // Not a valid number 1-36
     }

    if (num >= 1 && num <= 18) return "1-18";
    if (num >= 19 && num <= 36) return "19-36";

    return null; // Should not happen
}


// --- Helper Function: Calculate Sum of Last 4 Quadrants (Equivalent to E3 logic) ---
// **MODIFIED to include 0/00 in history count but not sum**
function calculateSumLast4Quads(historyArray) {
    // Requires at least 4 total spins in history
    if (historyArray.length < 4) return null;

    const last4Spins = historyArray.slice(-4); // Get the last 4 entries

    let sum = 0;
    // Removed count check inside loop - just sum valid quads

    for (const spin of last4Spins) {
        const quad = getQuadrant(spin);
        // Only sum quadrants 1-4, ignore 0, 00, or null
        if (typeof quad === 'number' && quad >= 1 && quad <= 4) {
            sum += quad;
        }
        // Do NOT return null here if quad is 0, "00", or null - calculation proceeds
    }
    // Returns 0 if >= 4 spins but no valid quads in the last 4 (e.g., four 0s in a row)
    // Returns sum if >= 4 spins and valid quads were found in the last 4
    return sum;
}

// --- Helper Function: Calculate Avg of Last 10 Raw (Equivalent to E4 logic) ---
// **MODIFIED to include 0/00 in history count but not avg sum/count**
function calculateAvgLast10Raw(historyArray) {
    // Requires at least 10 total spins in history
    if (historyArray.length < 10) return null;

    const last10Spins = historyArray.slice(-10); // Get the last up to 10 entries

    let sum = 0;
    let count = 0; // Count valid 1-36 numbers for average

    for (const spin of last10Spins) {
         // Only include numbers 1-36 in the raw average
        const numberValue = parseFloat(spin); // Try converting

        if (!isNaN(numberValue) && typeof spin !== 'string' && spin >= 1 && spin <= 36) { // Check if it's a valid number 1-36
             sum += numberValue;
            count++;
        }
         // Do NOT return null here if spin is 0, "00", or invalid type - calculation proceeds
    }

    // Returns average if count > 0, otherwise return null (if 10 spins but no valid 1-36 numbers in last 10)
    return count > 0 ? sum / count : null;
}

// --- Helper Function: Classify Sum of 4 (Equivalent to F1 logic) ---
function classifyE3(sum4) {
    if (sum4 === null) return ""; // No sum data from 4 quads

    // Use ranges defined previously (Sum ranges from 4 to 16 for 4 quads)
    if (sum4 <= 4) return "E3_ExtremeLow"; // Only 4
    if (sum4 >= 16) return "E3_ExtremeHigh"; // Only 16
    if (sum4 >= 5 && sum4 <= 6) return "E3_Low";
    if (sum4 >= 14 && sum4 <= 15) return "E3_High";
    if (sum4 >= 7 && sum4 <= 8) return "E3_MidLow";
    if (sum4 >= 12 && sum4 <= 13) return "E3_MidHigh";
    if (sum4 >= 9 && sum4 <= 11) return "E3_Medium"; // Covers 9, 10, 11

     return ""; // Fallback - should cover 4-16
}

// --- Helper Function: Classify Avg of 10 (Equivalent to G1 logic) ---
function classifyE4(avg10) {
     if (avg10 === null) return ""; // No avg data from 10 numbers

    // Use ranges defined previously (Avg ranges roughly 1-36)
    // Make sure these match the H1 conditions exactly
    if (avg10 < 14) return "E4_ExtremeLow";
    if (avg10 > 23) return "E4_ExtremeHigh";
    if (avg10 >= 14 && avg10 < 16) return "E4_Low";
    if (avg10 > 21 && avg10 <= 23) return "E4_High";
    if (avg10 >= 17 && avg10 <= 20) return "E4_Medium"; // Covers 17-20 (near 18.5)
    if (avg10 >= 16 && avg10 < 17) return "E4_MidLow";
    if (avg10 > 20 && avg10 <= 21) return "E4_MidHigh";

     return ""; // Fallback
}


// --- Helper Function: Calculate Spatial Distribution (V3.5) ---
// Calculates the average index position (0-37) of the last 10 valid spins on the wheel.
function calculateSpatialDistribution(historyArray) {
    // Requires at least 10 total spins in history to calculate average position
    if (historyArray.length < 10) return null;

    const last10Spins = historyArray.slice(-10); // Get the last 10 entries

    let indexSum = 0;
    let validCount = 0; // Count valid spins found in the last 10

    for (const spin of last10Spins) {
        // Check if it's a valid number (0-36) or "00" for indexing
        const isValidSpinValue = (typeof spin === 'number' && !isNaN(spin) && spin >= 0 && spin <= 36 && Number.isInteger(spin)) || (typeof spin === 'string' && spin === "00");

        if (isValidSpinValue) {
            const index = wheelData.indexOf(spin); // Find the 0-based index (0 to 37)
            if (index !== -1) { // Ensure the value is found in the wheelData array
                 indexSum += index;
                 validCount++;
            }
        }
        // Invalid spins (like letters or numbers outside 0-36/00) are ignored for the average
    }

    // Return null if no valid spins were found in the last 10
    if (validCount === 0) return null;

    // Return the numerical average index (a number between 0 and 37)
    return indexSum / validCount;
}

// --- Helper Function: Classify Spatial Index (V3.5) ---
// Translates the numerical average index into a text classification label.
// The getSuggestion function will use this classification.
function classifySpatialIndex(avgIndex) {
    if (avgIndex === null) return ""; // No average index data

    // Define index ranges (0-37) for spatial zones on the wheel
    // These are example ranges based on a 38-number linear index
    // You may want to adjust these based on your wheel's physical layout and intuition
    if (avgIndex >= 0 && avgIndex <= 4) return "Spatial: Near Zeros"; // Indices 0-4
    if (avgIndex > 4 && avgIndex <= 9) return "Spatial: First Quarter Arc"; // Indices 5-9
    if (avgIndex > 9 && avgIndex <= 14) return "Spatial: Second Quarter Arc"; // Indices 10-14
    if (avgIndex > 14 && avgIndex <= 19) return "Spatial: Opposite Arc"; // Indices 15-19 (~around opposite)
    if (avgIndex > 19 && avgIndex <= 24) return "Spatial: Third Quarter Arc"; // Indices 20-24
    if (avgIndex > 24 && avgIndex <= 29) return "Spatial: Fourth Quarter Arc"; // Indices 25-29
    if (avgIndex > 29 && avgIndex <= 34) return "Spatial: Approaching Zeros Arc"; // Indices 30-34
    if (avgIndex > 34 && avgIndex <= 37) return "Spatial: Very Near Zeros Arc"; // Indices 35-37

    return ""; // Fallback
}


// --- Helper Function: Calculate Trend/Momentum (V3.5 - Placeholder) ---
// Will implement logic to analyze sequence for directional bias (e.g., upward/downward trend, streaks).
function calculateTrendMomentum(historyArray) {
    // TODO: Implement logic to analyze sequence for directional bias
    // This will look at the order and values of recent spins
    // For now, return a placeholder string or null
    if (historyArray.length < 2) return null; // Need at least 2 spins to show trend

    // Placeholder logic: Simple check of last two spins
    const last2 = historyArray.slice(-2);
    const [spinPrev, spinLast] = last2;

    if (typeof spinPrev === 'number' && typeof spinLast === 'number') {
        if (spinLast > spinPrev) return "Trend: Up (Last 2)";
        if (spinLast < spinPrev) return "Trend: Down (Last 2)";
        if (spinLast === spinPrev) return "Trend: Sideways (Last 2)";
    } else if (typeof spinPrev === 'string' && typeof spinLast === 'string' && spinPrev === spinLast) {
         // Handle consecutive zeros if they are strings like "00"
         if (spinPrev === "00") return "Trend: Sideways (00)";
    }
    // TODO: Replace with more sophisticated trend analysis (e.g., consistent direction over 3-5 spins, trend within Quadrants/Halves)
     return "Trend: Analyzing..."; // Placeholder if not enough data or type mismatch for simple check
}

// --- Helper Function: Calculate Volatility (V3.5 - Placeholder) ---
// Will implement logic to measure scatter or variability of recent results.
// For now, it returns a placeholder string or null
function calculateVolatility(historyArray) {
    // TODO: Implement logic to measure scatter or variability of recent spins
    // This could be standard deviation of positions, number of unique quads/halves hit recently, etc.
    // For now, it returns a placeholder string or null
    if (historyArray.length < 3) return null; // Need at least a few spins to measure scatter

    // Placeholder logic: Simple check of unique quadrants in the last 3 spins
    const lastFew = historyArray.slice(-3);
    const uniqueQuads = new Set();
    let allHaveQuads = true;

    for (const spin of lastFew) {
        const quad = getQuadrant(spin);
        if (quad !== null && typeof quad === 'number' && quad >= 1 && quad <= 4) { // Count only 1-4 quads for this simple check
             uniqueQuads.add(quad);
        } else {
             allHaveQuads = false; // If any is not a simple 1-4 quad
        }
    }

    if (lastFew.length < 3 || !allHaveQuads) return "Volatility: Analyzing..."; // Need enough data AND valid quads for this check

    // Simple volatility: 1 unique quad = Low V, 2 = Medium V, 3+ = High V
    if (uniqueQuads.size <= 1) return "Volatility: Low"; // All in same quad (or only 1-2 valid quads in 3 spins)
    if (uniqueQuads.size === 2) return "Volatility: Medium";
    if (uniqueQuads.size >= 3) return "Volatility: High";

    return "Volatility: Analyzing..."; // Fallback
}


// --- Helper Function: Get Suggestion (V3.5 - Takes all indicators) ---
// This function takes the classified states of E3 (sum), E4 (avg), Spatial, Trend, and Volatility
// and outputs a detailed suggestion string based on their combination.
function getSuggestion(e3Class, e4Class, spatialClass, trend, volatility) { // Added new parameters
    // Need classifications from both E3 (sum of 4) and E4 (avg of 10) for a base suggestion
     if (e3Class === "" || e4Class === "") {
         // Display this message if not enough history for E3/E4 base classification
         return "Analyzing Pattern... Need 4+ Quads & 10+ Numbers for base analysis.";
     }

     // Need Trend & Volatility & Spatial data for full V3.5 analysis
     // Check if *all* classification strings are ready from helpers
     // NOTE: Trend/Volatility/Spatial helpers return null or placeholder string like "Analyzing..."
     // Need to check if they returned a non-null/non-placeholder value if their data requirement is met
     // For now, let's check if they are *not* null AND *not* the "Analyzing..." placeholder
     const v35IndicatorsReady = spatialClass !== "" && trend !== null && trend !== "Trend: Analyzing..." && volatility !== null && volatility !== "Volatility: Analyzing...";


     if (!v35IndicatorsReady) {
          return "Analyzing Pattern... Need more data for V3.5 indicators."; // Indicate waiting for new indicators
     }


    // --- Intricate Web: Mapping Classified States to Bet Possibilities ---
    // Order is important - more specific/extreme combinations first

    // Example using NEW V3.5 Indicators (These rules override older ones when indicators are ready)
    // Case 1: Very High Deviation + High Volatility -> High Risk Signal
    if (e3Class.includes("ExtremeHigh") && e4Class.includes("ExtremeHigh") && volatility === "Volatility: High") {
        return "HIGH RISK: Extreme Deviation + High Volatility. Pattern Unclear. Exercise Extreme Caution.";
    }
     if (e3Class.includes("ExtremeLow") && e4Class.includes("ExtremeLow") && volatility === "Volatility: High") {
         return "HIGH RISK: Extreme Deviation + High Volatility. Pattern Unclear. Exercise Extreme Caution.";
     }

     // Case 2: Strong Deviation + Trend Alignment + Low Volatility -> Strong Suggestion
     // If balance is low AND trend is down AND volatility is low
     if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_Low" || e4Class === "E4_MidLow") && trend === "Trend: Down (Last 2)" && volatility === "Volatility: Low") {
         return "VERY Strong Suggest (Low): Low Halves (1-18). Trend/Balance aligned + Low Volatility. High Confidence!";
     }
      // If balance is high AND trend is up AND volatility is low
      if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_High" || e4Class === "E4_High")) { // Typo fixed below
          if (trend === "Trend: Up (Last 2)" && volatility === "Volatility: Low") {
              return "VERY Strong Suggest (High): High Halves (19-36). Trend/Balance aligned + Low Volatility. High Confidence!";
          }
     }
     // Corrected G1 High check: (e4Class === "E4_High" || e4Class === "E4_MidHigh")
      if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_High" || e4Class === "E4_MidHigh")) {
          if (trend === "Trend: Up (Last 2)" && volatility === "Volatility: Low") {
              return "VERY Strong Suggest (High): High Halves (19-36). Trend/Balance aligned + Low Volatility. High Confidence!";
          }
      }


    // Case 3: Near Balance + Low Volatility -> Strong Suggest Middle
    if (e3Class === "E3_Medium" && e4Class === "E4_Medium" && volatility === "Volatility: Low") {
         return "Suggest (Near Balance): Bet Middle (Dozen 2/Mid Quads). Indicators near balance + Low Volatility. Highest Likeliness.";
    }

     // TODO: Add many more rules here covering combinations of all 5 indicators!
     // Example: E3_MidHigh + E4_High + Trend: Down + Volatility: Medium + Spatial: Near Zeros -> ???

    // --- OLD Rules (Fallback if V3.5 specific rules above aren't met AND V3.5 indicators are ready) ---
    // Only use OLD rules if the new indicators ARE ready but didn't trigger a new rule
     if (v35IndicatorsReady) {
        // Case 1 (Old): Extreme Low E3 & Extreme Low E4
        if (e3Class === "E3_ExtremeLow" && e4Class === "E4_ExtremeLow") {
            return "Fallback (V3.5 Ready): Extreme Low Balance. Review Low Zones."; // Simplified Fallback
        }

        // Case 2 (Old): Extreme High E3 & Extreme High E4
        if (e3Class === "E3_ExtremeHigh" && e4Class === "E4_ExtremeHigh") {
             return "Fallback (V3.5 Ready): Extreme High Balance. Review High Zones."; // Simplified Fallback
        }

        // Case 3 (Old): Strong Below Balance
        if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_Low" || e4Class === "E4_MidLow")) {
            return "Fallback (V3.5 Ready): Strong Below Balance. Review 1-18 Half/Q1/Q2."; // Simplified Fallback
        }

        // Case 4 (Old): Strong Above Balance
        if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_High" || e4Class === "E4_High")) { // Typo fixed below
            return "Fallback (V3.5 Ready): Strong Above Balance. Review 19-36 Half/Q3/Q4."; // Simplified Fallback
        }
        if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_MidHigh")) { // Added MidHigh check
            return "Fallback (V3.5 Ready): Strong Above Balance. Review 19-36 Half/Q3/Q4."; // Simplified Fallback
        }

         // Case 5 (Old): Very Near Balance (This is handled by new rule Case 3 if Low Volatility)
         // If V=Medium or High, this old rule isn't triggered by new rules, will fall through or hit other rules

        // Leaning cases (Old Rules - Fallback if no specific V3.5 or Strong/Very Strong Old rule met)
        if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_MidLow" || e4Class === "E4_Medium")) return "Fallback (V3.5 Ready): Leaning High E, Near E. Review High Quads.";
        if ((e3Class === "E3_Medium" || e3Class === "E3_MidHigh") && (e4Class === "E4_High" || e4Class === "E4_High")) return "Fallback (V3.5 Ready): Leaning Near E, High E. Review High Halves.";
        if ((e3Class === "E3_Medium" || e3Class === "E3_MidHigh") && (e4Class === "E4_MidHigh")) return "Fallback (V3.5 Ready): Leaning Near E, MidHigh E. Review High Halves.";
        if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_MidLow" || e4Class === "E4_Medium")) return "Fallback (V3.5 Ready): Leaning Low E, Near E. Review Low Quads.";
        if ((e3Class === "E3_Medium" || e3Class === "E3_MidHigh") && (e4Class === "E4_Low" || e4Class === "E4_MidLow")) return "Fallback (V3.5 Ready): Leaning Near E, Low E. Review Low Halves.";

        // Conflict cases (Old Rules - Fallback)
        if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_Low" || e4Class === "E4_MidLow")) return "Fallback (V3.5 Ready): Conflict High E vs Low E. Review Boundary Zones.";
        if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_High" || e4Class === "E4_High")) {
             return "Fallback (V3.5 Ready): Conflict Low E vs High E. Review Boundary Zones.";
        }
        if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_MidHigh")) {
             return "Fallback (V3.5 Ready): Conflict Low E vs MidHigh E. Review Boundary Zones.";
        }


        // If V3.5 is ready but none of the specific *new* rules or *old fallback* rules were hit, it's a truly unclassified state under the old system.
        // This is where the base 4 '2' signal might be strongest OR the pattern is truly undefined by current rules.
        return "V3.5 Ready, State Unclassified by Old Rules. Review All Indicators.";


    /*
    // Optional: Add the Zero Edge Signal Trigger - This logic needs to go *before* returning the final default suggestion
    // We can add a dedicated output for this Zero Signal Status separately in the display,
    // controlled by checking if the getSuggestion function returns a string containing "Zero Edge Signal ACTIVE".
    */
}

// --- Helper Function: Get Surrounding Numbers String (Equivalent to E5 logic) ---
function getSurroundingNumbersString(spinResult) {
    // List of numbers adjacent to 0 or 00 that we want to highlight
    const zeroAdjacentNumbers = [1, 2, 27, 28, 14, 9, 13, 10]; // Your list

    // Helper to format a single number with highlighting if it's zero-adjacent
    function formatNumberWithHighlight(number) {
        // Check if the number (converted to a string or kept as string "00") is in our list
        // Ensure we compare the number itself, not its quadrant/half
        const numValue = (typeof number === 'number' && !isNaN(number)) ? number : String(number); // Handle 0 and "00" comparison

        // Use String(number) for the comparison array if zeroAdjacentNumbers contains strings like "1", "2" etc.
        // Or convert array to numbers if it contains numbers.
        // Let's convert the list to strings for robust comparison against string/number values from wheelData
        const zeroAdjacentStrings = zeroAdjacentNumbers.map(String);

        if (zeroAdjacentStrings.includes(String(number))) { // Compare string representations
            // Wrap the number in a span with the zero-adjacent class
            return `<span class="zero-adjacent">${number}</span>`;
        }
        return String(number); // Otherwise, just return the number as a string
    }

    // Handle blank or invalid input early
     if (spinResult === "" || spinResult === null || typeof spinResult === 'undefined') {
        return ""; // Return blank string
    }

    // Try to parse the input number, but keep "00" as string if needed
    let numberToMatch = (spinResult === "00") ? "00" : parseFloat(spinResult);
    if (spinResult === 0) numberToMatch = 0; // Ensure 0 is treated as number 0


    // Check if input is valid (a number or "00")
     if (isNaN(numberToMatch) && numberToMatch !== "00" && numberToMatch !== 0) {
         return "Error: Invalid input type"; // Or handle this error elsewhere
     }

    try {
        // Find the position of the spin result in the wheel data (using 0-based index for JS arrays)
        // Use a loop for matching to handle strict type matching (number 0 vs string "00")
        let spinMatchIndex = -1;
        for(let i = 0; i < wheelData.length; i++) {
            if (wheelData[i] === numberToMatch) {
                spinMatchIndex = i;
                break;
            }
        }


        if (spinMatchIndex === -1) {
            // Number not found in WheelData
            return "Error: Spin not found in WheelData";
        }

        // Calculate the position of the polar opposite (0-based index)
        const oppositeMatchIndex = (spinMatchIndex + 19) % wheelSize;

        let surroundingNumbers = [];

        // Around Self (5 before, self, 5 after)
        for (let i = -5; i <= 5; i++) {
            const position = (spinMatchIndex + i + wheelData.length) % wheelData.length; // Handles wrapping, use wheelData.length
            surroundingNumbers.push(wheelData[position]);
        }

        let oppositeNumbers = [];
         // Around Opposite (5 before, opposite, 5 after)
         for (let i = -5; i <= 5; i++) {
            const position = (oppositeMatchIndex + i + wheelData.length) % wheelData.length; // Handles wrapping, use wheelData.length
            oppositeNumbers.push(wheelData[position]);
        }

        // Build the final output string, applying formatting to each number
        let outputParts = surroundingNumbers.map(formatNumberWithHighlight);
        let outputString = "| " + outputParts.join(" | ") + " | ";
        outputString += " --- | "; // The separator you found
        outputParts = oppositeNumbers.map(formatNumberWithHighlight);
        outputString += outputParts.join(" | ") + " |";


        return outputString;


    } catch (error) {
        // Catch any errors during calculation
        return "Calculation Error: " + error.message;
    }
}


// --- Main Update Function ---
// This function is called when the Add Spin button is clicked
function updateAnalysisDisplay() {
    // 1. Get the current value from the input box
    const currentInputValue = spinInput.value.trim(); // Use trim to remove leading/trailing spaces

    // Clear previous outputs if the input is blank - Should not happen with button, but good practice
    if (currentInputValue === "") {
        // Clear display elements
        sum4Output.textContent = "";
        avg10Output.textContent = "";
        suggestionOutput.textContent = "";
        surroundingNumbersOutput.textContent = "";
        lastSpinQuadrantOutput.textContent = "";
        lastSpinHalfOutput.textContent = "";
        last10SpinsList.textContent = ""; // Clear history display
        last10QuadrantsList.textContent = ""; // Clear Q history display
        last10HalvesList.textContent = ""; // Clear H history display
        validationFeedback.textContent = ""; // Clear validation message
        return; // Stop processing
    }

     // 2. Validate and parse the input (handle "0", "00", and numbers)
    let parsedSpin;
    if (currentInputValue === "00") {
        parsedSpin = "00"; // Keep "00" as string
    } else {
       const num = parseFloat(currentInputValue);
       if (isNaN(num) || !Number.isInteger(num) || num < 0 || num > 36) { // Includes 0 in valid numbers
           // Input is not a valid number 0-36 or "00"
            validationFeedback.textContent = "Invalid input. Enter 0-36 or 00."; // Show validation error
             // Clear display elements
             sum4Output.textContent = "";
             avg10Output.textContent = "";
             suggestionOutput.textContent = "";
             surroundingNumbersOutput.textContent = "";
             lastSpinQuadrantOutput.textContent = "";
             lastSpinHalfOutput.textContent = "";
             last10SpinsList.textContent = ""; // Clear history display
             last10QuadrantsList.textContent = ""; // Clear Q history display
             last10HalvesList.textContent = ""; // Clear H history display
            return; // Stop processing
       }
       parsedSpin = num; // Valid number (0-36)
    }

    // Input is valid - clear validation feedback
    validationFeedback.textContent = "";

    // 3. Add the validated input to the history array
    // **Corrected Logic: Always push valid input**
    spinHistory.push(parsedSpin);
    // Optional: Limit history size? spinHistory = spinHistory.slice(-100); // Keep last 100


    // --- Perform Calculations based on History ---
    // Get the most recent spin from history
    const lastSpinFromHistory = spinHistory.length > 0 ? spinHistory[spinHistory.length - 1] : null;

    // Only proceed if history is not empty (redundant check with above logic, but safe)
    if (lastSpinFromHistory === null) {
         // Clear display elements
         sum4Output.textContent = "";
        avg10Output.textContent = "";
        suggestionOutput.textContent = "";
        surroundingNumbersOutput.textContent = "";
        lastSpinQuadrantOutput.textContent = "";
        lastSpinHalfOutput.textContent = "";
        last10SpinsList.textContent = ""; // Clear history display
        last10QuadrantsList.textContent = ""; // Clear Q history display
        last10HalvesList.textContent = ""; // Clear H history display
        return;
    }


    // Display Last Spin Quadrant and Half for the LAST spin added
     const lastSpinQuad = getQuadrant(lastSpinFromHistory);
     lastSpinQuadrantOutput.textContent = lastSpinQuad !== null ? lastSpinQuad : "N/A";

     const lastSpinHalf = getHalf(lastSpinFromHistory);
     lastSpinHalfOutput.textContent = lastSpinHalf !== null ? lastSpinHalf : "N/A";


    // Calculate Sum of Last 4 Quadrants
    const sum4 = calculateSumLast4Quads(spinHistory);
    sum4Output.textContent = sum4 !== null ? sum4 : "N/A (<4 quads)"; // Display Sum of 4

    // Calculate Avg of Last 10 Raw Results
    const avg10 = calculateAvgLast10Raw(spinHistory);
    avg10Output.textContent = avg10 !== null ? avg10.toFixed(2) : "N/A (<10 numbers)"; // Display Avg of 10 (formatted)

    // Classify indicators
    const e3Class = classifyE3(sum4);
    const e4Class = classifyE4(avg10);

    // Get Suggestion (H1)
    const suggestion = getSuggestion(e3Class, e4Class);
    suggestionOutput.textContent = suggestion;


    // --- Get & Display Surrounding Numbers for the LAST spin ---
     const surroundingString = getSurroundingNumbersString(lastSpinFromHistory);
     surroundingNumbersOutput.innerHTML = surroundingString; // Use innerHTML to render HTML tags


     // --- Display History Lists ---
     // Get the last 10 spins (or fewer)
     const last10Spins = spinHistory.slice(-10);

     // Calculate Quadrants and Halves for the last 10 spins
     const last10Quads = last10Spins.map(spin => {
         const quad = getQuadrant(spin);
         // Display 0, 00, or N/A if not a 1-4 quadrant
         if (quad === 0) return 0;
         if (quad === "00") return "00";
         if (quad === null) return "N/A";
         return quad; // Return 1, 2, 3, or 4
     });

     const last10Halves = last10Spins.map(spin => {
         const half = getHalf(spin);
          // Display 0, 00, or N/A if not a 1-18/19-36 half
         if (half === 0) return 0;
         if (half === "00") return "00";
         if (half === null) return "N/A";
         return half; // Return "1-18" or "19-36"
     });


     // **Display the History Lists (Most recent FIRST)**
     // Need to reverse the slices *before* joining them for display
     const displayedSpins = last10Spins.slice().reverse(); // Create copy before reversing
     const displayedQuads = last10Quads.slice().reverse(); // Create copy before reversing
     const displayedHalves = last10Halves.slice().reverse(); // Create copy before reversing


     last10SpinsList.textContent = displayedSpins.join(", ");
     last10QuadrantsList.textContent = displayedQuads.join(", ");
     last10HalvesList.textContent = displayedHalves.join(", ");


     // Clear input field after adding to history
     spinInput.value = ""; // Uncomment this line if you want input field to clear after adding
     // Keep focus on input for rapid entry (optional)
     // spinInput.focus(); // This might cause issues on some mobile keyboards

}


// --- Event Listener ---
// **Trigger updateAnalysisDisplay when the Add Spin button is clicked**
addSpinButton.addEventListener('click', updateAnalysisDisplay);

// Optional: Also trigger on Enter key press in the input field
spinInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission if any
        updateAnalysisDisplay(); // Trigger update
    }
});


// --- Initial Call ---
// No initial call needed as user will press button
// updateAnalysisDisplay();

/*
// Optional: Add a button to clear history
// Add button in HTML: <button id="clearHistoryButton">Clear History</button>
// **This code IS now active in the main script block provided above**
*/

// Clear History Button Listener (Active in the main script block)
clearHistoryButton.addEventListener('click', () => {
    spinHistory = [];
    spinInput.value = ""; // Clear input too
    // Clear all display elements
    sum4Output.textContent = "";
    avg10Output.textContent = "";
    suggestionOutput.textContent = "";
    surroundingNumbersOutput.textContent = "";
    lastSpinQuadrantOutput.textContent = "";
    lastSpinHalfOutput.textContent = "";
    last10SpinsList.textContent = "";
    last10QuadrantsList.textContent = "";
    last10HalvesList.textContent = "";
    validationFeedback.textContent = "";
     // spinInput.focus(); // Return focus - This might cause issues on some mobile keyboards
});


/*
// Optional: Function to save/load history to browser's local storage (more advanced)
// This allows history to persist if you close and reopen the browser page
*/