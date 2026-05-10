const puppeteer = require('puppeteer');

/**
 * Generates a PDF buffer from an HTML string using Puppeteer.
 * This is used for generating professional ATS and Career reports.
 */
const generatePDFFromHTML = async (htmlContent) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Emulate a screen to ensure media queries for screens trigger
        await page.emulateMediaType('screen');
        
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });
        
        return pdfBuffer;
    } catch (error) {
        console.error('Error generating PDF with Puppeteer:', error);
        throw new Error('Failed to generate PDF report');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

/**
 * Creates an HTML template for the ATS analysis report.
 */
const createReportTemplate = (analysisData) => {
    // Generate a sleek modern report using Tailwind classes injected into the head
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <title>SkillSync Analysis Report</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
            .page-break { page-break-before: always; }
        </style>
    </head>
    <body class="bg-gray-50 text-gray-800 p-8">
        <div class="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                <h1 class="text-4xl font-bold mb-2">SkillSync AI Report</h1>
                <p class="text-blue-100 text-lg">Comprehensive ATS & Career Analysis</p>
            </div>

            <div class="p-8">
                <!-- Score Section -->
                <div class="flex items-center justify-between bg-gray-50 p-6 rounded-xl mb-8 border border-gray-100">
                    <div>
                        <h2 class="text-xl font-semibold text-gray-700">Overall ATS Score</h2>
                        <p class="text-sm text-gray-500">Based on semantic matching and skill alignment</p>
                    </div>
                    <div class="relative w-24 h-24 flex items-center justify-center">
                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                            <path class="text-gray-200" stroke-width="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path class="text-blue-600" stroke-width="3" stroke-dasharray="${analysisData.ats_score}, 100" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span class="absolute text-2xl font-bold text-blue-700">${analysisData.ats_score}</span>
                    </div>
                </div>

                <!-- Missing Skills -->
                <div class="mb-8">
                    <h3 class="text-lg font-bold border-b pb-2 mb-4 text-red-600">Missing Key Skills</h3>
                    <div class="flex flex-wrap gap-2">
                        ${analysisData.missing_skills?.map(skill => `<span class="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium border border-red-100">${skill}</span>`).join('') || '<p>No missing skills detected.</p>'}
                    </div>
                </div>

                <!-- Strengths -->
                <div class="mb-8">
                    <h3 class="text-lg font-bold border-b pb-2 mb-4 text-green-600">Strengths & Matched Skills</h3>
                    <div class="flex flex-wrap gap-2">
                        ${analysisData.strengths?.map(skill => `<span class="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-100">${skill}</span>`).join('') || '<p>No strengths extracted.</p>'}
                    </div>
                </div>

                <!-- AI Feedback -->
                <div class="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                    <h3 class="text-lg font-bold text-blue-900 mb-3">AI Expert Feedback</h3>
                    <div class="text-gray-700 whitespace-pre-wrap leading-relaxed">${analysisData.feedback}</div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    generatePDFFromHTML,
    createReportTemplate
};
