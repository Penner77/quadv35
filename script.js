console.log("--- My Roulette Script Loaded! ---");
// --- Wheel Data ---
// This array represents your WheelData!F2:F39 range in wheel order
// IMPORTANT: Make sure this exactly matches the order on your physical wheel (0, 00, 1-36)
// Use numbers for 1-36 and 0. Use string "00" if that's how you enter it.
const wheelData = [0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, 00, 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2
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
     if (spatialClass === "" || trend === null || volatility === null) { // Assuming helpers return null/"" if not ready
          return "Analyzing Pattern... Need more data for V3.5 indicators.";
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
     if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_High" || e4Class === "E4_High")) { // Corrected G1 High check below
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

    // The old rules become the default if the new, more specific V3.5 rules aren't met
    // These old rules don't directly use Trend, Volatility, or Spatial classification in their conditions
    // but the *new* logic above overrides them if those new indicators provide a stronger signal.

    // --- OLD Rules (Fallback if V3.5 specific rules above aren't met) ---

    // Case 1 (Old): Extreme Low E3 & Extreme Low E4
    if (e3Class === "E3_ExtremeLow" && e4Class === "E4_ExtremeLow") {
        return "OLD Rule: VERY Strong Suggest (Low): Focus Low Quads (1 & 2)..."; // Added "OLD Rule" for clarity during development
    }

    // Case 2 (Old): Extreme High E3 & Extreme High E4
    if (e3Class === "E3_ExtremeHigh" && e4Class === "E4_ExtremeHigh") {
        return "OLD Rule: VERY Strong Suggest (High): Focus High Quads (3 & 4)..."; // Added "OLD Rule"
    }

    // Case 3 (Old): Strong Below Balance
    if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_Low" || e4Class === "E4_MidLow")) {
        return "OLD Rule: Strong Suggest (Low): Low Halves (1-18)..."; // Added "OLD Rule"
    }

    // Case 4 (Old): Strong Above Balance
    if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_High" || e4Class === "E4_High")) { // Typo fixed below
        return "OLD Rule: Strong Suggest (High): High Halves (19-36)..."; // Added "OLD Rule"
    }
    if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_MidHigh")) { // Added MidHigh check
        return "OLD Rule: Strong Suggest (High): High Halves (19-36)..."; // Added "OLD Rule"
    }

     // Case 5 (Old): Very Near Balance
    if (e3Class === "E3_Medium" && e4Class === "E4_Medium") {
        return "OLD Rule: Suggest (Near Balance): Bet Middle (Dozen 2/Mid Quads)..."; // Added "OLD Rule"
    }

    // Case 6 (Old): Leaning High (E3 High/Avg, E4 Near/Avg)
    if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_MidLow" || e4Class === "E4_Medium")) {
        return "OLD Rule: Leaning Suggest (High): High Quads (3 & 4)..."; // Added "OLD Rule"
    }

    // Case 7 (Old): Leaning High (E3 Near/Avg, E4 High)
    if ((e3Class === "E3_Medium" || e3Class === "E3_MidHigh") && (e4Class === "E4_High" || e4Class === "E4_High")) { // Typo fixed below
        return "OLD Rule: Leaning Suggest (High): High Halves (19-36)..."; // Added "OLD Rule"
    }
    if ((e3Class === "E3_Medium" || e3Class === "E3_MidHigh") && (e4Class === "E4_MidHigh")) { // Added MidHigh check
        return "OLD Rule: Leaning Suggest (High): High Halves (19-36)..."; // Added "OLD Rule"
    }


    // Case 8 (Old): Leaning Low (E3 Low/Avg, E4 Near/Avg)
    if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_MidLow" || e4Class === "E4_Medium")) {
        return "OLD Rule: Leaning Suggest (Low): Low Quads (1 & 2)..."; // Added "OLD Rule"
    }

    // Case 9 (Old): Leaning Low (E3 Near/Avg, E4 Low)
    if ((e3Class === "E3_Medium" || e3Class === "E3_MidHigh") && (e4Class === "E4_Low" || e4Class === "E4_MidLow")) {
        return "OLD Rule: Leaning Suggest (Low): Low Halves (1-18)..."; // Added "OLD Rule"
    }


    // Case 10 (Old): Conflict (High E3 vs Low E4)
    if ((e3Class === "E3_High" || e3Class === "E3_MidHigh") && (e4Class === "E4_Low" || e4Class === "E4_MidLow")) {
         return "OLD Rule: Conflict: High Quads vs Low Avg..."; // Added "OLD Rule"
    }

    // Case 11 (Old): Conflict (Low E3 vs High E4)
    if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_High" || e4Class === "E4_High")) {
         return "OLD Rule: Conflict: Low Quads vs High Avg..."; // Added "OLD Rule"
    }
     if ((e3Class === "E3_Low" || e3Class === "E3_MidLow") && (e4Class === "E4_MidHigh")) { // Added MidHigh check
         return "OLD Rule: Conflict: Low Quads vs High Avg..."; // Added "OLD Rule"
    }


    // Case 12 (Default): Pattern Breakdown / Zero Edge Signal
    // This is the final default if NONE of the above rules (new or old) are met.
    return "V3.5: Pattern Breakdown. Indicators Muddled. Zero Edge Signal ACTIVE."; // Revised default message


    /*
    // Optional: Add the Zero Edge Signal Trigger - This logic needs to go *before* returning the final default suggestion
    // We can add a dedicated output for this Zero Signal Status separately in the display,
    // controlled by checking if the getSuggestion function returns a string containing "Zero Edge Signal ACTIVE".
    */
}