# Portfolio Print Layout Generator

A tool to convert project HTML pages into professionally formatted two-page landscape PDFs optimized for printed portfolios.

## Overview

This system automatically extracts content from your project HTML pages and generates a beautifully formatted two-page landscape layout (11" x 8.5") suitable for printing or PDF export. The layout maintains your dark theme aesthetic and presents your work in a professional portfolio format.

## Features

- **Two-Page Layout**: 
  - Page 1: Hero image, project overview, and key metadata
  - Page 2: Project gallery with up to 9 images
- **Landscape Orientation**: Optimized for 11" x 8.5" printing
- **Print-Ready**: Proper page breaks, colors, and scaling
- **Automatic Extraction**: Pulls content directly from existing project pages
- **Dark Theme**: Maintains professional dark aesthetic
- **PDF Export**: Easy conversion to PDF for digital portfolios

## Directory Structure

```
portfolio-print/
├── README.md                    # This file
├── generate-print-layout.js     # Main script
├── print-template.html          # HTML template
├── print-styles.css             # Print-optimized styles
└── output/                      # Generated print layouts
    └── longFall-print.html      # Example output
```

## Installation

No installation required! The script uses Node.js built-in modules only.

**Requirements:**
- Node.js (v12 or higher)

## Usage

### Basic Usage

```bash
cd portfolio-print
node generate-print-layout.js <path-to-project-html>
```

### Example

Generate print layout for the Long Fall project:

```bash
node generate-print-layout.js ../projects/longFall.html
```

### Output

The script will:
1. Extract all project information from the HTML file
2. Generate a print-ready HTML file in the `output/` directory
3. Display instructions for viewing and printing

Example output:
```
📄 Processing: ../projects/longFall.html

🔍 Extracting project information...
   Title: The Long Fall
   Subtitle: Ars Electronica | 2025
   Hero Image: ../Images/LongFall/Ars electronica jiabao li 14.jpg
   Gallery Images: 9 found

🎨 Generating print layout...

✅ Success! Print layout generated:
   /Users/.../portfolio-print/output/longFall-print.html
```

## Viewing and Printing

### Preview in Browser

1. Open the generated HTML file in any web browser
2. The layout displays as two pages with proper spacing

### Print to PDF

1. Open the generated file in a web browser
2. Press **Cmd+P** (Mac) or **Ctrl+P** (Windows/Linux)
3. Configure print settings:
   - **Orientation**: Landscape
   - **Paper Size**: Letter (11" x 8.5")
   - **Background Graphics**: Enabled (important for colors!)
   - **Margins**: Default or custom
4. Select "Save as PDF" as the destination
5. Click Save

### Print to Paper

Follow the same steps above, but select your printer instead of "Save as PDF".

## Layout Details

### Page 1: Project Overview

- **Header**: Your name with decorative line
- **Hero Section**: Large hero image with project title overlay
- **Description**: Multi-paragraph project description
- **Metadata Panels**: 
  - Role
  - Technologies
  - Duration
  - Collaborators
- **Footer**: Project title and page number

### Page 2: Project Gallery

- **Header**: Your name with decorative line
- **Gallery**: 3x3 grid of project images (up to 9 images)
- **Footer**: Project title and page number

## Extracted Content

The script automatically extracts:

- ✅ Project title (from `<h1>`)
- ✅ Project subtitle (from `.project-subtitle`)
- ✅ Hero image (from `.project-hero-image` background)
- ✅ Project description (from `.project-description`)
- ✅ Role metadata
- ✅ Technologies used
- ✅ Project duration
- ✅ Collaborators
- ✅ Gallery images (first 9 images)
- ✅ Video thumbnails (displayed with play button overlay)

## Customization

### Modify Template

Edit `print-template.html` to change:
- Page structure
- Content layout
- Header/footer format

### Modify Styles

Edit `print-styles.css` to customize:
- Colors and typography
- Spacing and dimensions
- Print-specific styles
- Gallery grid layout

### Change Portfolio Name

In `print-template.html`, find and replace:
```html
<h1 class="portfolio-name">Michael Bruner</h1>
```

## Batch Processing

Generate layouts for multiple projects:

```bash
# Create a simple batch script
for project in projects/*.html; do
    node generate-print-layout.js "../$project"
done
```

Or create a Node.js batch script:

```javascript
const fs = require('fs');
const { execSync } = require('child_process');

const projectsDir = '../projects';
const projects = fs.readdirSync(projectsDir)
    .filter(f => f.endsWith('.html'));

projects.forEach(project => {
    console.log(`\nProcessing ${project}...`);
    execSync(`node generate-print-layout.js ${projectsDir}/${project}`, 
        { stdio: 'inherit' });
});
```

## Tips for Best Results

1. **High-Quality Images**: Use high-resolution images for better print quality
2. **Test Print**: Always do a test print to check colors and layout
3. **Background Graphics**: Make sure to enable background graphics in print settings
4. **Color Profiles**: Use "RGB Color" profile for accurate dark theme colors
5. **Paper Quality**: Use premium paper stock for professional results
6. **Review Content**: Check that all extracted content is accurate before printing

## Troubleshooting

### Hero Image Not Showing
- Check that the `.project-hero-image` class has a background-image style
- Verify the image path is correct relative to the output folder
- Ensure the image file exists

### Gallery Images Missing
- Verify images use the `.gallery-item.image` class structure
- Check that image paths are correct
- Script limits gallery to 9 images (first 9 found)

### Colors Not Printing
- Enable "Background graphics" in print settings
- Check your printer supports color printing
- Try "Print using system dialog" option

### Layout Issues
- Verify you're using landscape orientation
- Check page size is set to Letter (11" x 8.5")
- Clear browser cache and reload

## Technical Details

### Print Specifications

- **Page Size**: 11" × 8.5" (US Letter landscape)
- **Color Mode**: Dark theme (#1a1a1a background)
- **Typography**: Montserrat font family
- **Page Breaks**: Automatic between pages
- **Resolution**: Screen and print optimized

### Browser Compatibility

Tested and working in:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Future Enhancements

Potential improvements:
- [ ] Support for 3+ page layouts
- [ ] Configurable gallery grid sizes
- [ ] Custom color themes
- [ ] Additional metadata fields
- [ ] Multiple template options
- [ ] Interactive PDF with links
- [ ] Automated batch processing script

## Examples

See `output/longFall-print.html` for a complete example generated from the Long Fall project.

## Support

For issues or questions:
1. Check this README for troubleshooting tips
2. Verify your project HTML follows the standard structure
3. Review the example output for reference
4. Modify the script's extraction functions as needed for custom layouts

## License

Part of the Website-Portfolio project. Use freely for your portfolio needs.

---

**Last Updated**: December 2025  
**Version**: 1.0.0
