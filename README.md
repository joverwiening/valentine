# Our Valentine's Forest

A lightweight, cozy tile-placement game built with HTML5 Canvas, inspired by Dorfromantik.

## Features
- **Tile Placement**: Drag and drop hexagonal tiles to build a unique world.
- **Progressive Reveal**: Start with a Hearth tile and unlock more as you grow the forest.
- **Finale**: Place 15 tiles to reveal a special question.

## How to Run Locally
1. Ensure you have Python installed.
2. Run the provided VS Code task "Serve Game" or run manually:
   ```bash
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` in your browser.

## Customization
- **Photos**: Edit the `photos` array in `script.js` to add your own memories.
- **Tiles**: Add new tile types in the `tileTypes` array in `script.js`.
- **Aesthetics**: Modify colors and fonts in `style.css`.

## Deployment
To host on GitHub Pages:
1. Push this repository to GitHub.
2. Go to Repository Settings -> Pages.
3. Select the `main` branch as the source.
4. Your game will be live at `https://<username>.github.io/<repo-name>/`.
