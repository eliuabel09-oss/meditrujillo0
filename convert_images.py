import os
from PIL import Image
import pillow_avif

images_dir = 'public/images'
files = ['doctor_f_01.avif', 'doctor_f_02.jpg', 'doctor_m_01.jpg', 'doctor_m_02.jpg']

for f in files:
    filepath = os.path.join(images_dir, f)
    if os.path.exists(filepath):
        print(f"Converting {f}...")
        img = Image.open(filepath)
        out_name = os.path.splitext(f)[0] + '.webp'
        out_path = os.path.join(images_dir, out_name)
        img.save(out_path, 'webp')
        print(f"Saved {out_name}")
        
print("Done")
