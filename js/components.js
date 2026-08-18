/**
 * Helper to load HTML components into the page
 */
async function loadComponent(elementId, filePath, callback) {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Could not fetch ${filePath}`);
        const html = await response.text();
        element.outerHTML = html; // Replace placeholder with content
        if (callback) callback();
    } catch (error) {
        console.error('Error loading component:', error);
    }
}

// Load components
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('header-placeholder', 'header.html', () => {
        if (typeof initNav === 'function') initNav();
        if (typeof setActiveNav === 'function') setActiveNav();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });
    loadComponent('footer-placeholder', 'footer.html');
});
