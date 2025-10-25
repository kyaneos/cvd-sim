# CVD Testing Framework

A modern web application for testing color vision deficiency (CVD) using adaptive Bayesian inference and multi-stage calibration.

## Features

### User Features
- **9 CVD Types Supported**: deuteranomaly, protanomaly, tritanomaly, deuteranopia, protanopia, tritanopia, achromatomaly, achromatopsia, normal vision
- **Multi-Stage Calibration**: Tests all confusion points per CVD type (2-5 stages)
- **Adaptive Testing**: Bayesian inference with information gain optimization
- **Severity Inference**: Auto-estimates severity after 50+ tests
- **Results Dashboard**: Complete test history with color visualization
- **Image Converter**: Transform images based on your color map
- **Manual Settings**: Override severity with known diagnosis values

### Developer Features
- **Bayesian Adaptive Engine**: Beta distributions with entropy-based selection
- **Simulation-Based Testing**: Uses `color-blind` library for research-backed priors
- **Hotspot Detection**: Dynamically focuses on problem areas after 30+ tests
- **Progressive Fallback**: 3-attempt strategy reduces random fallbacks to <2%
- **PocketBase Backend**: User auth + data persistence
- **Modern Stack**: Svelte 5 + SvelteKit + TailwindCSS 4

## Tech Stack

- **Frontend**: Svelte 5 (runes syntax), SvelteKit
- **Styling**: TailwindCSS 4, DaisyUI, Tailwind Typography
- **Backend**: PocketBase
- **Testing**: Bayesian inference with `color-blind` npm library
- **Build**: Vite

## Getting Started

### Prerequisites
- Node.js 18+
- PocketBase instance

### Installation

```bash
# Install dependencies
npm install

# Configure PocketBase
# Update src/lib/pocketbase.js with your PocketBase URL

# Run development server
npm run dev
```

### PocketBase Setup

See [POCKETBASE_SCHEMA.md](POCKETBASE_SCHEMA.md) for complete schema documentation.

Required collections:
- `colorvision_users` - User profiles with CVD type and severity
- `colorvision_tests` - Individual test results
- `colorvision_settings` - User settings and Bayesian state

## Project Structure

```
src/
├── lib/
│   └── framework/           # Core framework code
│       ├── api/             # PocketBase API calls
│       ├── auth/            # Authentication
│       ├── colorTesting/    # Testing algorithms ⭐
│       ├── components/      # Reusable components
│       ├── stores/          # Svelte stores
│       └── styles/          # Framework CSS
├── routes/                  # SvelteKit routes
│   ├── auth/               # Login/register
│   └── dashboard/          # Main app
│       ├── test/           # Testing interface
│       ├── results/        # Test history
│       ├── settings/       # User settings
│       ├── converter/      # Image converter
│       └── hex/            # Manual hex navigation
└── ...
```

## Key Components

### Multi-Stage Calibration
Tests all confusion points per CVD type:
- Deuteranomaly: 5 stages (reds/greens, blue-greens/grays, pinks/grays, purples/blues, browns/oranges)
- Achromatopsia: 2 stages (grayscale, brightness)
- Others: 4-5 stages each

### Bayesian Adaptive Testing
- Starts with simulation-based priors
- Updates beliefs based on user responses
- Selects next test using information gain
- Balances exploration (30%) vs exploitation (70%)

### Severity Inference
- Requires 50+ tests for accuracy
- Compares observed vs expected confusion
- Updates every 10 tests automatically
- Saves to user profile

### Hotspot Detection
- Identifies high-confusion color regions
- Dynamically adapts test selection
- Activates after 30+ tests

## Development

```bash
# Run linter
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing Workflow

1. User registers with CVD type
2. **Optional**: Multi-stage severity calibration (or manual entry)
3. Adaptive testing begins
4. System learns user's confusion patterns
5. After 50+ tests, severity auto-refines
6. Results dashboard shows test history and statistics

## Documentation

- [POCKETBASE_SCHEMA.md](POCKETBASE_SCHEMA.md) - Database schema
- [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md) - Complete development history

## License

[Your License Here]

## Credits

Built with research-backed color vision science and adaptive testing algorithms.

## Contributing

[Your contribution guidelines]
