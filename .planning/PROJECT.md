# Digit Pattern Recognition System

## What This Is

A complete pattern recognition pipeline for handwritten digit recognition using the sklearn digits dataset. It trains ML classifiers (KNN and SVM), saves the trained models, and provides a stunning web-based UI where users can draw digits and test model predictions in real-time. Built as Experiment 9 for CPRPR coursework.

## Core Value

Users can draw a digit on a canvas and instantly see the trained model's prediction with confidence scores - demonstrating the complete pattern recognition pipeline from training to real-world inference.

## Requirements

### Validated

(None yet - ship to validate)

### Active

- [ ] Load and preprocess sklearn digits dataset
- [ ] Extract discriminative features from digit images
- [ ] Train KNN classifier with optimized parameters
- [ ] Train SVM classifier with optimized parameters
- [ ] Evaluate models with accuracy, confusion matrix, classification report
- [ ] Save trained models in joblib format
- [ ] Build Flask API backend for model inference
- [ ] Build stunning web UI with canvas for digit drawing
- [ ] Real-time prediction with confidence scores
- [ ] Model comparison (KNN vs SVM) in the UI
- [ ] Visualization of training results (confusion matrix, accuracy plots)

### Out of Scope

- Deep learning / neural networks - sklearn classifiers are sufficient for this experiment
- Custom dataset collection - using sklearn's built-in digits dataset
- Mobile app - web-first, accessible from any browser
- User authentication - not needed for an experiment demo

## Context

- 8th Semester CPRPR course, Experiment 9
- Program 2: Application of Pattern Recognition Techniques to Real-World Problems
- Focus on demonstrating the complete pipeline: acquisition → preprocessing → feature extraction → training → testing → evaluation
- The sklearn digits dataset contains 8x8 pixel grayscale images of digits 0-9

## Constraints

- **Tech Stack**: Python, Flask, scikit-learn, NumPy, Matplotlib - standard ML stack
- **Dataset**: sklearn digits dataset (1797 samples, 8x8 pixels)
- **Timeline**: Single session implementation
- **UI**: Must be visually impressive with modern design aesthetics

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Flask over Streamlit | Full control over UI design, better for canvas drawing | - Pending |
| KNN + SVM | Compare two approaches as required by experiment | - Pending |
| joblib for model saving | Standard sklearn model serialization | - Pending |
| sklearn digits over MNIST | Lighter weight, built-in, sufficient for experiment | - Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check - still the right priority?
3. Audit Out of Scope - reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-28 after initialization*
