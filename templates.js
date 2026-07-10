// ==========================================
// FlashCut - Template System
// ==========================================

const TemplateManager = (() => {
    let templates = [];
    let currentCategory = 'all';

    async function init() {
        await loadTemplates();
        renderTemplates();
        setupEventListeners();
    }

    async function loadTemplates() {
        try {
            const response = await fetch('templates.json');
            const data = await response.json();
            templates = data.templates || [];
            console.log(`Loaded ${templates.length} templates`);
        } catch (error) {
            console.error('Error loading templates:', error);
            // Use embedded defaults
            templates = getDefaultTemplates();
        }
    }

    function getDefaultTemplates() {
        return [
            {
                id: 't001',
                name: 'Quick Trending',
                category: 'trending',
                duration: 15,
                ratio: '9:16',
                thumbnail: '🔥',
                description: 'Fast-paced trend edit',
                clips: [
                    { startTime: 0, endTime: 5, effect: 'zoom-in', transition: 'fade', speed: 1 },
                    { startTime: 5, endTime: 10, effect: 'glitch', transition: 'flash', speed: 1.5 },
                    { startTime: 10, endTime: 15, effect: 'none', transition: 'fade', speed: 1 }
                ],
                texts: [
                    {
                        content: 'YOUR TEXT',
                        startTime: 0, endTime: 5,
                        x: 50, y: 30,
                        fontSize: 48, fontWeight: '900',
                        color: '#ffffff', animation: 'scale-in', style: 'bold'
                    }
                ],
                filters: { brightness: 10, contrast: 15, saturation: 20, filter: 'vivid' }
            },
            {
                id: 't002',
                name: 'Social Story',
                category: 'social',
                duration: 10,
                ratio: '9:16',
                thumbnail: '📱',
                description: 'Perfect for stories',
                clips: [
                    { startTime: 0, endTime: 5, effect: 'none', transition: 'dissolve', speed: 1 },
                    { startTime: 5, endTime: 10, effect: 'zoom-out', transition: 'fade', speed: 1 }
                ],
                texts: [
                    {
                        content: 'TAP HERE ↗',
                        startTime: 7, endTime: 10,
                        x: 50, y: 80,
                        fontSize: 24, fontWeight: '600',
                        color: '#00f5ff', animation: 'bounce', style: 'neon'
                    }
                ],
                filters: { brightness: 5, contrast: 0, saturation: 10, filter: 'warm' }
            }
        ];
    }

    function setupEventListeners() {
        // Category buttons
        document.querySelectorAll('#template-categories .cat-btn')
            .forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('#template-categories .cat-btn')
                        .forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentCategory = btn.dataset.category;
                    renderTemplates();
                });
            });

        // Search
        const searchInput = document.getElementById('template-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                renderTemplates(e.target.value);
            });
        }
    }

    function renderTemplates(searchQuery = '') {
        const grid = document.getElementById('template-grid');
        if (!grid) return;

        let filtered = templates;

        // Filter by category
        if (currentCategory !== 'all') {
            filtered = filtered.filter(t => t.category === currentCategory);
        }

        // Filter by search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.category.toLowerCase().includes(q)
            );
        }

        grid.innerHTML = filtered.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-preview">
                    <span>${template.thumbnail}</span>
                </div>
                <div class="template-info">
                    <div class="template-name">${template.name}</div>
                    <div class="template-duration">${template.duration}s • ${template.ratio}</div>
                </div>
                <button class="use-btn" onclick="TemplateManager.applyTemplate('${template.id}')">
                    Use
                </button>
            </div>
        `).join('');

        // Click handler for template cards
        grid.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('use-btn')) return;
                const id = card.dataset.templateId;
                previewTemplate(id);
            });
        });
    }

    function previewTemplate(templateId) {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        showToast(`Preview: ${template.name}`, 'info');
    }

    function applyTemplate(templateId) {
        const template = templates.find(t => t.id === templateId);
        if (!template) {
            showToast('Template not found', 'error');
            return;
        }

        // Confirm if there's existing content
        const hasContent = Object.values(Timeline.tracks)
            .some(track => track.length > 0);
        
        if (hasContent) {
            if (!confirm('This will replace your current edit. Continue?')) {
                return;
            }
        }

        // Clear existing timeline
        Timeline.clearAll();

        // Set aspect ratio
        const previewWrapper = document.getElementById('preview-wrapper');
        if (previewWrapper) {
            previewWrapper.dataset.ratio = template.ratio;
            document.querySelectorAll('.ratio-btn').forEach(btn => {
                btn.classList.toggle('active', 
                    btn.dataset.ratio === template.ratio);
            });
        }

        // Apply video clips
        if (template.clips) {
            template.clips.forEach((clip, index) => {
                Timeline.addClip('video', {
                    name: `Clip ${index + 1}`,
                    startTime: clip.startTime,
                    endTime: clip.endTime,
                    duration: clip.endTime - clip.startTime,
                    effect: clip.effect,
                    transition: clip.transition,
                    speed: clip.speed
                });
            });
        }

        // Apply text overlays
        if (template.texts) {
            template.texts.forEach(text => {
                Timeline.addClip('text', {
                    content: text.content,
                    startTime: text.startTime,
                    endTime: text.endTime,
                    duration: text.endTime - text.startTime,
                    x: text.x,
                    y: text.y,
                    fontSize: text.fontSize,
                    fontWeight: text.fontWeight,
                    color: text.color,
                    animation: text.animation,
                    style: text.style
                });
            });
        }

        // Apply filters
        if (template.filters) {
            applyFilters(template.filters);
        }

        showToast(`Template "${template.name}" applied!`, 'success');
    }

    function applyFilters(filters) {
        if (filters.brightness !== undefined) {
            const el = document.getElementById('adj-brightness');
            if (el) el.value = filters.brightness;
        }
        if (filters.contrast !== undefined) {
            const el = document.getElementById('adj-contrast');
            if (el) el.value = filters.contrast;
        }
        if (filters.saturation !== undefined) {
            const el = document.getElementById('adj-saturation');
            if (el) el.value = filters.saturation;
        }
        if (filters.filter) {
            document.querySelectorAll('.filter-item').forEach(item => {
                item.classList.toggle('active', 
                    item.dataset.filter === filters.filter);
            });
        }

        // Apply CSS filter to preview
        updatePreviewFilter();
    }

    function updatePreviewFilter() {
        const video = document.getElementById('preview-video');
        if (!video) return;

        const brightness = 100 + parseInt(
            document.getElementById('adj-brightness')?.value || 0);
        const contrast = 100 + parseInt(
            document.getElementById('adj-contrast')?.value || 0);
        const saturation = 100 + parseInt(
            document.getElementById('adj-saturation')?.value || 0);
        const hue = parseInt(
            document.getElementById('adj-hue')?.value || 0);
        const blur = parseInt(
            document.getElementById('adj-blur')?.value || 0);

        video.style.filter = `
            brightness(${brightness}%) 
            contrast(${contrast}%) 
            saturate(${saturation}%) 
            hue-rotate(${hue}deg) 
            blur(${blur}px)
        `;
    }

    return {
        init,
        loadTemplates,
        renderTemplates,
        applyTemplate,
        applyFilters,
        updatePreviewFilter,
        get templates() { return templates; }
    };
})();// ==========================================
// FlashCut - Template System
// ==========================================

const TemplateManager = (() => {
    let templates = [];
    let currentCategory = 'all';

    async function init() {
        await loadTemplates();
        renderTemplates();
        setupEventListeners();
    }

    async function loadTemplates() {
        try {
            const response = await fetch('templates.json');
            const data = await response.json();
            templates = data.templates || [];
            console.log(`Loaded ${templates.length} templates`);
        } catch (error) {
            console.error('Error loading templates:', error);
            // Use embedded defaults
            templates = getDefaultTemplates();
        }
    }

    function getDefaultTemplates() {
        return [
            {
                id: 't001',
                name: 'Quick Trending',
                category: 'trending',
                duration: 15,
                ratio: '9:16',
                thumbnail: '🔥',
                description: 'Fast-paced trend edit',
                clips: [
                    { startTime: 0, endTime: 5, effect: 'zoom-in', transition: 'fade', speed: 1 },
                    { startTime: 5, endTime: 10, effect: 'glitch', transition: 'flash', speed: 1.5 },
                    { startTime: 10, endTime: 15, effect: 'none', transition: 'fade', speed: 1 }
                ],
                texts: [
                    {
                        content: 'YOUR TEXT',
                        startTime: 0, endTime: 5,
                        x: 50, y: 30,
                        fontSize: 48, fontWeight: '900',
                        color: '#ffffff', animation: 'scale-in', style: 'bold'
                    }
                ],
                filters: { brightness: 10, contrast: 15, saturation: 20, filter: 'vivid' }
            },
            {
                id: 't002',
                name: 'Social Story',
                category: 'social',
                duration: 10,
                ratio: '9:16',
                thumbnail: '📱',
                description: 'Perfect for stories',
                clips: [
                    { startTime: 0, endTime: 5, effect: 'none', transition: 'dissolve', speed: 1 },
                    { startTime: 5, endTime: 10, effect: 'zoom-out', transition: 'fade', speed: 1 }
                ],
                texts: [
                    {
                        content: 'TAP HERE ↗',
                        startTime: 7, endTime: 10,
                        x: 50, y: 80,
                        fontSize: 24, fontWeight: '600',
                        color: '#00f5ff', animation: 'bounce', style: 'neon'
                    }
                ],
                filters: { brightness: 5, contrast: 0, saturation: 10, filter: 'warm' }
            }
        ];
    }

    function setupEventListeners() {
        // Category buttons
        document.querySelectorAll('#template-categories .cat-btn')
            .forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('#template-categories .cat-btn')
                        .forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentCategory = btn.dataset.category;
                    renderTemplates();
                });
            });

        // Search
        const searchInput = document.getElementById('template-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                renderTemplates(e.target.value);
            });
        }
    }

    function renderTemplates(searchQuery = '') {
        const grid = document.getElementById('template-grid');
        if (!grid) return;

        let filtered = templates;

        // Filter by category
        if (currentCategory !== 'all') {
            filtered = filtered.filter(t => t.category === currentCategory);
        }

        // Filter by search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.name.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.category.toLowerCase().includes(q)
            );
        }

        grid.innerHTML = filtered.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="template-preview">
                    <span>${template.thumbnail}</span>
                </div>
                <div class="template-info">
                    <div class="template-name">${template.name}</div>
                    <div class="template-duration">${template.duration}s • ${template.ratio}</div>
                </div>
                <button class="use-btn" onclick="TemplateManager.applyTemplate('${template.id}')">
                    Use
                </button>
            </div>
        `).join('');

        // Click handler for template cards
        grid.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('use-btn')) return;
                const id = card.dataset.templateId;
                previewTemplate(id);
            });
        });
    }

    function previewTemplate(templateId) {
        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        showToast(`Preview: ${template.name}`, 'info');
    }

    function applyTemplate(templateId) {
        const template = templates.find(t => t.id === templateId);
        if (!template) {
            showToast('Template not found', 'error');
            return;
        }

        // Confirm if there's existing content
        const hasContent = Object.values(Timeline.tracks)
            .some(track => track.length > 0);
        
        if (hasContent) {
            if (!confirm('This will replace your current edit. Continue?')) {
                return;
            }
        }

        // Clear existing timeline
        Timeline.clearAll();

        // Set aspect ratio
        const previewWrapper = document.getElementById('preview-wrapper');
        if (previewWrapper) {
            previewWrapper.dataset.ratio = template.ratio;
            document.querySelectorAll('.ratio-btn').forEach(btn => {
                btn.classList.toggle('active', 
                    btn.dataset.ratio === template.ratio);
            });
        }

        // Apply video clips
        if (template.clips) {
            template.clips.forEach((clip, index) => {
                Timeline.addClip('video', {
                    name: `Clip ${index + 1}`,
                    startTime: clip.startTime,
                    endTime: clip.endTime,
                    duration: clip.endTime - clip.startTime,
                    effect: clip.effect,
                    transition: clip.transition,
                    speed: clip.speed
                });
            });
        }

        // Apply text overlays
        if (template.texts) {
            template.texts.forEach(text => {
                Timeline.addClip('text', {
                    content: text.content,
                    startTime: text.startTime,
                    endTime: text.endTime,
                    duration: text.endTime - text.startTime,
                    x: text.x,
                    y: text.y,
                    fontSize: text.fontSize,
                    fontWeight: text.fontWeight,
                    color: text.color,
                    animation: text.animation,
                    style: text.style
                });
            });
        }

        // Apply filters
        if (template.filters) {
            applyFilters(template.filters);
        }

        showToast(`Template "${template.name}" applied!`, 'success');
    }

    function applyFilters(filters) {
        if (filters.brightness !== undefined) {
            const el = document.getElementById('adj-brightness');
            if (el) el.value = filters.brightness;
        }
        if (filters.contrast !== undefined) {
            const el = document.getElementById('adj-contrast');
            if (el) el.value = filters.contrast;
        }
        if (filters.saturation !== undefined) {
            const el = document.getElementById('adj-saturation');
            if (el) el.value = filters.saturation;
        }
        if (filters.filter) {
            document.querySelectorAll('.filter-item').forEach(item => {
                item.classList.toggle('active', 
                    item.dataset.filter === filters.filter);
            });
        }

        // Apply CSS filter to preview
        updatePreviewFilter();
    }

    function updatePreviewFilter() {
        const video = document.getElementById('preview-video');
        if (!video) return;

        const brightness = 100 + parseInt(
            document.getElementById('adj-brightness')?.value || 0);
        const contrast = 100 + parseInt(
            document.getElementById('adj-contrast')?.value || 0);
        const saturation = 100 + parseInt(
            document.getElementById('adj-saturation')?.value || 0);
        const hue = parseInt(
            document.getElementById('adj-hue')?.value || 0);
        const blur = parseInt(
            document.getElementById('adj-blur')?.value || 0);

        video.style.filter = `
            brightness(${brightness}%) 
            contrast(${contrast}%) 
            saturate(${saturation}%) 
            hue-rotate(${hue}deg) 
            blur(${blur}px)
        `;
    }

    return {
        init,
        loadTemplates,
        renderTemplates,
        applyTemplate,
        applyFilters,
        updatePreviewFilter,
        get templates() { return templates; }
    };
})();
