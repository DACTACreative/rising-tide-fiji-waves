
# Audio Files for Sea Level Rise Visualization

Place your audio files in this directory with the following naming convention:

## Required Files:
- `fiji_1_5.mp3` - Audio narrative for 1.5°C warming scenario
- `fiji_2_5.mp3` - Audio narrative for 2.5°C warming scenario  
- `fiji_5.mp3` - Audio narrative for 5°C warming scenario

## File Format:
- **Format**: MP3 or WAV
- **Duration**: Recommended 30-60 seconds
- **Quality**: 128kbps minimum for web playback
- **Content**: Climate impact narrative, ambient ocean sounds, or data sonification

## For Other Countries:
To adapt this app for other Pacific nations, simply:
1. Replace the JSON data file in `/public/data/`
2. Update audio files with country-specific names (e.g., `tuvalu_1_5.mp3`)
3. The app will automatically load the new data and audio references

## Audio Creation Tips:
- Use TwoTone.io for data sonification
- Add ambient ocean/wave sounds for atmosphere  
- Include voice narration explaining climate impacts
- Sync audio duration with animation timeline for best effect

## Current Status:
⚠️ **Audio files not included** - Add your own audio files following the naming convention above.
The app will gracefully handle missing audio files and provide synthetic tones as fallback.
