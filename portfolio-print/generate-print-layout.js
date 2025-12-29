#!/usr/bin/env node

/**
 * Generate Print Portfolio Layout
 * 
 * This script converts a project HTML page into a two-page landscape
 * layout optimized for printing and PDF export.
 * 
 * Usage: node generate-print-layout.js <project-html-file>
 * Example: node generate-print-layout.js ../projects/longFall.html
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('❌ Error: Please provide a project HTML file path');
    console.log('\nUsage: node generate-print-layout.js <project-html-file>');
    console.log('Example: node generate-print-layout.js ../projects/longFall.html');
    process.exit(1);
}

const projectFilePath = args[0];

// Check if file exists
if (!fs.existsSync(projectFilePath)) {
    console.error(`❌ Error: File not found: ${projectFilePath}`);
    process.exit(1);
}

console.log(`\n📄 Processing: ${projectFilePath}\n`);

// Read the project HTML file
const projectHTML = fs.readFileSync(projectFilePath, 'utf-8');

// Read the template
const templatePath = path.join(__dirname, 'print-template.html');
const template = fs.readFileSync(templatePath, 'utf-8');

/**
 * Extract text content from HTML element
 */
function extractText(html, pattern) {
    const match = html.match(pattern);
    if (match && match[1]) {
        return match[1].trim();
    }
    return '';
}

/**
 * Extract hero image URL from the project
 */
function extractHeroImage(html) {
    // Look for background-image in style tag or inline style
    const bgImageMatch = html.match(/\.project-hero-image\s*\{[^}]*background-image:\s*url\(['"]?([^'")]+)['"]?\)/s);
    if (bgImageMatch && bgImageMatch[1]) {
        // Handle escaped spaces in path and clean up
        return bgImageMatch[1].replace(/\\/g, '').trim();
    }
    return '../Images/video-placeholder.jpg'; // fallback
}

/**
 * Extract project title
 */
function extractTitle(html) {
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/s);
    if (h1Match) {
        return h1Match[1].trim();
    }
    return 'Project Title';
}

/**
 * Extract project subtitle
 */
function extractSubtitle(html) {
    const subtitleMatch = html.match(/<p\s+class="project-subtitle"[^>]*>(.*?)<\/p>/s);
    if (subtitleMatch) {
        return subtitleMatch[1].trim();
    }
    return '';
}

/**
 * Extract project description
 */
function extractDescription(html) {
    const descMatch = html.match(/<div\s+class="project-description"[^>]*>(.*?)<\/div>/s);
    if (descMatch) {
        // Extract all <p> tags within the description
        const pTags = descMatch[1].match(/<p>(.*?)<\/p>/gs);
        if (pTags) {
            // Skip the h2 tag and join paragraphs
            return pTags.map(p => p.trim()).join('\n');
        }
    }
    return '<p>Project description not available.</p>';
}

/**
 * Extract metadata field
 */
function extractMetadataField(html, fieldName) {
    const regex = new RegExp(`<h3>${fieldName}</h3>\\s*<p[^>]*>(.*?)</p>`, 's');
    const match = html.match(regex);
    if (match && match[1]) {
        return match[1].trim();
    }
    return 'N/A';
}

/**
 * Extract gallery images (skip videos)
 */
function extractGalleryImages(html) {
    const galleryMatch = html.match(/<section\s+class="project-gallery"[^>]*>[\s\S]*?<div\s+class="gallery-grid"[^>]*>([\s\S]*?)<\/div>\s*<\/section>/);
    if (!galleryMatch) {
        return '';
    }

    const galleryContent = galleryMatch[1];
    const images = [];

    // Only extract regular images - skip videos, capture src and alt
    const imgRegex = /<div\s+class="gallery-item\s+image"[^>]*>[\s\S]*?<img\s+src="([^"]+)"\s+alt="([^"]*)"[^>]*>/g;
    let match;
    while ((match = imgRegex.exec(galleryContent)) !== null) {
        images.push({
            type: 'image',
            src: match[1],
            alt: match[2] || 'Project image'
        });
    }

    // Limit to 4 images for the gallery grid (2x2)
    const limitedImages = images.slice(0, 4);

    // Generate HTML for gallery items with alt text caption
    return limitedImages.map(img => {
        return `                <div class="gallery-item">
                    <img src="${img.src}" alt="${img.alt}">
                    <div class="gallery-caption">${img.alt}</div>
                </div>`;
    }).join('\n');
}

// Extract all project information
console.log('🔍 Extracting project information...');
const projectTitle = extractTitle(projectHTML);
const projectSubtitle = extractSubtitle(projectHTML);
const heroImage = extractHeroImage(projectHTML);
const description = extractDescription(projectHTML);
const role = extractMetadataField(projectHTML, 'Role');
const technologies = extractMetadataField(projectHTML, 'Technologies');
const duration = extractMetadataField(projectHTML, 'Duration');
const collaborators = extractMetadataField(projectHTML, 'Collaborators');
const galleryImages = extractGalleryImages(projectHTML);

console.log(`   Title: ${projectTitle}`);
console.log(`   Subtitle: ${projectSubtitle}`);
console.log(`   Hero Image: ${heroImage}`);
console.log(`   Gallery Images: ${galleryImages.split('\n').filter(l => l.includes('gallery-item')).length} found`);

// Fix image paths for output directory (output is nested in portfolio-print)
// Convert relative paths from ../Images to ../../Images
const fixedHeroImage = heroImage.replace(/^\.\.\/Images/, '../../Images');
const fixedGalleryImages = galleryImages.replace(/\.\.\//g, '../../');

// Replace placeholders in template
console.log('\n🎨 Generating print layout...');
let output = template;
output = output.replace(/\{\{PROJECT_TITLE\}\}/g, projectTitle);
output = output.replace(/\{\{PROJECT_SUBTITLE\}\}/g, projectSubtitle);
output = output.replace(/\{\{HERO_IMAGE\}\}/g, fixedHeroImage);
output = output.replace(/\{\{PROJECT_DESCRIPTION\}\}/g, description);
output = output.replace(/\{\{PROJECT_ROLE\}\}/g, role);
output = output.replace(/\{\{PROJECT_TECH\}\}/g, technologies);
output = output.replace(/\{\{PROJECT_DURATION\}\}/g, duration);
output = output.replace(/\{\{PROJECT_COLLABORATORS\}\}/g, collaborators);
output = output.replace(/\{\{GALLERY_IMAGES\}\}/g, fixedGalleryImages);

// Generate output filename
const projectFileName = path.basename(projectFilePath, '.html');
const outputFileName = `${projectFileName}-print.html`;
const outputPath = path.join(__dirname, 'output', outputFileName);

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Write output file
fs.writeFileSync(outputPath, output);

console.log(`\n✅ Success! Print layout generated:`);
console.log(`   ${outputPath}`);
console.log('\n📖 To view and print:');
console.log(`   1. Open the file in a web browser`);
console.log(`   2. Press Cmd+P (Mac) or Ctrl+P (Windows/Linux)`);
console.log(`   3. Set orientation to "Landscape"`);
console.log(`   4. Enable "Background graphics" in print settings`);
console.log(`   5. Save as PDF or print directly\n`);
