// ==========================================
// FlashCut - Timeline Engine
// ==========================================

const Timeline = (() => {
    // State
    let tracks = {
        video: [],
        text: [],
        audio: [],
        sticker: []
    };

    let playhead = 0; // Current time in seconds
    let duration = 0; // Total duration
    let zoom = 3; // Zoom level (pixels per second)
    let pixelsPerSecond = 50;
    let selectedClip = null;
    let isPlaying = false;
    let animationFrame = null;
    let activeTool = 'select';

    // Undo/Redo stacks
    let undoStack = [];
    let redoStack = [];
    const MAX_UNDO = 50;

    // Clip ID counter
    let clipIdCounter = 0;

    function init() {
        setupEventListeners();
        drawRuler();
        updatePlayhead();
    }

    function setupEventListeners() {
        // Zoom controls
        const zoomSlider = document.getElementById('zoom-slider');
        if (zoomSlider) {
            zoomSlider.addEventListener('input', (e) => {
                zoom = parseFloat(e.target.value);
                pixelsPerSecond = zoom * 20;
                document.getElementById('zoom-level').textContent = 
                    Math.round(zoom * 33) + '%';
                renderAllTracks();
                drawRuler();
            });
        }

        document.getElementById('zoom-in')?.addEventListener('click', () => {
            zoom = Math.min(zoom + 0.5, 10);
            zoomSlider.value = zoom;
            pixelsPerSecond = zoom * 20;
            renderAllTracks();
            drawRuler();
        });

        document.getElementById('zoom-out')?.addEventListener('click', () => {
            zoom = Math.max(zoom - 0.5, 1);
            zoomSlider.value = zoom;
            pixelsPerSecond = zoom * 20;
            renderAllTracks();
            drawRuler();
        });

        // Tool buttons
        document.querySelectorAll('.tl-tool[id^="tool-"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tl-tool[id^="tool-"]')
                    .forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeTool = btn.id.replace('tool-', '');
            });
        });

        // Timeline click for playhead positioning
        const timelineScroll = document.getElementById('timeline-scroll');
        if (timelineScroll) {
            timelineScroll.addEventListener('click', (e) => {
                if (e.target.closest('.timeline-clip')) return;
                const rect = timelineScroll.getBoundingClientRect();
                const trackHeader = 120;
                const x = e.clientX - rect.left - trackHeader + timelineScroll.scrollLeft;
                if (x >= 0) {
                    playhead = x / pixelsPerSecond;
                    updatePlayhead();
                    seekVideo(playhead);
                }
            });
        }

        // Playhead dragging
        const playheadEl = document.getElementById('playhead');
        if (playheadEl) {
            let isDragging = false;

            playheadEl.addEventListener('mousedown', (e) => {
                isDragging = true;
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const timeline = document.getElementById('timeline-scroll');
                const rect = timeline.getBoundingClientRect();
                const x = e.clientX - rect.left - 120 + timeline.scrollLeft;
                playhead = Math.max(0, x / pixelsPerSecond);
                updatePlayhead();
                seekVideo(playhead);
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' ||
                e.target.contentEditable === 'true') return;

            switch (e.key) {
                case ' ':
                    e.preventDefault();
                    togglePlayPause();
                    break;
                case 'Delete':
                case 'Backspace':
                    if (selectedClip) deleteClip(selectedClip);
                    break;
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        if (e.shiftKey) redo();
                        else undo();
                    }
                    break;
                case 'c':
                    if (e.ctrlKey || e.metaKey) copyClip();
                    break;
                case 'v':
                    if (e.ctrlKey || e.metaKey) pasteClip();
                    break;
                case 's':
                    if (activeTool === 'select' && selectedClip) {
                        e.preventDefault();
                        splitClip(selectedClip, playhead);
                    }
                    break;
                case 'ArrowLeft':
                    playhead = Math.max(0, playhead - (e.shiftKey ? 1 : 0.1));
                    updatePlayhead();
                    seekVideo(playhead);
                    break;
                case 'ArrowRight':
                    playhead = Math.min(duration, playhead + (e.shiftKey ? 1 : 0.1));
                    updatePlayhead();
                    seekVideo(playhead);
                    break;
            }
        });
    }

    // Generate unique clip ID
    function generateClipId() {
        return 'clip_' + (++clipIdCounter) + '_' + Date.now();
    }

    // Add clip to track
    function addClip(trackType, clipData) {
        saveState();

        const clip = {
            id: generateClipId(),
            trackType: trackType,
            startTime: clipData.startTime || playhead,
            endTime: clipData.endTime || (playhead + (clipData.duration || 5)),
            duration: clipData.duration || 5,
            ...clipData
        };

        tracks[trackType].push(clip);

        // Update total duration
        updateDuration();
        renderTrack(trackType);
        
        return clip;
    }

    // Remove clip
    function deleteClip(clipId) {
        saveState();

        for (const trackType in tracks) {
            const index = tracks[trackType].findIndex(c => c.id === clipId);
            if (index >= 0) {
                tracks[trackType].splice(index, 1);
                renderTrack(trackType);
                break;
            }
        }

        if (selectedClip === clipId) {
            selectedClip = null;
            hideProperties();
        }

        updateDuration();
        showToast('Clip deleted', 'info');
    }

    // Split clip at time
    function splitClip(clipId, time) {
        saveState();

        for (const trackType in tracks) {
            const clipIndex = tracks[trackType].findIndex(c => c.id === clipId);
            if (clipIndex < 0) continue;

            const clip = tracks[trackType][clipIndex];
            if (time <= clip.startTime || time >= clip.endTime) continue;

            // Create two clips from one
            const clip1 = { ...clip, endTime: time };
            const clip2 = {
                ...clip,
                id: generateClipId(),
                startTime: time,
                trimStart: (clip.trimStart || 0) + (time - clip.startTime)
            };

            tracks[trackType].splice(clipIndex, 1, clip1, clip2);
            renderTrack(trackType);
            showToast('Clip split', 'success');
            return;
        }
    }

    // Duplicate clip
    function duplicateClip(clipId) {
        saveState();

        for (const trackType in tracks) {
            const clip = tracks[trackType].find(c => c.id === clipId);
            if (!clip) continue;

            const newClip = {
                ...clip,
                id: generateClipId(),
                startTime: clip.endTime,
                endTime: clip.endTime + (clip.endTime - clip.startTime)
            };

            tracks[trackType].push(newClip);
            renderTrack(trackType);
            updateDuration();
            showToast('Clip duplicated', 'success');
            return;
        }
    }

    // Move clip
    function moveClip(clipId, newStartTime) {
        for (const trackType in tracks) {
            const clip = tracks[trackType].find(c => c.id === clipId);
            if (!clip) continue;

            const clipDuration = clip.endTime - clip.startTime;
            clip.startTime = Math.max(0, newStartTime);
            clip.endTime = clip.startTime + clipDuration;

            renderTrack(trackType);
            updateDuration();
            return;
        }
    }

    // Trim clip
    function trimClip(clipId, side, newTime) {
        for (const trackType in tracks) {
            const clip = tracks[trackType].find(c => c.id === clipId);
            if (!clip) continue;

            if (side === 'left') {
                clip.startTime = Math.max(0, Math.min(newTime, clip.endTime - 0.1));
            } else {
                clip.endTime = Math.max(clip.startTime + 0.1, newTime);
            }

            renderTrack(trackType);
            updateDuration();
            return;
        }
    }

    // Update total duration
    function updateDuration() {
        duration = 0;
        for (const trackType in tracks) {
            tracks[trackType].forEach(clip => {
                if (clip.endTime > duration) {
                    duration = clip.endTime;
                }
            });
        }
        duration = Math.max(duration, 1);

        // Update UI
        const totalTime = document.getElementById('total-time');
        if (totalTime) {
            totalTime.textContent = formatTime(duration);
        }
    }

    // Render single track
    function renderTrack(trackType) {
        const trackEl = document.getElementById(`${trackType}-track`);
        if (!trackEl) return;

        trackEl.innerHTML = '';

        tracks[trackType].forEach(clip => {
            const clipEl = createClipElement(clip);
            trackEl.appendChild(clipEl);
        });
    }

    // Render all tracks
    function renderAllTracks() {
        for (const trackType in tracks) {
            renderTrack(trackType);
        }
        drawRuler();
    }

    // Create clip DOM element
    function createClipElement(clip) {
        const el = document.createElement('div');
        el.className = `timeline-clip ${clip.trackType}-clip`;
        if (clip.id === selectedClip) el.classList.add('selected');
        el.dataset.clipId = clip.id;

        const left = clip.startTime * pixelsPerSecond;
        const width = (clip.endTime - clip.startTime) * pixelsPerSecond;

        el.style.left = left + 'px';
        el.style.width = Math.max(width, 20) + 'px';

        // Clip label
        let label = '';
        switch (clip.trackType) {
            case 'video': label = clip.name || 'Video'; break;
            case 'text': label = clip.content || 'Text'; break;
            case 'audio': label = clip.name || 'Audio'; break;
            case 'sticker': label = clip.emoji || '😊'; break;
        }

        el.innerHTML = `
            <div class="clip-handle left"></div>
            <span>${label}</span>
            <div class="clip-handle right"></div>
        `;

        // Click to select
        el.addEventListener('click', (e) => {
            e.stopPropagation();

            if (activeTool === 'cut') {
                splitClip(clip.id, playhead);
                return;
            }

            selectClip(clip.id);
        });

        // Drag to move
        let isDragging = false;
        let startX = 0;
        let startLeft = 0;

        el.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('clip-handle')) return;
            isDragging = true;
            startX = e.clientX;
            startLeft = clip.startTime;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dt = dx / pixelsPerSecond;
            moveClip(clip.id, startLeft + dt);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                saveState();
            }
        });

        // Trim handles
        const handles = el.querySelectorAll('.clip-handle');
        handles.forEach(handle => {
            let isTrimming = false;
            let trimSide = handle.classList.contains('left') ? 'left' : 'right';

            handle.addEventListener('mousedown', (e) => {
                isTrimming = true;
                e.stopPropagation();
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isTrimming) return;
                const timeline = document.getElementById('timeline-scroll');
                const rect = timeline.getBoundingClientRect();
                const x = e.clientX - rect.left - 120 + timeline.scrollLeft;
                const time = x / pixelsPerSecond;
                trimClip(clip.id, trimSide, time);
            });

            document.addEventListener('mouseup', () => {
                if (isTrimming) {
                    isTrimming = false;
                    saveState();
                }
            });
        });

        // Right-click context menu
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            selectClip(clip.id);
            showContextMenu(e.clientX, e.clientY, clip.id);
        });

        return el;
    }

    // Select clip
    function selectClip(clipId) {
        selectedClip = clipId;

        // Update UI
        document.querySelectorAll('.timeline-clip').forEach(el => {
            el.classList.toggle('selected', el.dataset.clipId === clipId);
        });

        // Find clip data
        for (const trackType in tracks) {
            const clip = tracks[trackType].find(c => c.id === clipId);
            if (clip) {
                showProperties(clip);
                return;
            }
        }
    }

    // Show properties panel
    function showProperties(clip) {
        const noSelection = document.getElementById('no-selection');
        const clipProps = document.getElementById('clip-properties');
        const textProps = document.getElementById('text-properties');

        if (noSelection) noSelection.classList.add('hidden');

        if (clip.trackType === 'text') {
            if (clipProps) clipProps.classList.add('hidden');
            if (textProps) textProps.classList.remove('hidden');

            // Fill text properties
            const textContent = document.getElementById('text-content');
            if (textContent) textContent.value = clip.content || '';

            const textColor = document.getElementById('text-color');
            if (textColor) textColor.value = clip.color || '#ffffff';

            const textSize = document.getElementById('text-size');
            if (textSize) textSize.value = clip.fontSize || 48;
        } else {
            if (textProps) textProps.classList.add('hidden');
            if (clipProps) clipProps.classList.remove('hidden');

            // Fill clip properties
            const trimStart = document.getElementById('prop-trim-start');
            if (trimStart) trimStart.value = formatTime(clip.startTime);

            const trimEnd = document.getElementById('prop-trim-end');
            if (trimEnd) trimEnd.value = formatTime(clip.endTime);

            const propSpeed = document.getElementById('prop-speed');
            if (propSpeed) propSpeed.value = clip.speed || 1;
        }
    }

    // Hide properties panel
    function hideProperties() {
        const noSelection = document.getElementById('no-selection');
        const clipProps = document.getElementById('clip-properties');
        const textProps = document.getElementById('text-properties');

        if (noSelection) noSelection.classList.remove('hidden');
        if (clipProps) clipProps.classList.add('hidden');
        if (textProps) textProps.classList.add('hidden');
    }

    // Context menu
    function showContextMenu(x, y, clipId) {
        const menu = document.getElementById('context-menu');
        if (!menu) return;

        menu.classList.remove('hidden');
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';

        // Bind actions
        menu.querySelectorAll('button[data-action]').forEach(btn => {
            btn.onclick = () => {
                const action = btn.dataset.action;
                switch (action) {
                    case 'delete': deleteClip(clipId); break;
                    case 'duplicate': duplicateClip(clipId); break;
                    case 'split': splitClip(clipId, playhead); break;
                    case 'cut': deleteClip(clipId); break;
                }
                menu.classList.add('hidden');
            };
        });

        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                menu.classList.add('hidden');
                document.removeEventListener('click', closeMenu);
            });
        }, 10);
    }

    // Draw ruler
    function drawRuler() {
        const canvas = document.getElementById('ruler-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        canvas.width = Math.max(container.offsetWidth, duration * pixelsPerSecond + 200);
        canvas.height = container.offsetHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#606080';
        ctx.font = '10px Inter, sans-serif';

        const interval = zoom <= 2 ? 5 : zoom <= 5 ? 2 : 1;
        const subInterval = zoom <= 2 ? 1 : zoom <= 5 ? 0.5 : 0.2;

        for (let t = 0; t <= duration + 10; t += subInterval) {
            const x = 120 + t * pixelsPerSecond;

            if (t % interval === 0) {
                ctx.fillStyle = '#808090';
                ctx.fillRect(x, 0, 1, canvas.height);
                ctx.fillStyle = '#a0a0c0';
                ctx.fillText(formatTimeShort(t), x + 4, 14);
            } else {
                ctx.fillStyle = '#404060';
                ctx.fillRect(x, canvas.height - 8, 1, 8);
            }
        }
    }

    // Update playhead position
    function updatePlayhead() {
        const playheadEl = document.getElementById('playhead');
        if (!playheadEl) return;

        const x = 120 + playhead * pixelsPerSecond;
        playheadEl.style.left = x + 'px';

        // Update time display
        const currentTime = document.getElementById('current-time');
        if (currentTime) {
            currentTime.textContent = formatTime(playhead);
        }
    }

    // Playback
    function play() {
        if (isPlaying) return;
        isPlaying = true;

        const video = document.getElementById('preview-video');
        if (video && video.src) {
            video.currentTime = playhead;
            video.play();
        }

        updatePlayBtn(true);

        let lastTime = performance.now();
        function tick(now) {
            if (!isPlaying) return;

            const dt = (now - lastTime) / 1000;
            lastTime = now;

            playhead += dt;

            if (playhead >= duration) {
                playhead = 0;
                if (video) video.currentTime = 0;
            }

            updatePlayhead();
            updateOverlays();

            animationFrame = requestAnimationFrame(tick);
        }

        animationFrame = requestAnimationFrame(tick);
    }

    function pause() {
        isPlaying = false;
        cancelAnimationFrame(animationFrame);

        const video = document.getElementById('preview-video');
        if (video) video.pause();

        updatePlayBtn(false);
    }

    function togglePlayPause() {
        if (isPlaying) pause();
        else play();
    }

    function updatePlayBtn(playing) {
        const btn = document.getElementById('play-pause');
        if (!btn) return;
        btn.innerHTML = playing ? 
            '<i class="fas fa-pause"></i>' : 
            '<i class="fas fa-play"></i>';
    }

    // Seek video to time
    function seekVideo(time) {
        const video = document.getElementById('preview-video');
        if (video && video.src && !isNaN(video.duration)) {
            video.currentTime = Math.min(time, video.duration);
        }
        updateOverlays();
    }

    // Update text/sticker overlays based on playhead
    function updateOverlays() {
        // Text overlays
        const textOverlays = document.getElementById('text-overlays');
        if (textOverlays) {
            tracks.text.forEach(clip => {
                let el = document.getElementById('overlay-' + clip.id);

                if (playhead >= clip.startTime && playhead <= clip.endTime) {
                    if (!el) {
                        el = document.createElement('div');
                        el.id = 'overlay-' + clip.id;
                        el.className = 'text-overlay';
                        el.style.left = (clip.x || 50) + '%';
                        el.style.top = (clip.y || 50) + '%';
                        el.style.transform = 'translate(-50%, -50%)';
                        el.style.fontSize = (clip.fontSize || 24) + 'px';
                        el.style.fontWeight = clip.fontWeight || '400';
                        el.style.color = clip.color || '#ffffff';
                        el.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
                        el.style.fontFamily = clip.font || 'Inter, sans-serif';
                        el.textContent = clip.content || 'Text';

                        // Apply text style
                        applyTextStyle(el, clip.style);

                        textOverlays.appendChild(el);
                    }
                } else {
                    if (el) el.remove();
                }
            });
        }

        // Sticker overlays
        const stickerOverlays = document.getElementById('sticker-overlays');
        if (stickerOverlays) {
            tracks.sticker.forEach(clip => {
                let el = document.getElementById('overlay-' + clip.id);

                if (playhead >= clip.startTime && playhead <= clip.endTime) {
                    if (!el) {
                        el = document.createElement('div');
                        el.id = 'overlay-' + clip.id;
                        el.className = 'sticker-overlay';
                        el.style.left = (clip.x || 50) + '%';
                        el.style.top = (clip.y || 50) + '%';
                        el.style.transform = 'translate(-50%, -50%)';
                        el.style.fontSize = (clip.fontSize || 48) + 'px';
                        el.textContent = clip.emoji || '😊';
                        stickerOverlays.appendChild(el);
                    }
                } else {
                    if (el) el.remove();
                }
            });
        }
    }

    // Apply text style
    function applyTextStyle(el, style) {
        switch (style) {
            case 'neon':
                el.style.textShadow = '0 0 10px #0ff, 0 0 20px #0ff, 0 0 40px #0ff';
                break;
            case 'fire':
                el.style.textShadow = '0 0 10px #f80, 0 0 20px #f60, 0 0 40px #f40';
                break;
            case 'glitch':
                el.style.textShadow = '2px 0 #0ff, -2px 0 #f0f';
                break;
            case 'shadow':
                el.style.textShadow = '3px 3px 6px rgba(0,0,0,0.9)';
                break;
            case 'outline':
                el.style.webkitTextStroke = '2px white';
                el.style.color = 'transparent';
                break;
        }
    }

    // Undo/Redo
    function saveState() {
        const state = JSON.parse(JSON.stringify(tracks));
        undoStack.push(state);
        if (undoStack.length > MAX_UNDO) undoStack.shift();
        redoStack = [];
    }

    function undo() {
        if (undoStack.length === 0) return;
        redoStack.push(JSON.parse(JSON.stringify(tracks)));
        tracks = undoStack.pop();
        renderAllTracks();
        updateDuration();
        showToast('Undo', 'info');
    }

    function redo() {
        if (redoStack.length === 0) return;
        undoStack.push(JSON.parse(JSON.stringify(tracks)));
        tracks = redoStack.pop();
        renderAllTracks();
        updateDuration();
        showToast('Redo', 'info');
    }

    // Copy/Paste
    let clipboard = null;

    function copyClip() {
        if (!selectedClip) return;
        for (const trackType in tracks) {
            const clip = tracks[trackType].find(c => c.id === selectedClip);
            if (clip) {
                clipboard = JSON.parse(JSON.stringify(clip));
                showToast('Clip copied', 'info');
                return;
            }
        }
    }

    function pasteClip() {
        if (!clipboard) return;
        const newClip = {
            ...clipboard,
            id: generateClipId(),
            startTime: playhead,
            endTime: playhead + (clipboard.endTime - clipboard.startTime)
        };
        tracks[clipboard.trackType].push(newClip);
        renderTrack(clipboard.trackType);
        updateDuration();
        showToast('Clip pasted', 'success');
    }

    // Format time
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    }

    function formatTimeShort(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    }

    // Get all clips at a specific time
    function getClipsAtTime(time) {
        const result = {};
        for (const trackType in tracks) {
            result[trackType] = tracks[trackType].filter(
                c => time >= c.startTime && time <= c.endTime
            );
        }
        return result;
    }

    // Export timeline data
    function exportData() {
        return {
            tracks: JSON.parse(JSON.stringify(tracks)),
            duration,
            zoom
        };
    }

    // Import timeline data
    function importData(data) {
        if (data.tracks) tracks = data.tracks;
        if (data.duration) duration = data.duration;
        renderAllTracks();
    }

    // Clear all tracks
    function clearAll() {
        saveState();
        for (const trackType in tracks) {
            tracks[trackType] = [];
        }
        playhead = 0;
        duration = 0;
        selectedClip = null;
        renderAllTracks();
        hideProperties();
        updatePlayhead();
    }

    return {
        init,
        addClip,
        deleteClip,
        splitClip,
        duplicateClip,
        moveClip,
        trimClip,
        selectClip,
        play,
        pause,
        togglePlayPause,
        seekVideo,
        undo,
        redo,
        copyClip,
        pasteClip,
        renderAllTracks,
        getClipsAtTime,
        exportData,
        importData,
        clearAll,
        get playhead() { return playhead; },
        set playhead(v) { playhead = v; updatePlayhead(); },
        get duration() { return duration; },
        get isPlaying() { return isPlaying; },
        get selectedClip() { return selectedClip; },
        get tracks() { return tracks; }
    };
})();
