/**
 * Bayesian inference system for adaptive color vision testing
 *
 * Workflow:
 * 1. Start with simulation-based priors (from color-blind library)
 * 2. Present test pairs predicted to be confusable
 * 3. Update beliefs based on user responses
 * 4. Build personalized confusion map
 */

import { calculateConfusionProbability } from './confusablePairFinder.js';
import { deltaE } from './colorSpace.js';

/**
 * Beta distribution parameters for modeling confusion probability
 * Alpha = successes (times user said "different")
 * Beta = failures (times user said "same")
 */
class BetaDistribution {
	constructor(alpha = 1, beta = 1) {
		this.alpha = alpha; // Prior: start with weak belief
		this.beta = beta;
	}

	/**
	 * Get mean probability (expected value)
	 */
	getMean() {
		return this.alpha / (this.alpha + this.beta);
	}

	/**
	 * Get variance (uncertainty)
	 */
	getVariance() {
		const sum = this.alpha + this.beta;
		return (this.alpha * this.beta) / (sum * sum * (sum + 1));
	}

	/**
	 * Get standard deviation
	 */
	getStdDev() {
		return Math.sqrt(this.getVariance());
	}

	/**
	 * Update distribution with new observation
	 * @param {boolean} success - True if user distinguished colors, false if confused
	 * @param {number} weight - Update strength (default 1.0), scales with color distance
	 */
	update(success, weight = 1.0) {
		if (success) {
			this.alpha += weight; // User distinguished = evidence against confusion
		} else {
			this.beta += weight; // User confused = evidence for confusion
		}
	}

	/**
	 * Get number of observations
	 */
	getN() {
		return this.alpha + this.beta - 2; // Subtract initial priors
	}

	/**
	 * Calculate entropy (uncertainty measure)
	 */
	getEntropy() {
		const mean = this.getMean();
		if (mean === 0 || mean === 1) return 0;
		return -(mean * Math.log2(mean) + (1 - mean) * Math.log2(1 - mean));
	}
}

/**
 * Bayesian learning system for color vision testing
 */
export class BayesianColorVisionModel {
	constructor(colorblindnessType, severity = 0.6) {
		this.colorblindnessType = colorblindnessType;
		this.severity = severity; // User's CVD severity (0.0-1.0), used for future enhancements
		// Map of color pair -> BetaDistribution
		// Key format: "color1|color2" (sorted alphabetically)
		this.pairBeliefs = new Map();
		this.testHistory = [];
	}

	/**
	 * Get or create belief distribution for a color pair
	 */
	getBeliefForPair(color1, color2) {
		const key = this.getPairKey(color1, color2);

		if (!this.pairBeliefs.has(key)) {
			// Initialize with simulation-based prior
			const simProb = calculateConfusionProbability(color1, color2, this.colorblindnessType);

			// Convert probability to beta parameters
			// Higher simulation probability = higher initial beta (more confusion expected)
			const strength = 2; // How strong the prior is (lower = weaker prior)
			const alpha = strength * (1 - simProb) + 1;
			const beta = strength * simProb + 1;

			this.pairBeliefs.set(key, new BetaDistribution(alpha, beta));
		}

		return this.pairBeliefs.get(key);
	}

	/**
	 * Create consistent key for color pair (order-independent)
	 */
	getPairKey(color1, color2) {
		return [color1, color2].sort().join('|');
	}

	/**
	 * Calculate evidence weight based on perceptual color distance (Delta E)
	 *
	 * Principle: Larger perceptual distances provide stronger evidence about confusion ability
	 *
	 * Rationale from psychometric testing research:
	 * - Confusing very similar colors (ΔE < 2): Reduced information, weight ~0.77-0.81
	 *   (might be screen/lighting artifacts, measurement noise - 21% reduction)
	 * - Confusing moderately different colors (ΔE 2-10): Standard information, weight ~0.81-1.0
	 *   (JND to perceptible range, good discrimination tests)
	 * - Confusing clearly different colors (ΔE 10-30): High information, weight ~1.0-1.38
	 *   (strong evidence of true confusion patterns - up to 38% increase)
	 * - Confusing very different colors (ΔE > 30): Capped at 1.0
	 *   (less informative beyond this range, outcome becomes obvious)
	 *
	 * Uses sigmoid-based weighting (k=0.1) centered around ΔE=10 (optimal discrimination range)
	 * Conservative approach: 1.8x ratio between min (0.77) and max (1.38) weights
	 *
	 * @param {number} deltaEValue - Perceptual color distance (CIEDE2000)
	 * @returns {number} Evidence weight factor (0.77-1.38, capped at 1.0 for ΔE>30)
	 */
	calculateEvidenceWeight(deltaEValue) {
		const minWeight = 0.5; // Minimum weight for very similar colors (ΔE < 2)
		const maxWeight = 1.5; // Maximum weight for moderate differences (ΔE 10-30)
		const center = 10; // Sigmoid center point (optimal discrimination range)
		const k = 0.1; // Steepness parameter (how quickly weight increases)

		// Sigmoid formula: weight = min + (max - min) * sigmoid(deltaE)
		const sigmoid = 1 / (1 + Math.exp(-k * (deltaEValue - center)));
		let weight = minWeight + (maxWeight - minWeight) * sigmoid;

		// Cap weight at 1.0 for very large ΔE (> 30)
		// Beyond this range, differences become obvious and less informative
		if (deltaEValue > 30) {
			weight = Math.min(weight, 1.0);
		}

		return weight;
	}

