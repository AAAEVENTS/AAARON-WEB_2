# Image generation scripts

The hero and scene images in `public/assets/img/` are procedurally rendered (noise + simple optics) so they are
original to AAARON and carry no third-party photo licensing. To re-render or tweak them:

    pip install numpy scipy opencv-python pillow
    python3 scene_hero.py 2400 out/hero-water-beading.webp     # water beading on concrete (hero)
    python3 scenes.py 1600 out                                  # tank, floor, repair, roof, steel, metallic

Edit colours, droplet counts or crack paths inside the scripts and re-run. Output WebP files can be dropped
straight into `public/assets/img/` (the site expects `scene-*.webp`, so rename `tank.webp` -> `scene-tank.webp`, etc.).
