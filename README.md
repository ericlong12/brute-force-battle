# Brute Force Battle

A Real-Time Password Cracking Visualization

Project Topic: Visualizing Password Cracking
Date: October 22, 2025
Course: CS 166 Information Security
Department: Department of Computer Science
Instructor: Chao-Li Tarng
Team Number: 3
Members: Eric Long, Akanksha Bodkhe, Kenmin Ho


## Overview

Brute Force Battle turns password cracking concepts into an interactive web application that simulates password guessing mathematically. Users choose a password length or passphrase model and a hash/KDF preset; the app then visualizes:
- Keyspace size and expected trials (N and N/2)
- Probability of a successful crack over time
- Time-to-50% (T50) and Time-to-95% (T95)
- Effects of salts, slow/memory-hard KDFs, rate limits, lockouts, and MFA

The app helps connect topics like brute-force search, keyspace growth, password verifiers, HMAC, password authentication, and online vs. offline attack surfaces.


## Objectives and Scope

Goals:
1. Create passwords and show probability-of-crack vs time using T50/T95
2. Compare fast unsalted hashing vs. salted and memory-hard password hashing
3. Show how online controls (rate limit, lockout, MFA) reduce success rates
4. Provide preset scenarios to visualize how design choices change outcomes

Scope:
- Mathematical simulation (no real cracking) to estimate outcomes
- Two attacker contexts:
  - Offline: guesses against stored password verifiers
  - Online: guesses against a login endpoint with rate limits, lockouts, MFA
- Rainbow vs brute-force explainer showing why unique salts defeat rainbow tables


## Approaches

1. Brute force and keyspace growth: average success at ~half the space
2. Cryptographic context: where password verifiers fit vs encryption and MAC
3. Authentication: storage with salt, slow hashing, dictionary vs brute force
4. Web security and access control: server-side rate limits, lockouts, MFA
5. Online attempts traverse TCP endpoints (conceptual visualization)


## Deliverables

- Interactive app with modes:
  - Live Attack
  - Defender Controls
  - Hash Lab
  - Scenarios
- Project report: methods, assumptions, results
- Comparisons:
  - Short mixed-char + fast hashing
  - Longer passphrases + salted slow hashing
  - Online defenses with/without MFA
- Live demo + slide deck + GitHub repository

GitHub: https://github.com/ericlong12/brute-force-battle


## Quick Start

- Install: `npm install`
- Dev server: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
- Preview build: `npm run preview`


## Tech Stack

- React + TypeScript + Vite
- Chart.js (for visualizations)


## Notes

All simulations are mathematical/educational approximations, not real password cracking. Please use responsibly.


## Summary of Activities and Contributions

### What we finished

- Design & Planning
  - Finalized scope: math-based simulation
  - Created presets/demos
  - Sketched UI: tabs for Live Attack, Defender Controls, Hash Lab, Scenarios

- Math & Modeling
  - Derived probability-of-success vs guesses curves for brute force and dictionary models
  - Drafted formulas for expected trials (≈ N/2) and T50/T95
  - Outlined approximations for online attempts

- Engineering
  - Created the project repo on GitHub
  - Implemented a working probability curve prototype
  - Includes adjustable parameters: alphabet size, length, guesses/sec
  - Added hash presets scaffolding

- Content
  - Collected key references: RFC 9106 (Argon2), bcrypt paper, rainbow vs. salt explainer notes

- Demo Assets
  - Captured early screenshots of the curve and parameter controls