	/**
	 * Update beliefs based on user response
	 * @param {Object} trial - Trial data
	 * @param {string} userResponse - 'same' | 'color1' | 'color2'
	 */
	updateFromResponse(trial, userResponse) {
		const { color1, color2, reference } = trial;

		// Determine if user successfully distinguished colors
		const userSaidSame = userResponse === 'same';
		const userDistinguished = !userSaidSame;

		// Also track if they correctly identified the reference (if they said different)
		let identifiedCorrectly = false;
		if (!userSaidSame) {
			identifiedCorrectly = userResponse === trial.referencePosition;
		}

		// Calculate Delta E perceptual distance between colors
		const deltaEValue = deltaE(color1, color2);

		// Calculate evidence weight based on perceptual distance
		const weight = this.calculateEvidenceWeight(deltaEValue);

		// Update belief with distance-weighted evidence
		const belief = this.getBeliefForPair(color1, color2);
		belief.update(userDistinguished, weight);

		// Console logging for debugging and validation
		console.log(`[Bayesian Update] Test: ${color1} vs ${color2}`);
		console.log(`  ΔE (CIEDE2000): ${deltaEValue.toFixed(2)}`);
		console.log(`  Evidence Weight: ${weight.toFixed(3)}`);
		console.log(`  User Response: ${userDistinguished ? 'Distinguished' : 'Confused'}`);
		console.log(`  New Confusion Prob: ${(1 - belief.getMean()).toFixed(3)}`);

		// Record in history with Delta E and weight data
		this.testHistory.push({
			color1,
			color2,
			reference,
			userResponse,
			userDistinguished,
			identifiedCorrectly,
			deltaE: deltaEValue,
			updateWeight: weight,
			timestamp: Date.now(),
			beliefAfter: belief.getMean()
		});
	}

	/**
	 * Get confusion probability for a color pair
	 * Returns P(colors are confusable)
	 */
	getConfusionProbability(color1, color2) {
		const belief = this.getBeliefForPair(color1, color2);
		return 1 - belief.getMean(); // Invert: high alpha = low confusion
	}

	/**
	 * Check if two colors are confusable for this user
	 * @param {number} threshold - Probability threshold (default 0.7)
	 */
	areColorsConfusable(color1, color2, threshold = 0.7) {
		return this.getConfusionProbability(color1, color2) >= threshold;
	}

	/**
	 * Get uncertainty (entropy) for a color pair
	 * Higher = more uncertain, should test more
	 */
	getUncertainty(color1, color2) {
		const belief = this.getBeliefForPair(color1, color2);
		return belief.getEntropy();
	}

	/**
	 * Calculate expected information gain from testing a pair
	 * Used for selecting next optimal test
	 */
	calculateInformationGain(color1, color2) {
		const belief = this.getBeliefForPair(color1, color2);
		const currentEntropy = belief.getEntropy();

		// Simulate both possible outcomes
		const pDistinguish = belief.getMean();
		const pConfuse = 1 - pDistinguish;

		// Expected entropy after seeing result
		const beliefIfDistinguish = new BetaDistribution(belief.alpha + 1, belief.beta);
		const beliefIfConfuse = new BetaDistribution(belief.alpha, belief.beta + 1);

		const expectedEntropyAfter =
			pDistinguish * beliefIfDistinguish.getEntropy() + pConfuse * beliefIfConfuse.getEntropy();

		return currentEntropy - expectedEntropyAfter;
	}

	/**
	 * Get all tested color pairs
	 */
	getTestedPairs() {
		return Array.from(this.pairBeliefs.keys()).map((key) => {
			const [color1, color2] = key.split('|');
			const belief = this.pairBeliefs.get(key);
			return {
				color1,
				color2,
				confusionProb: 1 - belief.getMean(),
				uncertainty: belief.getEntropy(),
				nObservations: belief.getN()
			};
		});
	}

