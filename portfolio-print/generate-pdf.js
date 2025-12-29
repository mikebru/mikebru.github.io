#!/usr/bin/env node

/**
 * Generate Print Portfolio PDF
 * 
 * This script converts a project HTML page into a two-page landscape PDF
 * optimized for printing and portfolios.
 * 
 * Usage: node generate-pdf.js <project-html-file>
 * Example: node generate-pdf.js ../projects/longFall.html
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('❌ Error: Please provide a project HTML file path');
    console.log('\nUsage: node generate-pdf.js <project-html-file>');
    console.log('Example: node generate-pdf.js ../projects/longFall.html');
    process.exit(1);
}

const projectFilePath = args[0];

// Check if file exists
if (!fs.existsSync(projectFilePath)) {
    console.error(`❌ Error: File not found: ${projectFilePath}`);
    process.exit(1);
}

console.log(`\n📄 Generating PDF for: ${projectFilePath}\n`);

async function generatePDF() {
    try {
        // Step 1: Generate HTML layout
        console.log('🔍 Step 1: Generating HTML layout...');
        await execAsync(`node generate-print-layout.js "${projectFilePath}"`);
        
        // Step 2: Get the generated HTML file path
        const projectFileName = path.basename(projectFilePath, '.html');
        const htmlPath = path.join(__dirname, 'output', `${projectFileName}-print.html`);
        const pdfPath = path.join(__dirname, 'output', `${projectFileName}-portfolio.pdf`);
        
        // Step 3: Check if Puppeteer is available
        console.log('\n📦 Step 2: Checking for PDF generation tools...');
        
        let puppeteerAvailable = false;
        try {
            require.resolve('puppeteer');
            puppeteerAvailable = true;
        } catch (e) {
            puppeteerAvailable = false;
        }
        
        if (puppeteerAvailable) {
            console.log('✓ Using Puppeteer for PDF generation...');
            const puppeteer = require('puppeteer');
            
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            
            const page = await browser.newPage();
            
            // Set a reasonable timeout
            page.setDefaultNavigationTimeout(30000);
            
            // Load the page
            await page.goto(`file://${htmlPath}`, {
                waitUntil: 'networkidle2', // Changed from networkidle0 for faster load
                timeout: 30000
            });
            
            // Wait for images and fonts to load completely
            await page.evaluate(() => {
                return Promise.all([
                    // Wait for images
                    ...Array.from(document.images)
                        .filter(img => !img.complete)
                        .map(img => new Promise(resolve => {
                            img.onload = img.onerror = resolve;
                        })),
                    // Wait for fonts to load
                    document.fonts.ready
                ]);
            });
            
            // Add a small delay to ensure fonts are fully rendered
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Generate optimized PDF with Adobe compatibility
            await page.pdf({
                path: pdfPath,
                format: 'Letter',
                landscape: true,
                printBackground: true,
                preferCSSPageSize: false,
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                displayHeaderFooter: false,
                omitBackground: false,
                // Adobe compatibility settings
                tagged: true, // Create tagged PDF for better accessibility and editability
                outline: false,
                // Add PDF metadata
                metadata: {
                    title: projectFileName,
                    author: 'Michael Bruner',
                    subject: 'Portfolio Project',
                    creator: 'Portfolio Print System',
                    producer: 'Puppeteer PDF Generator'
                }
            });
            
            await browser.close();
            
            // Get file size for feedback
            const stats = require('fs').statSync(pdfPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            
            console.log(`\n✅ Success! PDF generated:`);
            console.log(`   ${pdfPath}`);
            console.log(`   Size: ${fileSizeMB} MB\n`);
            
        } else {
            // Fallback: Use Chrome/Chromium via command line with proper landscape settings
            console.log('⚠️  Puppeteer not installed. Attempting to use system Chrome...');
            
            const fileUrl = `file://${htmlPath}`;
            
            // Try different Chrome/Chromium paths
            const chromePaths = [
                '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                '/Applications/Chromium.app/Contents/MacOS/Chromium',
                'google-chrome',
                'chromium',
                'chromium-browser'
            ];
            
            let chromeFound = false;
            for (const chromePath of chromePaths) {
                try {
                    // Use --print-to-pdf-no-header and proper paper size
                    const cmd = `"${chromePath}" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" --print-to-pdf-no-header "${fileUrl}"`;
                    await execAsync(cmd);
                    chromeFound = true;
                    console.log(`\n✅ Success! PDF generated:`);
                    console.log(`   ${pdfPath}`);
                    console.log(`\n⚠️  Note: Chrome CLI doesn't support landscape orientation.`);
                    console.log(`   For proper landscape PDFs, install Puppeteer:`);
                    console.log(`   npm install puppeteer\n`);
                    break;
                } catch (e) {
                    continue;
                }
            }
            
            if (!chromeFound) {
                console.log('\n⚠️  Automated PDF generation not available.');
                console.log('📖 Manual steps to create PDF:');
                console.log(`   1. Open: ${htmlPath}`);
                console.log(`   2. Press Cmd+P (Mac) or Ctrl+P (Windows/Linux)`);
                console.log(`   3. Set orientation to "Landscape"`);
                console.log(`   4. Enable "Background graphics"`);
                console.log(`   5. Save as: ${pdfPath}\n`);
                console.log('💡 Tip: Install Puppeteer for automatic PDF generation:');
                console.log('   npm install puppeteer\n');
            }
        }
        
    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        process.exit(1);
    }
}

generatePDF();
