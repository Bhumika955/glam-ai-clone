# Session 5 — Background Removal Page

---

## Prompt
I want to add a background removal feature to my Glam AI clone. 
It should use the Remove.bg API. The page should have image upload, 
a one-tap remove background button, before/after side by side preview, 
option to replace background with a solid color or custom image, 
and export the final result. Use Next.js 14, Tailwind CSS, dark theme.

## Response
Created src/app/background/page.js with the following architecture:

State management:
- image: base64 original image string
- imageFile: File object for API upload
- resultImage: blob URL from Remove.bg API response
- loading: boolean for API call state
- activeTab: "replace" (color) or "image" (custom bg)
- bgColor: hex color string, default #FFD700
- bgImage: base64 custom background image

Key implementation decisions:
- Used FormData to send image_file to Remove.bg API
- API key stored in NEXT_PUBLIC_REMOVEBG_API_KEY env variable
- Response blob converted to object URL for preview
- Side-by-side before/after layout using grid grid-cols-2
- Auto-switched to replace tab after successful removal

---

## Prompt
After background is removed, I want users to be able to replace 
it with either a solid color or a custom uploaded image. 
The color picker should have 8 preset colors plus a custom 
HTML color input. The image background should support uploading 
any photo from device.

## Response
Added two-tab replacement system:

Color BG tab:
- 8 preset colors: gold, pink, purple, blue, green, red, black, white
- Native HTML color input for custom color selection
- bgColor state updates preview in real time via inline style

Image BG tab:
- Secondary file input with bgFileInputRef
- FileReader converts uploaded image to base64 for preview
- bgImage state stored as base64 string

---

## Prompt
The export/download is broken. When I select color background 
first, then switch to image background and download, it still 
downloads with the color background. It should use whichever 
tab is currently active when I click Export.

## Response
Found the bug: original condition was:
  if (bgImage && activeTab === "replace")
This was wrong — it checked bgImage existence instead of active tab.

Fixed condition to:
  if (activeTab === "image" && bgImage)

Now the export logic correctly uses activeTab as the source of 
truth. If activeTab is "image" and bgImage exists, draw image 
background first then subject on top. Otherwise fill canvas with 
bgColor then draw subject. This ensures export always matches 
what the user has selected.

Canvas export process:
1. Create offscreen canvas matching result image dimensions
2. Draw background (color fill OR image scaled to cover)
3. Draw removed-bg subject on top with object-contain behavior
4. Call canvas.toDataURL("image/png") for download and gallery save

---

## Prompt
The result preview is also not updating correctly when I switch 
between color BG and image BG tabs. If I select image BG it still 
shows color BG in the preview and vice versa. The preview should 
reflect the active tab in real time.

## Response
Fixed result preview rendering logic:

Before fix — preview always showed bgColor via style + bgImage 
conditionally, regardless of activeTab.

After fix:
- backgroundColor style only applied when activeTab !== "image"
- bgImage rendered as absolute positioned img ONLY when 
  activeTab === "image" && bgImage exists
- Subject img always on top as absolute positioned object-contain
- This makes preview reactive to tab switching in real time

JSX structure:
  <div style={{ backgroundColor: activeTab === "image" ? "transparent" : bgColor }}>
    {activeTab === "image" && bgImage && <img src={bgImage} ... />}
    <img src={resultImage} ... /> {/* subject always on top */}
  </div>

---

## Prompt
How should I connect the background removal page to the rest 
of the app? The home page feature card for Background AI currently 
links to /editor?tool=bg which is wrong.

## Response
Updated home page Background AI feature card href from:
  /editor?tool=bg
to:
  /background

This gives background removal its own dedicated route with full 
UI instead of being a sub-tool inside the editor. Also added 
background removal exports to glamai-gallery localStorage with 
filter label "BG Removed" so they appear correctly in gallery 
with proper categorization.   