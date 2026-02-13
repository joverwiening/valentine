import os
import time
from io import BytesIO 
from google import genai
from google.genai import types
from PIL import Image
from pathlib import Path

# ------------------------------------------------------------------
# CONFIGURATION
# ------------------------------------------------------------------
# Get your API key from https://aistudio.google.com/
API_KEY = os.getenv("GEMINI_API_KEY") 

# Output directory for images
OUTPUT_DIR = Path("assets/tiles")

# Model Name from your snippet
MODEL_NAME = "gemini-2.5-flash-image" 

# Image Style - Change this to match your girlfriend's taste!
STYLE_PROMPT = (
    "Strictly top-down 2D floorplan view (90 degree angle), like DND maps. "
    "Cozy wooden aesthetic, pastel colors, flat vector art. "
    "No isometric perspective, no 3D walls, completely flat, top down. "
    "Fill out the whole image, no white borders or margins. "
)

# Tile Definitions
TILES = [
    {"name": "living_room", "desc": "A cozy living room with a fireplace and rug"},
    {"name": "kitchen", "desc": "A cute rustic kitchen"},
    {"name": "bedroom", "desc": "A bedroom with a comfy green bed."},
    {"name": "children_room", "desc": "A playful children's room with toys and small beds"},
    {"name": "reading_room", "desc": "A reading room with a cozy armchair with a stack of books and a lamp"},
    {"name": "library", "desc": "A library with bookshelves filled with colorful books"},
    {"name": "office", "desc": "An office with wooden desk with a vintage typewriter and plants"},
    {"name": "guest_room", "desc": "A guest room bed with fresh flowers"},
    {"name": "music_room", "desc": "A music room with a drum set and a marimbaphone and a piano"},
    {"name": "storage", "desc": "A storage room"},
    {"name": "food_storage", "desc": "A food storage room"},
    {"name": "art_room", "desc": "An art room with an easel with a canvas and messy paint palettes"},
    {"name": "pottery_room", "desc": "A room for pottery with a furnace, a pottery wheel, and clay vases on shelves"},
    {"name": "tree", "desc": "A fluffy green oak tree on some grass"},
    {"name": "playground", "desc": "A playground with a slide and a sandbox on grass"},
    {"name": "swing", "desc": "A tree with a swing hanging from it and grass below"},
    {"name": "tree_cabin", "desc": "A small cute wooden cabin up in a tree on grass"},
    {"name": "pond", "desc": "A small blue pond with a lily pad and a duck and frogs"},
    {"name": "grass_bees", "desc": "Green grass with bee hives"},
    {"name": "flower_field", "desc": "A meadow full of colorful wild flowers"},
    {"name": "veg_garden", "desc": "A vegetable garden with grass around"},
    {"name": "herb_garden", "desc": "A herb garden with grass around"},
    {"name": "start", "desc": "A stone fireplace room with a rug"},
]

# ------------------------------------------------------------------
# SCRIPT
# ------------------------------------------------------------------

def generate_assets():
    if not API_KEY:
        print("❌ Error: GEMINI_API_KEY environment variable not set.")
        return

    # Initialize Client
    client = genai.Client(api_key=API_KEY)
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"🎨 Starting generation for {len(TILES)} tiles using {MODEL_NAME}...")

    for tile in TILES:
        filename = f"{tile['name']}.png"
        filepath = OUTPUT_DIR / filename
        
        if filepath.exists():
            print(f"⏩ Skipping {tile['name']} (already exists)")
            continue

        full_prompt = f"{STYLE_PROMPT}. Specific subject: {tile['desc']}"
        print(f"🖌️  Generating {tile['name']}...")
        
        try:
            # Using exactly the pattern you provided
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=[full_prompt],
            )

            image_saved = False
            
            # Adapted from your snippet: check parts for inline_data
            if response.parts:
                for part in response.parts:
                    if part.inline_data:
                        image = Image.open(BytesIO(part.inline_data.data))
                        
                        # Resize for efficiency
                        size = (256, 256)
                        image = image.resize(size)

                        # Save directly as Square
                        image.save(filepath)
                        image_saved = True
                        print(f"✅ Saved {filename} (Square)")
            
            if not image_saved:
                 print(f"⚠️ No image found in response for {tile['name']}")

            # Rate limit pause
            time.sleep(2) 
            
        except Exception as e:
            print(f"❌ Failed to generate {tile['name']}: {e}")

    print("\n✨ All done!")

if __name__ == "__main__":
    generate_assets()