	/**
	 * Get pairs that user confirmed as confusable
	 * @param {number} threshold - Minimum confusion probability
	 */
	getConfusedPairs(threshold = 0.7) {
		return this.getTestedPairs().filter((pair) => pair.confusionProb >= threshold);
	}

	/**
	 * Identify color regions with highest confusion
	 * @param {number} threshold - Minimum confusion probability to be considered a hotspot
	 * @param {number} minObservations - Minimum number of observations required
	 * @returns {Array<string>} Array of hex colors in confusion hotspots
	 */
	getConfusionHotspots(threshold = 0.7, minObservations = 3) {
		const confusedPairs = this.getTestedPairs().filter(
			(pair) => pair.confusionProb >= threshold && pair.nObservations >= minObservations
		);

		// Extract unique colors from confused pairs
		const hotspotColors = new Set();
		confusedPairs.forEach((pair) => {
			hotspotColors.add(pair.color1);
			hotspotColors.add(pair.color2);
		});

		return Array.from(hotspotColors);
	}

	/**
	 * Suggest colors to test next based on gaps in coverage
	 * @param {Array<string>} colorPool - Available colors to choose from
	 * @param {number} count - Number of suggestions to return
	 * @returns {Array<string>} Suggested colors to test
	 */
	suggestNextColors(colorPool, count = 5) {
		const testedColors = new Set();
		this.getTestedPairs().forEach((pair) => {
			testedColors.add(pair.color1);
			testedColors.add(pair.color2);
		});

		// Find untested colors
		const untestedColors = colorPool.filter((color) => !testedColors.has(color));

		// If most tested, return high-uncertainty pairs
		if (untestedColors.length < count) {
			const uncertainPairs = this.getTestedPairs()
				.sort((a, b) => b.uncertainty - a.uncertainty)
				.slice(0, count);
			return uncertainPairs.map((pair) => pair.color1);
		}

		return untestedColors.slice(0, count);
	}

	/**
	 * Estimate user's CVD severity based on confusion patterns
	 * Requires at least 50 test responses for accuracy
	 * @returns {number|null} Estimated severity (0.0-1.0) or null if insufficient data
	 */
	estimateSeverity() {
		if (this.testHistory.length < 50) {
			console.log(
				`Insufficient data for severity estimation (${this.testHistory.length}/50 tests)`
			);
			return null;
		}

		const testedPairs = this.getTestedPairs();

		// Compare user's confusion rates to simulation-based expectations
		let totalDeviation = 0;
		let count = 0;

		testedPairs.forEach((pair) => {
			if (pair.nObservations >= 3) {
				// Get simulation-based expected confusion
				const expectedProb = calculateConfusionProbability(
					pair.color1,
					pair.color2,
					this.colorblindnessType
				);

				// Compare to actual observed confusion
				const observedProb = pair.confusionProb;

				// If user confused more than expected → higher severity
				// If user confused less than expected → lower severity
				totalDeviation += observedProb - expectedProb;
				count++;
			}
		});

		if (count === 0) {
			console.log('No valid pairs for severity estimation');
			return 0.6; // Default medium
		}

		const avgDeviation = totalDeviation / count;

		// Map deviation to severity (0.0 = normal, 1.0 = complete)
		const baseSeverity = 0.6; // Assume medium by default
		const severityAdjustment = avgDeviation * 2; // Scaling factor

		const estimated = Math.max(0.0, Math.min(1.0, baseSeverity + severityAdjustment));

		console.log(`Severity estimated from ${count} pairs: ${(estimated * 100).toFixed(0)}%`);
		return estimated;
	}

	/**
	 * Export state for persistence
	 */
	exportState() {
		return {
			colorblindnessType: this.colorblindnessType,
			pairBeliefs: Array.from(this.pairBeliefs.entries()).map(([key, belief]) => ({
				key,
				alpha: belief.alpha,
				beta: belief.beta
			})),
			testHistory: this.testHistory
		};
	}

	/**
	 * Import state from persistence
	 */
	importState(state) {
		this.colorblindnessType = state.colorblindnessType;
		this.testHistory = state.testHistory || [];

		this.pairBeliefs.clear();
		if (state.pairBeliefs) {
			state.pairBeliefs.forEach(({ key, alpha, beta }) => {
				this.pairBeliefs.set(key, new BetaDistribution(alpha, beta));
			});
		}
	}
}
