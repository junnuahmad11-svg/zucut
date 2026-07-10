/**
 * VideoForge - AI Features
 */

const AIFeatures = {

    // Open AI tool
    openTool(toolType) {
        const modal = document.getElementById('ai-modal');
        const body = document.getElementById('ai-modal-body');
        if (!modal || !body) return;

        switch (toolType) {
            case 'captions':
                body.innerHTML = this.getCaptionsUI();
                this.setupCaptionsLogic();
                break;
            case 'beatSync':
                body.innerHTML = this.getBeatSyncUI();
                this.setupBeatSyncLogic();
                break;
            case 'bgRemove':
                body.innerHTML = this.getBgRemoveUI();
                this.setupBgRemoveLogic();
                break;
            case 'voiceover':
                body.innerHTML = this.getVoiceoverUI();
                this.setupVoiceoverLogic();
                break;
            case 'enhance':
                body.innerHTML = this.getEnhanceUI();
                this.setupEnhanceLogic();
                break;
            case 'music':
                body.innerHTML = this.getMusicUI();
                this.setupMusicLogic();
                break;
        }

        modal.classList.remove('hidden');

        modal.querySelector('.modal-overlay')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        modal.querySelector('.modal-close')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    },

    // Auto Captions UI
    getCaptionsUI() {
        return `
            <h2><i class="fas fa-closed-captioning" style="color:var(--accent-primary)"></i> Auto Captions</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate captions from your video's audio automatically
            </p>
            <div class="form-group">
                <label>Language</label>
                <select id="caption-language" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="pt">Portuguese</option>
                    <option value="zh">Chinese</option>
                    <option value="ar">Arabic</option>
                </select>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Caption Style</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <button class="caption-style-btn active" data-style="classic" 
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--accent-primary);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Classic</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">White text, black bg</div>
                    </button>
                    <button class="caption-style-btn" data-style="modern"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Modern</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Word highlight</div>
                    </button>
                    <button class="caption-style-btn" data-style="karaoke"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Karaoke</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Color fill effect</div>
                    </button>
                    <button class="caption-style-btn" data-style="minimal"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Minimal</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Clean, no background</div>
                    </button>
                </div>
            </div>
            <div id="caption-progress" style="display:none;margin-top:20px;">
                <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;">
                    <div id="caption-progress-bar" style="width:0%;height:100%;background:linear-gradient(90deg,var(--accent-primary),var(--accent-green));transition:width 0.3s;border-radius:2px;"></div>
                </div>
                <p id="caption-status" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-muted);">Analyzing audio...</p>
            </div>
            <div id="caption-results" style="display:none;margin-top:20px;max-height:200px;overflow-y:auto;"></div>
            <button class="primary-btn full-width" id="generate-captions-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Generate Captions
            </button>
        `;
    },

    setupCaptionsLogic() {
        // Style selection
        document.querySelectorAll('.caption-style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.caption-style-btn').forEach(b => {
                    b.style.borderColor = 'var(--border-color)';
                    b.classList.remove('active');
                });
                btn.style.borderColor = 'var(--accent-primary)';
                btn.classList.add('active');
            });
        });

        document.getElementById('generate-captions-btn')?.addEventListener('click', () => {
            this.generateCaptions();
        });
    },

    async generateCaptions() {
        const progress = document.getElementById('caption-progress');
        const progressBar = document.getElementById('caption-progress-bar');
        const status = document.getElementById('caption-status');
        const results = document.getElementById('caption-results');
        const btn = document.getElementById('generate-captions-btn');

        if (!progress || !btn) return;

        if (!VideoEditor.videoElement?.src) {
            app.showToast('Please upload a video first', 'warning');
            return;
        }

        progress.style.display = 'block';
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Simulate AI caption generation with Web Speech API or demo
        const steps = [
            { progress: 20, text: 'Extracting audio...' },
            { progress: 40, text: 'Analyzing speech...' },
            { progress: 60, text: 'Generating transcription...' },
            { progress: 80, text: 'Timing captions...' },
            { progress: 100, text: 'Done!' }
        ];

        for (const step of steps) {
            await this.delay(800);
            progressBar.style.width = step.progress + '%';
            status.textContent = step.text;
        }

        // Generate demo captions
        const captions = this.generateDemoCaptions();

        results.style.display = 'block';
        results.innerHTML = `
            <h4 style="margin-bottom:12px;">Generated Captions (${captions.length})</h4>
            ${captions.map((c, i) => `
                <div style="padding:8px 12px;background:var(--bg-card);border-radius:6px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:13px;">"${c.text}"</span>
                    <span style="font-size:11px;color:var(--text-muted);">${c.start.toFixed(1)}s - ${c.end.toFixed(1)}s</span>
                </div>
            `).join('')}
        `;

        btn.innerHTML = '<i class="fas fa-check"></i> Apply Captions';
        btn.disabled = false;
        btn.onclick = () => {
            captions.forEach(c => {
                const style = document.querySelector('.caption-style-btn.active')?.dataset.style || 'classic';
                const styles = {
                    classic: { color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.7)', fontSize: 24 },
                    modern: { color: '#ffffff', fontSize: 28, fontWeight: '700' },
                    karaoke: { color: '#ffff00', fontSize: 26, fontWeight: '600' },
                    minimal: { color: '#ffffff', fontSize: 22, fontWeight: '400' }
                };

                VideoEditor.addTextOverlay({
                    content: c.text,
                    startTime: c.start,
                    endTime: c.end,
                    position: { x: 50, y: 85 },
                    ...styles[style]
                });
            });

            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast(`${captions.length} captions added!`, 'success');
        };
    },

    generateDemoCaptions() {
        const duration = VideoEditor.duration || 30;
        const texts = [
            "Hey everyone, welcome back",
            "Today we're going to show you",
            "Something really amazing",
            "Let's get started",
            "First, let me show you this",
            "Pretty cool, right?",
            "And that's basically it",
            "Thanks for watching!"
        ];

        const segmentDuration = duration / Math.min(texts.length, Math.ceil(duration / 3));
        return texts.slice(0, Math.ceil(duration / 3)).map((text, i) => ({
            text,
            start: i * segmentDuration,
            end: (i + 1) * segmentDuration - 0.2
        }));
    },

    // Beat Sync UI
    getBeatSyncUI() {
        return `
            <h2><i class="fas fa-heartbeat" style="color:var(--accent-pink)"></i> Beat Sync</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Automatically sync your video cuts to the beats of your music
            </p>
            <div class="form-group">
                <label>Music Source</label>
                <div style="display:flex;gap:8px;">
                    <button class="secondary-btn" id="upload-music-btn" style="flex:1;">
                        <i class="fas fa-upload"></i> Upload Music
                    </button>
                    <input type="file" id="music-file-input" accept="audio/*" hidden>
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>BPM (Beats Per Minute)</label>
                <div style="display:flex;align-items:center;gap:12px;">
                    <input type="range" id="bpm-slider" min="60" max="200" value="128" 
                           style="flex:1;accent-color:var(--accent-primary);">
                    <span id="bpm-value" style="min-width:40px;text-align:center;">128</span>
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Sync Style</label>
                <select id="sync-style" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="cut">Cut on beat</option>
                    <option value="zoom">Zoom pulse</option>
                    <option value="flash">Flash on beat</option>
                    <option value="shake">Screen shake</option>
                </select>
            </div>
            <button class="primary-btn full-width" id="apply-beat-sync-btn" style="margin-top:20px;">
                <i class="fas fa-sync"></i> Sync to Beats
            </button>
        `;
    },

    setupBeatSyncLogic() {
        const bpmSlider = document.getElementById('bpm-slider');
        const bpmValue = document.getElementById('bpm-value');

        if (bpmSlider && bpmValue) {
            bpmSlider.addEventListener('input', () => {
                bpmValue.textContent = bpmSlider.value;
            });
        }

        document.getElementById('upload-music-btn')?.addEventListener('click', () => {
            document.getElementById('music-file-input')?.click();
        });

        document.getElementById('music-file-input')?.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                app.showToast('Music file loaded: ' + e.target.files[0].name, 'success');
            }
        });

        document.getElementById('apply-beat-sync-btn')?.addEventListener('click', () => {
            this.applyBeatSync();
        });
    },

    async applyBeatSync() {
        const bpm = parseInt(document.getElementById('bpm-slider')?.value || 128);
        const style = document.getElementById('sync-style')?.value || 'cut';

        if (!VideoEditor.videoElement?.src) {
            app.showToast('Please upload a video first', 'warning');
            return;
        }

        app.showLoading('Syncing beats...');

        const beatInterval = 60 / bpm;
        const duration = VideoEditor.duration;
        const beats = [];

        for (let t = 0; t < duration; t += beatInterval) {
            beats.push(t);
        }

        await this.delay(1500);

        // Apply beat markers as text overlays with flash effect
        if (style === 'flash' || style === 'zoom') {
            beats.forEach((beat, i) => {
                if (i % 4 === 0) { // Every 4th beat
                    VideoEditor.addTextOverlay({
                        content: '●',
                        startTime: beat,
                        endTime: beat + 0.1,
                        position: { x: 50, y: 50 },
                        fontSize: 200,
                        color: 'rgba(255,255,255,0.5)',
                        animation: 'zoom_in'
                    });
                }
            });
        }

        app.hideLoading();
        document.getElementById('ai-modal')?.classList.add('hidden');
        app.showToast(`Beat synced! ${beats.length} beats at ${bpm} BPM`, 'success');
    },

    // Background Remove UI
    getBgRemoveUI() {
        return `
            <h2><i class="fas fa-eraser" style="color:var(--accent-green)"></i> Background Remover</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Remove the background from your video using AI segmentation
            </p>
            <div style="padding:24px;background:var(--bg-card);border-radius:12px;text-align:center;margin-bottom:20px;">
                <i class="fas fa-image" style="font-size:48px;color:var(--accent-primary);margin-bottom:12px;"></i>
                <p style="color:var(--text-secondary);margin-bottom:12px;">
                    AI will detect the subject and remove the background
                </p>
                <p style="font-size:12px;color:var(--text-muted);">
                    Works best with single subjects and solid backgrounds
                </p>
            </div>
            <div class="form-group">
                <label>Replacement Background</label>
                <select id="bg-replacement" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="transparent">Transparent</option>
                    <option value="blur">Blurred Original</option>
                    <option value="color">Solid Color</option>
                    <option value="gradient">Gradient</option>
                </select>
            </div>
            <div class="form-group" style="margin-top:12px;" id="bg-color-group">
                <label>Background Color</label>
                <input type="color" id="bg-color-picker" value="#00ff00" 
                       style="width:100%;height:40px;cursor:pointer;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;">
            </div>
            <button class="primary-btn full-width" id="remove-bg-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Remove Background
            </button>
        `;
    },

    setupBgRemoveLogic() {
        document.getElementById('remove-bg-btn')?.addEventListener('click', async () => {
            if (!VideoEditor.videoElement?.src) {
                app.showToast('Please upload a video first', 'warning');
                return;
            }

            app.showLoading('Removing background...');
            await this.delay(2000);

            // Apply a green screen-like filter as demo
            VideoEditor.applyFilter('high_contrast');
            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('Background removal applied (demo mode)', 'success');
        });
    },

    // AI Voiceover UI
    getVoiceoverUI() {
        return `
            <h2><i class="fas fa-microphone-alt" style="color:var(--accent-orange)"></i> AI Voiceover</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate natural-sounding narration from text
            </p>
            <div class="form-group">
                <label>Script</label>
                <textarea id="voiceover-text" placeholder="Enter the text you want to convert to speech..."
                          style="padding:12px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;min-height:120px;resize:vertical;font-family:inherit;font-size:14px;"></textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;">
                <div class="form-group">
                    <label>Voice</label>
                    <select id="voice-select" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                        <option value="female1">Sarah (Female)</option>
                        <option value="male1">James (Male)</option>
                        <option value="female2">Emma (Female)</option>
                        <option value="male2">David (Male)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Speed</label>
                    <select id="voice-speed" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                        <option value="0.75">Slow</option>
                        <option value="1" selected>Normal</option>
                        <option value="1.25">Fast</option>
                        <option value="1.5">Very Fast</option>
                    </select>
                </div>
            </div>
            <button class="primary-btn full-width" id="generate-voice-btn" style="margin-top:20px;">
                <i class="fas fa-play"></i> Generate & Preview
            </button>
        `;
    },

    setupVoiceoverLogic() {
        document.getElementById('generate-voice-btn')?.addEventListener('click', () => {
            this.generateVoiceover();
        });
    },

    async generateVoiceover() {
        const text = document.getElementById('voiceover-text')?.value;
        if (!text) {
            app.showToast('Please enter some text', 'warning');
            return;
        }

        const speed = parseFloat(document.getElementById('voice-speed')?.value || 1);
        const btn = document.getElementById('generate-voice-btn');

        // Use Web Speech API for browser-based TTS
        if ('speechSynthesis' in window) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            btn.disabled = true;

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = speed;

            const voices = speechSynthesis.getVoices();
            const voiceSelect = document.getElementById('voice-select')?.value;
            if (voiceSelect?.includes('female')) {
                const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
                if (femaleVoice) utterance.voice = femaleVoice;
            }

            utterance.onend = () => {
                btn.innerHTML = '<i class="fas fa-check"></i> Add to Timeline';
                btn.disabled = false;
                btn.onclick = () => {
                    // Add as text overlay showing the narration
                    VideoEditor.addTextOverlay({
                        content: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
                        startTime: VideoEditor.currentTime,
                        endTime: VideoEditor.currentTime + text.length * 0.1,
                        position: { x: 50, y: 90 },
                        fontSize: 20,
                        color: '#ffffff',
                        bgColor: 'rgba(0,0,0,0.6)'
                    });
                    document.getElementById('ai-modal')?.classList.add('hidden');
                    app.showToast('Voiceover added to timeline!', 'success');
                };
            };

            speechSynthesis.speak(utterance);
            app.showToast('Playing voiceover preview...', 'info');
        } else {
            app.showToast('Speech synthesis not supported in this browser', 'error');
        }
    },

    // Auto Enhance UI
    getEnhanceUI() {
        return `
            <h2><i class="fas fa-magic" style="color:var(--accent-yellow)"></i> Auto Enhance</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                AI will analyze your video and improve quality automatically
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-sun" style="font-size:24px;color:var(--accent-yellow);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Brightness</div>
                    <div style="font-size:12px;color:var(--text-muted);">Auto adjust</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-adjust" style="font-size:24px;color:var(--accent-cyan);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Contrast</div>
                    <div style="font-size:12px;color:var(--text-muted);">Auto adjust</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-palette" style="font-size:24px;color:var(--accent-pink);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Color</div>
                    <div style="font-size:12px;color:var(--text-muted);">Balance & vibrance</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-expand" style="font-size:24px;color:var(--accent-green);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Sharpness</div>
                    <div style="font-size:12px;color:var(--text-muted);">Edge enhancement</div>
                </div>
            </div>
            <div class="form-group" style="margin-top:20px;">
                <label>Enhancement Strength</label>
                <input type="range" id="enhance-strength" min="0" max="100" value="70"
                       style="width:100%;accent-color:var(--accent-primary);">
                <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);">
                    <span>Subtle</span><span>Strong</span>
                </div>
            </div>
            <button class="primary-btn full-width" id="apply-enhance-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Enhance Video
            </button>
        `;
    },

    setupEnhanceLogic() {
        document.getElementById('apply-enhance-btn')?.addEventListener('click', async () => {
            if (!VideoEditor.videoElement?.src) {
                app.showToast('Please upload a video first', 'warning');
                return;
            }

            app.showLoading('Enhancing video...');
            await this.delay(2000);

            const strength = parseInt(document.getElementById('enhance-strength')?.value || 70);
            const filterStrength = strength / 100;

            const video = VideoEditor.videoElement;
            video.style.filter = `brightness(${1 + filterStrength * 0.1}) contrast(${1 + filterStrength * 0.15}) saturate(${1 + filterStrength * 0.2})`;

            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('Video enhanced!', 'success');
        });
    },

    // AI Music UI
    getMusicUI() {
        return `
            <h2><i class="fas fa-guitar" style="color:var(--accent-secondary)"></i> AI Music</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate royalty-free background music
            </p>
            <div class="form-group">
                <label>Mood</label>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                    ${['Happy', 'Energetic', 'Calm', 'Dramatic', 'Romantic', 'Dark'].map(mood => `
                        <button class="mood-btn" data-mood="${mood.toLowerCase()}"
                                style="padding:10px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-secondary);cursor:pointer;font-size:13px;transition:all 0.2s;">
                            ${mood}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Duration: <span id="music-duration-val">${Math.round(VideoEditor.duration || 30)}s</span></label>
                <input type="range" id="music-duration" min="5" max="180" 
                       value="${Math.round(VideoEditor.duration || 30)}"
                       style="width:100%;accent-color:var(--accent-primary);">
            </div>
            <button class="primary-btn full-width" id="generate-music-btn" style="margin-top:20px;">
                <i class="fas fa-music"></i> Generate Music
            </button>
        `;
    },

    setupMusicLogic() {
        // Mood selection
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => {
                    b.style.borderColor = 'var(--border-color)';
                    b.style.background = 'var(--bg-card)';
                });
                btn.style.borderColor = 'var(--accent-primary)';
                btn.style.background = 'var(--bg-hover)';
            });
        });

        // Duration slider
        const durationSlider = document.getElementById('music-duration');
        const durationVal = document.getElementById('music-duration-val');
        if (durationSlider && durationVal) {
            durationSlider.addEventListener('input', () => {
                durationVal.textContent = durationSlider.value + 's';
            });
        }

        document.getElementById('generate-music-btn')?.addEventListener('click', async () => {
            app.showLoading('Generating music...');
            await this.delay(3000);

            // Create a simple audio track entry
            const audioTrack = {
                id: 'audio_ai_' + Date.now(),
                name: 'AI Generated Music',
                startTime: 0,
                duration: parseInt(document.getElementById('music-duration')?.value || 30),
                trimStart: 0,
                trimEnd: parseInt(document.getElementById('music-duration')?.value || 30),
                volume: 0.5,
                type: 'audio'
            };

            VideoEditor.audioTracks.push(audioTrack);
            VideoEditor.renderTimeline();

            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('AI music track added!', 'success');
        });
    },

    // Helper delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};/**
 * VideoForge - AI Features
 */

const AIFeatures = {

    // Open AI tool
    openTool(toolType) {
        const modal = document.getElementById('ai-modal');
        const body = document.getElementById('ai-modal-body');
        if (!modal || !body) return;

        switch (toolType) {
            case 'captions':
                body.innerHTML = this.getCaptionsUI();
                this.setupCaptionsLogic();
                break;
            case 'beatSync':
                body.innerHTML = this.getBeatSyncUI();
                this.setupBeatSyncLogic();
                break;
            case 'bgRemove':
                body.innerHTML = this.getBgRemoveUI();
                this.setupBgRemoveLogic();
                break;
            case 'voiceover':
                body.innerHTML = this.getVoiceoverUI();
                this.setupVoiceoverLogic();
                break;
            case 'enhance':
                body.innerHTML = this.getEnhanceUI();
                this.setupEnhanceLogic();
                break;
            case 'music':
                body.innerHTML = this.getMusicUI();
                this.setupMusicLogic();
                break;
        }

        modal.classList.remove('hidden');

        modal.querySelector('.modal-overlay')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        modal.querySelector('.modal-close')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    },

    // Auto Captions UI
    getCaptionsUI() {
        return `
            <h2><i class="fas fa-closed-captioning" style="color:var(--accent-primary)"></i> Auto Captions</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate captions from your video's audio automatically
            </p>
            <div class="form-group">
                <label>Language</label>
                <select id="caption-language" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="pt">Portuguese</option>
                    <option value="zh">Chinese</option>
                    <option value="ar">Arabic</option>
                </select>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Caption Style</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <button class="caption-style-btn active" data-style="classic" 
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--accent-primary);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Classic</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">White text, black bg</div>
                    </button>
                    <button class="caption-style-btn" data-style="modern"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Modern</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Word highlight</div>
                    </button>
                    <button class="caption-style-btn" data-style="karaoke"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Karaoke</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Color fill effect</div>
                    </button>
                    <button class="caption-style-btn" data-style="minimal"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Minimal</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Clean, no background</div>
                    </button>
                </div>
            </div>
            <div id="caption-progress" style="display:none;margin-top:20px;">
                <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;">
                    <div id="caption-progress-bar" style="width:0%;height:100%;background:linear-gradient(90deg,var(--accent-primary),var(--accent-green));transition:width 0.3s;border-radius:2px;"></div>
                </div>
                <p id="caption-status" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-muted);">Analyzing audio...</p>
            </div>
            <div id="caption-results" style="display:none;margin-top:20px;max-height:200px;overflow-y:auto;"></div>
            <button class="primary-btn full-width" id="generate-captions-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Generate Captions
            </button>
        `;
    },

    setupCaptionsLogic() {
        // Style selection
        document.querySelectorAll('.caption-style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.caption-style-btn').forEach(b => {
                    b.style.borderColor = 'var(--border-color)';
                    b.classList.remove('active');
                });
                btn.style.borderColor = 'var(--accent-primary)';
                btn.classList.add('active');
            });
        });

        document.getElementById('generate-captions-btn')?.addEventListener('click', () => {
            this.generateCaptions();
        });
    },

    async generateCaptions() {
        const progress = document.getElementById('caption-progress');
        const progressBar = document.getElementById('caption-progress-bar');
        const status = document.getElementById('caption-status');
        const results = document.getElementById('caption-results');
        const btn = document.getElementById('generate-captions-btn');

        if (!progress || !btn) return;

        if (!VideoEditor.videoElement?.src) {
            app.showToast('Please upload a video first', 'warning');
            return;
        }

        progress.style.display = 'block';
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Simulate AI caption generation with Web Speech API or demo
        const steps = [
            { progress: 20, text: 'Extracting audio...' },
            { progress: 40, text: 'Analyzing speech...' },
            { progress: 60, text: 'Generating transcription...' },
            { progress: 80, text: 'Timing captions...' },
            { progress: 100, text: 'Done!' }
        ];

        for (const step of steps) {
            await this.delay(800);
            progressBar.style.width = step.progress + '%';
            status.textContent = step.text;
        }

        // Generate demo captions
        const captions = this.generateDemoCaptions();

        results.style.display = 'block';
        results.innerHTML = `
            <h4 style="margin-bottom:12px;">Generated Captions (${captions.length})</h4>
            ${captions.map((c, i) => `
                <div style="padding:8px 12px;background:var(--bg-card);border-radius:6px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:13px;">"${c.text}"</span>
                    <span style="font-size:11px;color:var(--text-muted);">${c.start.toFixed(1)}s - ${c.end.toFixed(1)}s</span>
                </div>
            `).join('')}
        `;

        btn.innerHTML = '<i class="fas fa-check"></i> Apply Captions';
        btn.disabled = false;
        btn.onclick = () => {
            captions.forEach(c => {
                const style = document.querySelector('.caption-style-btn.active')?.dataset.style || 'classic';
                const styles = {
                    classic: { color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.7)', fontSize: 24 },
                    modern: { color: '#ffffff', fontSize: 28, fontWeight: '700' },
                    karaoke: { color: '#ffff00', fontSize: 26, fontWeight: '600' },
                    minimal: { color: '#ffffff', fontSize: 22, fontWeight: '400' }
                };

                VideoEditor.addTextOverlay({
                    content: c.text,
                    startTime: c.start,
                    endTime: c.end,
                    position: { x: 50, y: 85 },
                    ...styles[style]
                });
            });

            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast(`${captions.length} captions added!`, 'success');
        };
    },

    generateDemoCaptions() {
        const duration = VideoEditor.duration || 30;
        const texts = [
            "Hey everyone, welcome back",
            "Today we're going to show you",
            "Something really amazing",
            "Let's get started",
            "First, let me show you this",
            "Pretty cool, right?",
            "And that's basically it",
            "Thanks for watching!"
        ];

        const segmentDuration = duration / Math.min(texts.length, Math.ceil(duration / 3));
        return texts.slice(0, Math.ceil(duration / 3)).map((text, i) => ({
            text,
            start: i * segmentDuration,
            end: (i + 1) * segmentDuration - 0.2
        }));
    },

    // Beat Sync UI
    getBeatSyncUI() {
        return `
            <h2><i class="fas fa-heartbeat" style="color:var(--accent-pink)"></i> Beat Sync</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Automatically sync your video cuts to the beats of your music
            </p>
            <div class="form-group">
                <label>Music Source</label>
                <div style="display:flex;gap:8px;">
                    <button class="secondary-btn" id="upload-music-btn" style="flex:1;">
                        <i class="fas fa-upload"></i> Upload Music
                    </button>
                    <input type="file" id="music-file-input" accept="audio/*" hidden>
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>BPM (Beats Per Minute)</label>
                <div style="display:flex;align-items:center;gap:12px;">
                    <input type="range" id="bpm-slider" min="60" max="200" value="128" 
                           style="flex:1;accent-color:var(--accent-primary);">
                    <span id="bpm-value" style="min-width:40px;text-align:center;">128</span>
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Sync Style</label>
                <select id="sync-style" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="cut">Cut on beat</option>
                    <option value="zoom">Zoom pulse</option>
                    <option value="flash">Flash on beat</option>
                    <option value="shake">Screen shake</option>
                </select>
            </div>
            <button class="primary-btn full-width" id="apply-beat-sync-btn" style="margin-top:20px;">
                <i class="fas fa-sync"></i> Sync to Beats
            </button>
        `;
    },

    setupBeatSyncLogic() {
        const bpmSlider = document.getElementById('bpm-slider');
        const bpmValue = document.getElementById('bpm-value');

        if (bpmSlider && bpmValue) {
            bpmSlider.addEventListener('input', () => {
                bpmValue.textContent = bpmSlider.value;
            });
        }

        document.getElementById('upload-music-btn')?.addEventListener('click', () => {
            document.getElementById('music-file-input')?.click();
        });

        document.getElementById('music-file-input')?.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                app.showToast('Music file loaded: ' + e.target.files[0].name, 'success');
            }
        });

        document.getElementById('apply-beat-sync-btn')?.addEventListener('click', () => {
            this.applyBeatSync();
        });
    },

    async applyBeatSync() {
        const bpm = parseInt(document.getElementById('bpm-slider')?.value || 128);
        const style = document.getElementById('sync-style')?.value || 'cut';

        if (!VideoEditor.videoElement?.src) {
            app.showToast('Please upload a video first', 'warning');
            return;
        }

        app.showLoading('Syncing beats...');

        const beatInterval = 60 / bpm;
        const duration = VideoEditor.duration;
        const beats = [];

        for (let t = 0; t < duration; t += beatInterval) {
            beats.push(t);
        }

        await this.delay(1500);

        // Apply beat markers as text overlays with flash effect
        if (style === 'flash' || style === 'zoom') {
            beats.forEach((beat, i) => {
                if (i % 4 === 0) { // Every 4th beat
                    VideoEditor.addTextOverlay({
                        content: '●',
                        startTime: beat,
                        endTime: beat + 0.1,
                        position: { x: 50, y: 50 },
                        fontSize: 200,
                        color: 'rgba(255,255,255,0.5)',
                        animation: 'zoom_in'
                    });
                }
            });
        }

        app.hideLoading();
        document.getElementById('ai-modal')?.classList.add('hidden');
        app.showToast(`Beat synced! ${beats.length} beats at ${bpm} BPM`, 'success');
    },

    // Background Remove UI
    getBgRemoveUI() {
        return `
            <h2><i class="fas fa-eraser" style="color:var(--accent-green)"></i> Background Remover</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Remove the background from your video using AI segmentation
            </p>
            <div style="padding:24px;background:var(--bg-card);border-radius:12px;text-align:center;margin-bottom:20px;">
                <i class="fas fa-image" style="font-size:48px;color:var(--accent-primary);margin-bottom:12px;"></i>
                <p style="color:var(--text-secondary);margin-bottom:12px;">
                    AI will detect the subject and remove the background
                </p>
                <p style="font-size:12px;color:var(--text-muted);">
                    Works best with single subjects and solid backgrounds
                </p>
            </div>
            <div class="form-group">
                <label>Replacement Background</label>
                <select id="bg-replacement" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="transparent">Transparent</option>
                    <option value="blur">Blurred Original</option>
                    <option value="color">Solid Color</option>
                    <option value="gradient">Gradient</option>
                </select>
            </div>
            <div class="form-group" style="margin-top:12px;" id="bg-color-group">
                <label>Background Color</label>
                <input type="color" id="bg-color-picker" value="#00ff00" 
                       style="width:100%;height:40px;cursor:pointer;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;">
            </div>
            <button class="primary-btn full-width" id="remove-bg-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Remove Background
            </button>
        `;
    },

    setupBgRemoveLogic() {
        document.getElementById('remove-bg-btn')?.addEventListener('click', async () => {
            if (!VideoEditor.videoElement?.src) {
                app.showToast('Please upload a video first', 'warning');
                return;
            }

            app.showLoading('Removing background...');
            await this.delay(2000);

            // Apply a green screen-like filter as demo
            VideoEditor.applyFilter('high_contrast');
            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('Background removal applied (demo mode)', 'success');
        });
    },

    // AI Voiceover UI
    getVoiceoverUI() {
        return `
            <h2><i class="fas fa-microphone-alt" style="color:var(--accent-orange)"></i> AI Voiceover</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate natural-sounding narration from text
            </p>
            <div class="form-group">
                <label>Script</label>
                <textarea id="voiceover-text" placeholder="Enter the text you want to convert to speech..."
                          style="padding:12px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;min-height:120px;resize:vertical;font-family:inherit;font-size:14px;"></textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;">
                <div class="form-group">
                    <label>Voice</label>
                    <select id="voice-select" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                        <option value="female1">Sarah (Female)</option>
                        <option value="male1">James (Male)</option>
                        <option value="female2">Emma (Female)</option>
                        <option value="male2">David (Male)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Speed</label>
                    <select id="voice-speed" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                        <option value="0.75">Slow</option>
                        <option value="1" selected>Normal</option>
                        <option value="1.25">Fast</option>
                        <option value="1.5">Very Fast</option>
                    </select>
                </div>
            </div>
            <button class="primary-btn full-width" id="generate-voice-btn" style="margin-top:20px;">
                <i class="fas fa-play"></i> Generate & Preview
            </button>
        `;
    },

    setupVoiceoverLogic() {
        document.getElementById('generate-voice-btn')?.addEventListener('click', () => {
            this.generateVoiceover();
        });
    },

    async generateVoiceover() {
        const text = document.getElementById('voiceover-text')?.value;
        if (!text) {
            app.showToast('Please enter some text', 'warning');
            return;
        }

        const speed = parseFloat(document.getElementById('voice-speed')?.value || 1);
        const btn = document.getElementById('generate-voice-btn');

        // Use Web Speech API for browser-based TTS
        if ('speechSynthesis' in window) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            btn.disabled = true;

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = speed;

            const voices = speechSynthesis.getVoices();
            const voiceSelect = document.getElementById('voice-select')?.value;
            if (voiceSelect?.includes('female')) {
                const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
                if (femaleVoice) utterance.voice = femaleVoice;
            }

            utterance.onend = () => {
                btn.innerHTML = '<i class="fas fa-check"></i> Add to Timeline';
                btn.disabled = false;
                btn.onclick = () => {
                    // Add as text overlay showing the narration
                    VideoEditor.addTextOverlay({
                        content: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
                        startTime: VideoEditor.currentTime,
                        endTime: VideoEditor.currentTime + text.length * 0.1,
                        position: { x: 50, y: 90 },
                        fontSize: 20,
                        color: '#ffffff',
                        bgColor: 'rgba(0,0,0,0.6)'
                    });
                    document.getElementById('ai-modal')?.classList.add('hidden');
                    app.showToast('Voiceover added to timeline!', 'success');
                };
            };

            speechSynthesis.speak(utterance);
            app.showToast('Playing voiceover preview...', 'info');
        } else {
            app.showToast('Speech synthesis not supported in this browser', 'error');
        }
    },

    // Auto Enhance UI
    getEnhanceUI() {
        return `
            <h2><i class="fas fa-magic" style="color:var(--accent-yellow)"></i> Auto Enhance</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                AI will analyze your video and improve quality automatically
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-sun" style="font-size:24px;color:var(--accent-yellow);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Brightness</div>
                    <div style="font-size:12px;color:var(--text-muted);">Auto adjust</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-adjust" style="font-size:24px;color:var(--accent-cyan);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Contrast</div>
                    <div style="font-size:12px;color:var(--text-muted);">Auto adjust</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-palette" style="font-size:24px;color:var(--accent-pink);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Color</div>
                    <div style="font-size:12px;color:var(--text-muted);">Balance & vibrance</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-expand" style="font-size:24px;color:var(--accent-green);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Sharpness</div>
                    <div style="font-size:12px;color:var(--text-muted);">Edge enhancement</div>
                </div>
            </div>
            <div class="form-group" style="margin-top:20px;">
                <label>Enhancement Strength</label>
                <input type="range" id="enhance-strength" min="0" max="100" value="70"
                       style="width:100%;accent-color:var(--accent-primary);">
                <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);">
                    <span>Subtle</span><span>Strong</span>
                </div>
            </div>
            <button class="primary-btn full-width" id="apply-enhance-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Enhance Video
            </button>
        `;
    },

    setupEnhanceLogic() {
        document.getElementById('apply-enhance-btn')?.addEventListener('click', async () => {
            if (!VideoEditor.videoElement?.src) {
                app.showToast('Please upload a video first', 'warning');
                return;
            }

            app.showLoading('Enhancing video...');
            await this.delay(2000);

            const strength = parseInt(document.getElementById('enhance-strength')?.value || 70);
            const filterStrength = strength / 100;

            const video = VideoEditor.videoElement;
            video.style.filter = `brightness(${1 + filterStrength * 0.1}) contrast(${1 + filterStrength * 0.15}) saturate(${1 + filterStrength * 0.2})`;

            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('Video enhanced!', 'success');
        });
    },

    // AI Music UI
    getMusicUI() {
        return `
            <h2><i class="fas fa-guitar" style="color:var(--accent-secondary)"></i> AI Music</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate royalty-free background music
            </p>
            <div class="form-group">
                <label>Mood</label>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                    ${['Happy', 'Energetic', 'Calm', 'Dramatic', 'Romantic', 'Dark'].map(mood => `
                        <button class="mood-btn" data-mood="${mood.toLowerCase()}"
                                style="padding:10px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-secondary);cursor:pointer;font-size:13px;transition:all 0.2s;">
                            ${mood}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Duration: <span id="music-duration-val">${Math.round(VideoEditor.duration || 30)}s</span></label>
                <input type="range" id="music-duration" min="5" max="180" 
                       value="${Math.round(VideoEditor.duration || 30)}"
                       style="width:100%;accent-color:var(--accent-primary);">
            </div>
            <button class="primary-btn full-width" id="generate-music-btn" style="margin-top:20px;">
                <i class="fas fa-music"></i> Generate Music
            </button>
        `;
    },

    setupMusicLogic() {
        // Mood selection
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => {
                    b.style.borderColor = 'var(--border-color)';
                    b.style.background = 'var(--bg-card)';
                });
                btn.style.borderColor = 'var(--accent-primary)';
                btn.style.background = 'var(--bg-hover)';
            });
        });

        // Duration slider
        const durationSlider = document.getElementById('music-duration');
        const durationVal = document.getElementById('music-duration-val');
        if (durationSlider && durationVal) {
            durationSlider.addEventListener('input', () => {
                durationVal.textContent = durationSlider.value + 's';
            });
        }

        document.getElementById('generate-music-btn')?.addEventListener('click', async () => {
            app.showLoading('Generating music...');
            await this.delay(3000);

            // Create a simple audio track entry
            const audioTrack = {
                id: 'audio_ai_' + Date.now(),
                name: 'AI Generated Music',
                startTime: 0,
                duration: parseInt(document.getElementById('music-duration')?.value || 30),
                trimStart: 0,
                trimEnd: parseInt(document.getElementById('music-duration')?.value || 30),
                volume: 0.5,
                type: 'audio'
            };

            VideoEditor.audioTracks.push(audioTrack);
            VideoEditor.renderTimeline();

            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('AI music track added!', 'success');
        });
    },

    // Helper delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};/**
 * VideoForge - AI Features
 */

const AIFeatures = {

    // Open AI tool
    openTool(toolType) {
        const modal = document.getElementById('ai-modal');
        const body = document.getElementById('ai-modal-body');
        if (!modal || !body) return;

        switch (toolType) {
            case 'captions':
                body.innerHTML = this.getCaptionsUI();
                this.setupCaptionsLogic();
                break;
            case 'beatSync':
                body.innerHTML = this.getBeatSyncUI();
                this.setupBeatSyncLogic();
                break;
            case 'bgRemove':
                body.innerHTML = this.getBgRemoveUI();
                this.setupBgRemoveLogic();
                break;
            case 'voiceover':
                body.innerHTML = this.getVoiceoverUI();
                this.setupVoiceoverLogic();
                break;
            case 'enhance':
                body.innerHTML = this.getEnhanceUI();
                this.setupEnhanceLogic();
                break;
            case 'music':
                body.innerHTML = this.getMusicUI();
                this.setupMusicLogic();
                break;
        }

        modal.classList.remove('hidden');

        modal.querySelector('.modal-overlay')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        modal.querySelector('.modal-close')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    },

    // Auto Captions UI
    getCaptionsUI() {
        return `
            <h2><i class="fas fa-closed-captioning" style="color:var(--accent-primary)"></i> Auto Captions</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate captions from your video's audio automatically
            </p>
            <div class="form-group">
                <label>Language</label>
                <select id="caption-language" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="pt">Portuguese</option>
                    <option value="zh">Chinese</option>
                    <option value="ar">Arabic</option>
                </select>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Caption Style</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <button class="caption-style-btn active" data-style="classic" 
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--accent-primary);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Classic</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">White text, black bg</div>
                    </button>
                    <button class="caption-style-btn" data-style="modern"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Modern</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Word highlight</div>
                    </button>
                    <button class="caption-style-btn" data-style="karaoke"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Karaoke</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Color fill effect</div>
                    </button>
                    <button class="caption-style-btn" data-style="minimal"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Minimal</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Clean, no background</div>
                    </button>
                </div>
            </div>
            <div id="caption-progress" style="display:none;margin-top:20px;">
                <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;">
                    <div id="caption-progress-bar" style="width:0%;height:100%;background:linear-gradient(90deg,var(--accent-primary),var(--accent-green));transition:width 0.3s;border-radius:2px;"></div>
                </div>
                <p id="caption-status" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-muted);">Analyzing audio...</p>
            </div>
            <div id="caption-results" style="display:none;margin-top:20px;max-height:200px;overflow-y:auto;"></div>
            <button class="primary-btn full-width" id="generate-captions-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Generate Captions
            </button>
        `;
    },

    setupCaptionsLogic() {
        // Style selection
        document.querySelectorAll('.caption-style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.caption-style-btn').forEach(b => {
                    b.style.borderColor = 'var(--border-color)';
                    b.classList.remove('active');
                });
                btn.style.borderColor = 'var(--accent-primary)';
                btn.classList.add('active');
            });
        });

        document.getElementById('generate-captions-btn')?.addEventListener('click', () => {
            this.generateCaptions();
        });
    },

    async generateCaptions() {
        const progress = document.getElementById('caption-progress');
        const progressBar = document.getElementById('caption-progress-bar');
        const status = document.getElementById('caption-status');
        const results = document.getElementById('caption-results');
        const btn = document.getElementById('generate-captions-btn');

        if (!progress || !btn) return;

        if (!VideoEditor.videoElement?.src) {
            app.showToast('Please upload a video first', 'warning');
            return;
        }

        progress.style.display = 'block';
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Simulate AI caption generation with Web Speech API or demo
        const steps = [
            { progress: 20, text: 'Extracting audio...' },
            { progress: 40, text: 'Analyzing speech...' },
            { progress: 60, text: 'Generating transcription...' },
            { progress: 80, text: 'Timing captions...' },
            { progress: 100, text: 'Done!' }
        ];

        for (const step of steps) {
            await this.delay(800);
            progressBar.style.width = step.progress + '%';
            status.textContent = step.text;
        }

        // Generate demo captions
        const captions = this.generateDemoCaptions();

        results.style.display = 'block';
        results.innerHTML = `
            <h4 style="margin-bottom:12px;">Generated Captions (${captions.length})</h4>
            ${captions.map((c, i) => `
                <div style="padding:8px 12px;background:var(--bg-card);border-radius:6px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:13px;">"${c.text}"</span>
                    <span style="font-size:11px;color:var(--text-muted);">${c.start.toFixed(1)}s - ${c.end.toFixed(1)}s</span>
                </div>
            `).join('')}
        `;

        btn.innerHTML = '<i class="fas fa-check"></i> Apply Captions';
        btn.disabled = false;
        btn.onclick = () => {
            captions.forEach(c => {
                const style = document.querySelector('.caption-style-btn.active')?.dataset.style || 'classic';
                const styles = {
                    classic: { color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.7)', fontSize: 24 },
                    modern: { color: '#ffffff', fontSize: 28, fontWeight: '700' },
                    karaoke: { color: '#ffff00', fontSize: 26, fontWeight: '600' },
                    minimal: { color: '#ffffff', fontSize: 22, fontWeight: '400' }
                };

                VideoEditor.addTextOverlay({
                    content: c.text,
                    startTime: c.start,
                    endTime: c.end,
                    position: { x: 50, y: 85 },
                    ...styles[style]
                });
            });

            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast(`${captions.length} captions added!`, 'success');
        };
    },

    generateDemoCaptions() {
        const duration = VideoEditor.duration || 30;
        const texts = [
            "Hey everyone, welcome back",
            "Today we're going to show you",
            "Something really amazing",
            "Let's get started",
            "First, let me show you this",
            "Pretty cool, right?",
            "And that's basically it",
            "Thanks for watching!"
        ];

        const segmentDuration = duration / Math.min(texts.length, Math.ceil(duration / 3));
        return texts.slice(0, Math.ceil(duration / 3)).map((text, i) => ({
            text,
            start: i * segmentDuration,
            end: (i + 1) * segmentDuration - 0.2
        }));
    },

    // Beat Sync UI
    getBeatSyncUI() {
        return `
            <h2><i class="fas fa-heartbeat" style="color:var(--accent-pink)"></i> Beat Sync</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Automatically sync your video cuts to the beats of your music
            </p>
            <div class="form-group">
                <label>Music Source</label>
                <div style="display:flex;gap:8px;">
                    <button class="secondary-btn" id="upload-music-btn" style="flex:1;">
                        <i class="fas fa-upload"></i> Upload Music
                    </button>
                    <input type="file" id="music-file-input" accept="audio/*" hidden>
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>BPM (Beats Per Minute)</label>
                <div style="display:flex;align-items:center;gap:12px;">
                    <input type="range" id="bpm-slider" min="60" max="200" value="128" 
                           style="flex:1;accent-color:var(--accent-primary);">
                    <span id="bpm-value" style="min-width:40px;text-align:center;">128</span>
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Sync Style</label>
                <select id="sync-style" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="cut">Cut on beat</option>
                    <option value="zoom">Zoom pulse</option>
                    <option value="flash">Flash on beat</option>
                    <option value="shake">Screen shake</option>
                </select>
            </div>
            <button class="primary-btn full-width" id="apply-beat-sync-btn" style="margin-top:20px;">
                <i class="fas fa-sync"></i> Sync to Beats
            </button>
        `;
    },

    setupBeatSyncLogic() {
        const bpmSlider = document.getElementById('bpm-slider');
        const bpmValue = document.getElementById('bpm-value');

        if (bpmSlider && bpmValue) {
            bpmSlider.addEventListener('input', () => {
                bpmValue.textContent = bpmSlider.value;
            });
        }

        document.getElementById('upload-music-btn')?.addEventListener('click', () => {
            document.getElementById('music-file-input')?.click();
        });

        document.getElementById('music-file-input')?.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                app.showToast('Music file loaded: ' + e.target.files[0].name, 'success');
            }
        });

        document.getElementById('apply-beat-sync-btn')?.addEventListener('click', () => {
            this.applyBeatSync();
        });
    },

    async applyBeatSync() {
        const bpm = parseInt(document.getElementById('bpm-slider')?.value || 128);
        const style = document.getElementById('sync-style')?.value || 'cut';

        if (!VideoEditor.videoElement?.src) {
            app.showToast('Please upload a video first', 'warning');
            return;
        }

        app.showLoading('Syncing beats...');

        const beatInterval = 60 / bpm;
        const duration = VideoEditor.duration;
        const beats = [];

        for (let t = 0; t < duration; t += beatInterval) {
            beats.push(t);
        }

        await this.delay(1500);

        // Apply beat markers as text overlays with flash effect
        if (style === 'flash' || style === 'zoom') {
            beats.forEach((beat, i) => {
                if (i % 4 === 0) { // Every 4th beat
                    VideoEditor.addTextOverlay({
                        content: '●',
                        startTime: beat,
                        endTime: beat + 0.1,
                        position: { x: 50, y: 50 },
                        fontSize: 200,
                        color: 'rgba(255,255,255,0.5)',
                        animation: 'zoom_in'
                    });
                }
            });
        }

        app.hideLoading();
        document.getElementById('ai-modal')?.classList.add('hidden');
        app.showToast(`Beat synced! ${beats.length} beats at ${bpm} BPM`, 'success');
    },

    // Background Remove UI
    getBgRemoveUI() {
        return `
            <h2><i class="fas fa-eraser" style="color:var(--accent-green)"></i> Background Remover</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Remove the background from your video using AI segmentation
            </p>
            <div style="padding:24px;background:var(--bg-card);border-radius:12px;text-align:center;margin-bottom:20px;">
                <i class="fas fa-image" style="font-size:48px;color:var(--accent-primary);margin-bottom:12px;"></i>
                <p style="color:var(--text-secondary);margin-bottom:12px;">
                    AI will detect the subject and remove the background
                </p>
                <p style="font-size:12px;color:var(--text-muted);">
                    Works best with single subjects and solid backgrounds
                </p>
            </div>
            <div class="form-group">
                <label>Replacement Background</label>
                <select id="bg-replacement" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="transparent">Transparent</option>
                    <option value="blur">Blurred Original</option>
                    <option value="color">Solid Color</option>
                    <option value="gradient">Gradient</option>
                </select>
            </div>
            <div class="form-group" style="margin-top:12px;" id="bg-color-group">
                <label>Background Color</label>
                <input type="color" id="bg-color-picker" value="#00ff00" 
                       style="width:100%;height:40px;cursor:pointer;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;">
            </div>
            <button class="primary-btn full-width" id="remove-bg-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Remove Background
            </button>
        `;
    },

    setupBgRemoveLogic() {
        document.getElementById('remove-bg-btn')?.addEventListener('click', async () => {
            if (!VideoEditor.videoElement?.src) {
                app.showToast('Please upload a video first', 'warning');
                return;
            }

            app.showLoading('Removing background...');
            await this.delay(2000);

            // Apply a green screen-like filter as demo
            VideoEditor.applyFilter('high_contrast');
            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('Background removal applied (demo mode)', 'success');
        });
    },

    // AI Voiceover UI
    getVoiceoverUI() {
        return `
            <h2><i class="fas fa-microphone-alt" style="color:var(--accent-orange)"></i> AI Voiceover</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate natural-sounding narration from text
            </p>
            <div class="form-group">
                <label>Script</label>
                <textarea id="voiceover-text" placeholder="Enter the text you want to convert to speech..."
                          style="padding:12px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;min-height:120px;resize:vertical;font-family:inherit;font-size:14px;"></textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;">
                <div class="form-group">
                    <label>Voice</label>
                    <select id="voice-select" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                        <option value="female1">Sarah (Female)</option>
                        <option value="male1">James (Male)</option>
                        <option value="female2">Emma (Female)</option>
                        <option value="male2">David (Male)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Speed</label>
                    <select id="voice-speed" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                        <option value="0.75">Slow</option>
                        <option value="1" selected>Normal</option>
                        <option value="1.25">Fast</option>
                        <option value="1.5">Very Fast</option>
                    </select>
                </div>
            </div>
            <button class="primary-btn full-width" id="generate-voice-btn" style="margin-top:20px;">
                <i class="fas fa-play"></i> Generate & Preview
            </button>
        `;
    },

    setupVoiceoverLogic() {
        document.getElementById('generate-voice-btn')?.addEventListener('click', () => {
            this.generateVoiceover();
        });
    },

    async generateVoiceover() {
        const text = document.getElementById('voiceover-text')?.value;
        if (!text) {
            app.showToast('Please enter some text', 'warning');
            return;
        }

        const speed = parseFloat(document.getElementById('voice-speed')?.value || 1);
        const btn = document.getElementById('generate-voice-btn');

        // Use Web Speech API for browser-based TTS
        if ('speechSynthesis' in window) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            btn.disabled = true;

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = speed;

            const voices = speechSynthesis.getVoices();
            const voiceSelect = document.getElementById('voice-select')?.value;
            if (voiceSelect?.includes('female')) {
                const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
                if (femaleVoice) utterance.voice = femaleVoice;
            }

            utterance.onend = () => {
                btn.innerHTML = '<i class="fas fa-check"></i> Add to Timeline';
                btn.disabled = false;
                btn.onclick = () => {
                    // Add as text overlay showing the narration
                    VideoEditor.addTextOverlay({
                        content: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
                        startTime: VideoEditor.currentTime,
                        endTime: VideoEditor.currentTime + text.length * 0.1,
                        position: { x: 50, y: 90 },
                        fontSize: 20,
                        color: '#ffffff',
                        bgColor: 'rgba(0,0,0,0.6)'
                    });
                    document.getElementById('ai-modal')?.classList.add('hidden');
                    app.showToast('Voiceover added to timeline!', 'success');
                };
            };

            speechSynthesis.speak(utterance);
            app.showToast('Playing voiceover preview...', 'info');
        } else {
            app.showToast('Speech synthesis not supported in this browser', 'error');
        }
    },

    // Auto Enhance UI
    getEnhanceUI() {
        return `
            <h2><i class="fas fa-magic" style="color:var(--accent-yellow)"></i> Auto Enhance</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                AI will analyze your video and improve quality automatically
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-sun" style="font-size:24px;color:var(--accent-yellow);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Brightness</div>
                    <div style="font-size:12px;color:var(--text-muted);">Auto adjust</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-adjust" style="font-size:24px;color:var(--accent-cyan);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Contrast</div>
                    <div style="font-size:12px;color:var(--text-muted);">Auto adjust</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-palette" style="font-size:24px;color:var(--accent-pink);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Color</div>
                    <div style="font-size:12px;color:var(--text-muted);">Balance & vibrance</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-expand" style="font-size:24px;color:var(--accent-green);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Sharpness</div>
                    <div style="font-size:12px;color:var(--text-muted);">Edge enhancement</div>
                </div>
            </div>
            <div class="form-group" style="margin-top:20px;">
                <label>Enhancement Strength</label>
                <input type="range" id="enhance-strength" min="0" max="100" value="70"
                       style="width:100%;accent-color:var(--accent-primary);">
                <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);">
                    <span>Subtle</span><span>Strong</span>
                </div>
            </div>
            <button class="primary-btn full-width" id="apply-enhance-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Enhance Video
            </button>
        `;
    },

    setupEnhanceLogic() {
        document.getElementById('apply-enhance-btn')?.addEventListener('click', async () => {
            if (!VideoEditor.videoElement?.src) {
                app.showToast('Please upload a video first', 'warning');
                return;
            }

            app.showLoading('Enhancing video...');
            await this.delay(2000);

            const strength = parseInt(document.getElementById('enhance-strength')?.value || 70);
            const filterStrength = strength / 100;

            const video = VideoEditor.videoElement;
            video.style.filter = `brightness(${1 + filterStrength * 0.1}) contrast(${1 + filterStrength * 0.15}) saturate(${1 + filterStrength * 0.2})`;

            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('Video enhanced!', 'success');
        });
    },

    // AI Music UI
    getMusicUI() {
        return `
            <h2><i class="fas fa-guitar" style="color:var(--accent-secondary)"></i> AI Music</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate royalty-free background music
            </p>
            <div class="form-group">
                <label>Mood</label>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                    ${['Happy', 'Energetic', 'Calm', 'Dramatic', 'Romantic', 'Dark'].map(mood => `
                        <button class="mood-btn" data-mood="${mood.toLowerCase()}"
                                style="padding:10px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-secondary);cursor:pointer;font-size:13px;transition:all 0.2s;">
                            ${mood}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Duration: <span id="music-duration-val">${Math.round(VideoEditor.duration || 30)}s</span></label>
                <input type="range" id="music-duration" min="5" max="180" 
                       value="${Math.round(VideoEditor.duration || 30)}"
                       style="width:100%;accent-color:var(--accent-primary);">
            </div>
            <button class="primary-btn full-width" id="generate-music-btn" style="margin-top:20px;">
                <i class="fas fa-music"></i> Generate Music
            </button>
        `;
    },

    setupMusicLogic() {
        // Mood selection
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => {
                    b.style.borderColor = 'var(--border-color)';
                    b.style.background = 'var(--bg-card)';
                });
                btn.style.borderColor = 'var(--accent-primary)';
                btn.style.background = 'var(--bg-hover)';
            });
        });

        // Duration slider
        const durationSlider = document.getElementById('music-duration');
        const durationVal = document.getElementById('music-duration-val');
        if (durationSlider && durationVal) {
            durationSlider.addEventListener('input', () => {
                durationVal.textContent = durationSlider.value + 's';
            });
        }

        document.getElementById('generate-music-btn')?.addEventListener('click', async () => {
            app.showLoading('Generating music...');
            await this.delay(3000);

            // Create a simple audio track entry
            const audioTrack = {
                id: 'audio_ai_' + Date.now(),
                name: 'AI Generated Music',
                startTime: 0,
                duration: parseInt(document.getElementById('music-duration')?.value || 30),
                trimStart: 0,
                trimEnd: parseInt(document.getElementById('music-duration')?.value || 30),
                volume: 0.5,
                type: 'audio'
            };

            VideoEditor.audioTracks.push(audioTrack);
            VideoEditor.renderTimeline();

            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('AI music track added!', 'success');
        });
    },

    // Helper delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};/**
 * VideoForge - AI Features
 */

const AIFeatures = {

    // Open AI tool
    openTool(toolType) {
        const modal = document.getElementById('ai-modal');
        const body = document.getElementById('ai-modal-body');
        if (!modal || !body) return;

        switch (toolType) {
            case 'captions':
                body.innerHTML = this.getCaptionsUI();
                this.setupCaptionsLogic();
                break;
            case 'beatSync':
                body.innerHTML = this.getBeatSyncUI();
                this.setupBeatSyncLogic();
                break;
            case 'bgRemove':
                body.innerHTML = this.getBgRemoveUI();
                this.setupBgRemoveLogic();
                break;
            case 'voiceover':
                body.innerHTML = this.getVoiceoverUI();
                this.setupVoiceoverLogic();
                break;
            case 'enhance':
                body.innerHTML = this.getEnhanceUI();
                this.setupEnhanceLogic();
                break;
            case 'music':
                body.innerHTML = this.getMusicUI();
                this.setupMusicLogic();
                break;
        }

        modal.classList.remove('hidden');

        modal.querySelector('.modal-overlay')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        modal.querySelector('.modal-close')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    },

    // Auto Captions UI
    getCaptionsUI() {
        return `
            <h2><i class="fas fa-closed-captioning" style="color:var(--accent-primary)"></i> Auto Captions</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate captions from your video's audio automatically
            </p>
            <div class="form-group">
                <label>Language</label>
                <select id="caption-language" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="pt">Portuguese</option>
                    <option value="zh">Chinese</option>
                    <option value="ar">Arabic</option>
                </select>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Caption Style</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <button class="caption-style-btn active" data-style="classic" 
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--accent-primary);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Classic</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">White text, black bg</div>
                    </button>
                    <button class="caption-style-btn" data-style="modern"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Modern</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Word highlight</div>
                    </button>
                    <button class="caption-style-btn" data-style="karaoke"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Karaoke</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Color fill effect</div>
                    </button>
                    <button class="caption-style-btn" data-style="minimal"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Minimal</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Clean, no background</div>
                    </button>
                </div>
            </div>
            <div id="caption-progress" style="display:none;margin-top:20px;">
                <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;">
                    <div id="caption-progress-bar" style="width:0%;height:100%;background:linear-gradient(90deg,var(--accent-primary),var(--accent-green));transition:width 0.3s;border-radius:2px;"></div>
                </div>
                <p id="caption-status" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-muted);">Analyzing audio...</p>
            </div>
            <div id="caption-results" style="display:none;margin-top:20px;max-height:200px;overflow-y:auto;"></div>
            <button class="primary-btn full-width" id="generate-captions-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Generate Captions
            </button>
        `;
    },

    setupCaptionsLogic() {
        // Style selection
        document.querySelectorAll('.caption-style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.caption-style-btn').forEach(b => {
                    b.style.borderColor = 'var(--border-color)';
                    b.classList.remove('active');
                });
                btn.style.borderColor = 'var(--accent-primary)';
                btn.classList.add('active');
            });
        });

        document.getElementById('generate-captions-btn')?.addEventListener('click', () => {
            this.generateCaptions();
        });
    },

    async generateCaptions() {
        const progress = document.getElementById('caption-progress');
        const progressBar = document.getElementById('caption-progress-bar');
        const status = document.getElementById('caption-status');
        const results = document.getElementById('caption-results');
        const btn = document.getElementById('generate-captions-btn');

        if (!progress || !btn) return;

        if (!VideoEditor.videoElement?.src) {
            app.showToast('Please upload a video first', 'warning');
            return;
        }

        progress.style.display = 'block';
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Simulate AI caption generation with Web Speech API or demo
        const steps = [
            { progress: 20, text: 'Extracting audio...' },
            { progress: 40, text: 'Analyzing speech...' },
            { progress: 60, text: 'Generating transcription...' },
            { progress: 80, text: 'Timing captions...' },
            { progress: 100, text: 'Done!' }
        ];

        for (const step of steps) {
            await this.delay(800);
            progressBar.style.width = step.progress + '%';
            status.textContent = step.text;
        }

        // Generate demo captions
        const captions = this.generateDemoCaptions();

        results.style.display = 'block';
        results.innerHTML = `
            <h4 style="margin-bottom:12px;">Generated Captions (${captions.length})</h4>
            ${captions.map((c, i) => `
                <div style="padding:8px 12px;background:var(--bg-card);border-radius:6px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:13px;">"${c.text}"</span>
                    <span style="font-size:11px;color:var(--text-muted);">${c.start.toFixed(1)}s - ${c.end.toFixed(1)}s</span>
                </div>
            `).join('')}
        `;

        btn.innerHTML = '<i class="fas fa-check"></i> Apply Captions';
        btn.disabled = false;
        btn.onclick = () => {
            captions.forEach(c => {
                const style = document.querySelector('.caption-style-btn.active')?.dataset.style || 'classic';
                const styles = {
                    classic: { color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.7)', fontSize: 24 },
                    modern: { color: '#ffffff', fontSize: 28, fontWeight: '700' },
                    karaoke: { color: '#ffff00', fontSize: 26, fontWeight: '600' },
                    minimal: { color: '#ffffff', fontSize: 22, fontWeight: '400' }
                };

                VideoEditor.addTextOverlay({
                    content: c.text,
                    startTime: c.start,
                    endTime: c.end,
                    position: { x: 50, y: 85 },
                    ...styles[style]
                });
            });

            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast(`${captions.length} captions added!`, 'success');
        };
    },

    generateDemoCaptions() {
        const duration = VideoEditor.duration || 30;
        const texts = [
            "Hey everyone, welcome back",
            "Today we're going to show you",
            "Something really amazing",
            "Let's get started",
            "First, let me show you this",
            "Pretty cool, right?",
            "And that's basically it",
            "Thanks for watching!"
        ];

        const segmentDuration = duration / Math.min(texts.length, Math.ceil(duration / 3));
        return texts.slice(0, Math.ceil(duration / 3)).map((text, i) => ({
            text,
            start: i * segmentDuration,
            end: (i + 1) * segmentDuration - 0.2
        }));
    },

    // Beat Sync UI
    getBeatSyncUI() {
        return `
            <h2><i class="fas fa-heartbeat" style="color:var(--accent-pink)"></i> Beat Sync</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Automatically sync your video cuts to the beats of your music
            </p>
            <div class="form-group">
                <label>Music Source</label>
                <div style="display:flex;gap:8px;">
                    <button class="secondary-btn" id="upload-music-btn" style="flex:1;">
                        <i class="fas fa-upload"></i> Upload Music
                    </button>
                    <input type="file" id="music-file-input" accept="audio/*" hidden>
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>BPM (Beats Per Minute)</label>
                <div style="display:flex;align-items:center;gap:12px;">
                    <input type="range" id="bpm-slider" min="60" max="200" value="128" 
                           style="flex:1;accent-color:var(--accent-primary);">
                    <span id="bpm-value" style="min-width:40px;text-align:center;">128</span>
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Sync Style</label>
                <select id="sync-style" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="cut">Cut on beat</option>
                    <option value="zoom">Zoom pulse</option>
                    <option value="flash">Flash on beat</option>
                    <option value="shake">Screen shake</option>
                </select>
            </div>
            <button class="primary-btn full-width" id="apply-beat-sync-btn" style="margin-top:20px;">
                <i class="fas fa-sync"></i> Sync to Beats
            </button>
        `;
    },

    setupBeatSyncLogic() {
        const bpmSlider = document.getElementById('bpm-slider');
        const bpmValue = document.getElementById('bpm-value');

        if (bpmSlider && bpmValue) {
            bpmSlider.addEventListener('input', () => {
                bpmValue.textContent = bpmSlider.value;
            });
        }

        document.getElementById('upload-music-btn')?.addEventListener('click', () => {
            document.getElementById('music-file-input')?.click();
        });

        document.getElementById('music-file-input')?.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                app.showToast('Music file loaded: ' + e.target.files[0].name, 'success');
            }
        });

        document.getElementById('apply-beat-sync-btn')?.addEventListener('click', () => {
            this.applyBeatSync();
        });
    },

    async applyBeatSync() {
        const bpm = parseInt(document.getElementById('bpm-slider')?.value || 128);
        const style = document.getElementById('sync-style')?.value || 'cut';

        if (!VideoEditor.videoElement?.src) {
            app.showToast('Please upload a video first', 'warning');
            return;
        }

        app.showLoading('Syncing beats...');

        const beatInterval = 60 / bpm;
        const duration = VideoEditor.duration;
        const beats = [];

        for (let t = 0; t < duration; t += beatInterval) {
            beats.push(t);
        }

        await this.delay(1500);

        // Apply beat markers as text overlays with flash effect
        if (style === 'flash' || style === 'zoom') {
            beats.forEach((beat, i) => {
                if (i % 4 === 0) { // Every 4th beat
                    VideoEditor.addTextOverlay({
                        content: '●',
                        startTime: beat,
                        endTime: beat + 0.1,
                        position: { x: 50, y: 50 },
                        fontSize: 200,
                        color: 'rgba(255,255,255,0.5)',
                        animation: 'zoom_in'
                    });
                }
            });
        }

        app.hideLoading();
        document.getElementById('ai-modal')?.classList.add('hidden');
        app.showToast(`Beat synced! ${beats.length} beats at ${bpm} BPM`, 'success');
    },

    // Background Remove UI
    getBgRemoveUI() {
        return `
            <h2><i class="fas fa-eraser" style="color:var(--accent-green)"></i> Background Remover</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Remove the background from your video using AI segmentation
            </p>
            <div style="padding:24px;background:var(--bg-card);border-radius:12px;text-align:center;margin-bottom:20px;">
                <i class="fas fa-image" style="font-size:48px;color:var(--accent-primary);margin-bottom:12px;"></i>
                <p style="color:var(--text-secondary);margin-bottom:12px;">
                    AI will detect the subject and remove the background
                </p>
                <p style="font-size:12px;color:var(--text-muted);">
                    Works best with single subjects and solid backgrounds
                </p>
            </div>
            <div class="form-group">
                <label>Replacement Background</label>
                <select id="bg-replacement" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="transparent">Transparent</option>
                    <option value="blur">Blurred Original</option>
                    <option value="color">Solid Color</option>
                    <option value="gradient">Gradient</option>
                </select>
            </div>
            <div class="form-group" style="margin-top:12px;" id="bg-color-group">
                <label>Background Color</label>
                <input type="color" id="bg-color-picker" value="#00ff00" 
                       style="width:100%;height:40px;cursor:pointer;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;">
            </div>
            <button class="primary-btn full-width" id="remove-bg-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Remove Background
            </button>
        `;
    },

    setupBgRemoveLogic() {
        document.getElementById('remove-bg-btn')?.addEventListener('click', async () => {
            if (!VideoEditor.videoElement?.src) {
                app.showToast('Please upload a video first', 'warning');
                return;
            }

            app.showLoading('Removing background...');
            await this.delay(2000);

            // Apply a green screen-like filter as demo
            VideoEditor.applyFilter('high_contrast');
            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('Background removal applied (demo mode)', 'success');
        });
    },

    // AI Voiceover UI
    getVoiceoverUI() {
        return `
            <h2><i class="fas fa-microphone-alt" style="color:var(--accent-orange)"></i> AI Voiceover</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate natural-sounding narration from text
            </p>
            <div class="form-group">
                <label>Script</label>
                <textarea id="voiceover-text" placeholder="Enter the text you want to convert to speech..."
                          style="padding:12px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;min-height:120px;resize:vertical;font-family:inherit;font-size:14px;"></textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;">
                <div class="form-group">
                    <label>Voice</label>
                    <select id="voice-select" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                        <option value="female1">Sarah (Female)</option>
                        <option value="male1">James (Male)</option>
                        <option value="female2">Emma (Female)</option>
                        <option value="male2">David (Male)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Speed</label>
                    <select id="voice-speed" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                        <option value="0.75">Slow</option>
                        <option value="1" selected>Normal</option>
                        <option value="1.25">Fast</option>
                        <option value="1.5">Very Fast</option>
                    </select>
                </div>
            </div>
            <button class="primary-btn full-width" id="generate-voice-btn" style="margin-top:20px;">
                <i class="fas fa-play"></i> Generate & Preview
            </button>
        `;
    },

    setupVoiceoverLogic() {
        document.getElementById('generate-voice-btn')?.addEventListener('click', () => {
            this.generateVoiceover();
        });
    },

    async generateVoiceover() {
        const text = document.getElementById('voiceover-text')?.value;
        if (!text) {
            app.showToast('Please enter some text', 'warning');
            return;
        }

        const speed = parseFloat(document.getElementById('voice-speed')?.value || 1);
        const btn = document.getElementById('generate-voice-btn');

        // Use Web Speech API for browser-based TTS
        if ('speechSynthesis' in window) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            btn.disabled = true;

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = speed;

            const voices = speechSynthesis.getVoices();
            const voiceSelect = document.getElementById('voice-select')?.value;
            if (voiceSelect?.includes('female')) {
                const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
                if (femaleVoice) utterance.voice = femaleVoice;
            }

            utterance.onend = () => {
                btn.innerHTML = '<i class="fas fa-check"></i> Add to Timeline';
                btn.disabled = false;
                btn.onclick = () => {
                    // Add as text overlay showing the narration
                    VideoEditor.addTextOverlay({
                        content: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
                        startTime: VideoEditor.currentTime,
                        endTime: VideoEditor.currentTime + text.length * 0.1,
                        position: { x: 50, y: 90 },
                        fontSize: 20,
                        color: '#ffffff',
                        bgColor: 'rgba(0,0,0,0.6)'
                    });
                    document.getElementById('ai-modal')?.classList.add('hidden');
                    app.showToast('Voiceover added to timeline!', 'success');
                };
            };

            speechSynthesis.speak(utterance);
            app.showToast('Playing voiceover preview...', 'info');
        } else {
            app.showToast('Speech synthesis not supported in this browser', 'error');
        }
    },

    // Auto Enhance UI
    getEnhanceUI() {
        return `
            <h2><i class="fas fa-magic" style="color:var(--accent-yellow)"></i> Auto Enhance</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                AI will analyze your video and improve quality automatically
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-sun" style="font-size:24px;color:var(--accent-yellow);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Brightness</div>
                    <div style="font-size:12px;color:var(--text-muted);">Auto adjust</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-adjust" style="font-size:24px;color:var(--accent-cyan);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Contrast</div>
                    <div style="font-size:12px;color:var(--text-muted);">Auto adjust</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-palette" style="font-size:24px;color:var(--accent-pink);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Color</div>
                    <div style="font-size:12px;color:var(--text-muted);">Balance & vibrance</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-expand" style="font-size:24px;color:var(--accent-green);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Sharpness</div>
                    <div style="font-size:12px;color:var(--text-muted);">Edge enhancement</div>
                </div>
            </div>
            <div class="form-group" style="margin-top:20px;">
                <label>Enhancement Strength</label>
                <input type="range" id="enhance-strength" min="0" max="100" value="70"
                       style="width:100%;accent-color:var(--accent-primary);">
                <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);">
                    <span>Subtle</span><span>Strong</span>
                </div>
            </div>
            <button class="primary-btn full-width" id="apply-enhance-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Enhance Video
            </button>
        `;
    },

    setupEnhanceLogic() {
        document.getElementById('apply-enhance-btn')?.addEventListener('click', async () => {
            if (!VideoEditor.videoElement?.src) {
                app.showToast('Please upload a video first', 'warning');
                return;
            }

            app.showLoading('Enhancing video...');
            await this.delay(2000);

            const strength = parseInt(document.getElementById('enhance-strength')?.value || 70);
            const filterStrength = strength / 100;

            const video = VideoEditor.videoElement;
            video.style.filter = `brightness(${1 + filterStrength * 0.1}) contrast(${1 + filterStrength * 0.15}) saturate(${1 + filterStrength * 0.2})`;

            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('Video enhanced!', 'success');
        });
    },

    // AI Music UI
    getMusicUI() {
        return `
            <h2><i class="fas fa-guitar" style="color:var(--accent-secondary)"></i> AI Music</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate royalty-free background music
            </p>
            <div class="form-group">
                <label>Mood</label>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                    ${['Happy', 'Energetic', 'Calm', 'Dramatic', 'Romantic', 'Dark'].map(mood => `
                        <button class="mood-btn" data-mood="${mood.toLowerCase()}"
                                style="padding:10px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-secondary);cursor:pointer;font-size:13px;transition:all 0.2s;">
                            ${mood}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Duration: <span id="music-duration-val">${Math.round(VideoEditor.duration || 30)}s</span></label>
                <input type="range" id="music-duration" min="5" max="180" 
                       value="${Math.round(VideoEditor.duration || 30)}"
                       style="width:100%;accent-color:var(--accent-primary);">
            </div>
            <button class="primary-btn full-width" id="generate-music-btn" style="margin-top:20px;">
                <i class="fas fa-music"></i> Generate Music
            </button>
        `;
    },

    setupMusicLogic() {
        // Mood selection
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => {
                    b.style.borderColor = 'var(--border-color)';
                    b.style.background = 'var(--bg-card)';
                });
                btn.style.borderColor = 'var(--accent-primary)';
                btn.style.background = 'var(--bg-hover)';
            });
        });

        // Duration slider
        const durationSlider = document.getElementById('music-duration');
        const durationVal = document.getElementById('music-duration-val');
        if (durationSlider && durationVal) {
            durationSlider.addEventListener('input', () => {
                durationVal.textContent = durationSlider.value + 's';
            });
        }

        document.getElementById('generate-music-btn')?.addEventListener('click', async () => {
            app.showLoading('Generating music...');
            await this.delay(3000);

            // Create a simple audio track entry
            const audioTrack = {
                id: 'audio_ai_' + Date.now(),
                name: 'AI Generated Music',
                startTime: 0,
                duration: parseInt(document.getElementById('music-duration')?.value || 30),
                trimStart: 0,
                trimEnd: parseInt(document.getElementById('music-duration')?.value || 30),
                volume: 0.5,
                type: 'audio'
            };

            VideoEditor.audioTracks.push(audioTrack);
            VideoEditor.renderTimeline();

            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('AI music track added!', 'success');
        });
    },

    // Helper delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};/**
 * VideoForge - AI Features
 */

const AIFeatures = {

    // Open AI tool
    openTool(toolType) {
        const modal = document.getElementById('ai-modal');
        const body = document.getElementById('ai-modal-body');
        if (!modal || !body) return;

        switch (toolType) {
            case 'captions':
                body.innerHTML = this.getCaptionsUI();
                this.setupCaptionsLogic();
                break;
            case 'beatSync':
                body.innerHTML = this.getBeatSyncUI();
                this.setupBeatSyncLogic();
                break;
            case 'bgRemove':
                body.innerHTML = this.getBgRemoveUI();
                this.setupBgRemoveLogic();
                break;
            case 'voiceover':
                body.innerHTML = this.getVoiceoverUI();
                this.setupVoiceoverLogic();
                break;
            case 'enhance':
                body.innerHTML = this.getEnhanceUI();
                this.setupEnhanceLogic();
                break;
            case 'music':
                body.innerHTML = this.getMusicUI();
                this.setupMusicLogic();
                break;
        }

        modal.classList.remove('hidden');

        modal.querySelector('.modal-overlay')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
        modal.querySelector('.modal-close')?.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    },

    // Auto Captions UI
    getCaptionsUI() {
        return `
            <h2><i class="fas fa-closed-captioning" style="color:var(--accent-primary)"></i> Auto Captions</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate captions from your video's audio automatically
            </p>
            <div class="form-group">
                <label>Language</label>
                <select id="caption-language" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="pt">Portuguese</option>
                    <option value="zh">Chinese</option>
                    <option value="ar">Arabic</option>
                </select>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Caption Style</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <button class="caption-style-btn active" data-style="classic" 
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--accent-primary);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Classic</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">White text, black bg</div>
                    </button>
                    <button class="caption-style-btn" data-style="modern"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Modern</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Word highlight</div>
                    </button>
                    <button class="caption-style-btn" data-style="karaoke"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Karaoke</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Color fill effect</div>
                    </button>
                    <button class="caption-style-btn" data-style="minimal"
                            style="padding:12px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-primary);cursor:pointer;text-align:center;">
                        <div style="font-size:16px;font-weight:600;">Minimal</div>
                        <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">Clean, no background</div>
                    </button>
                </div>
            </div>
            <div id="caption-progress" style="display:none;margin-top:20px;">
                <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;">
                    <div id="caption-progress-bar" style="width:0%;height:100%;background:linear-gradient(90deg,var(--accent-primary),var(--accent-green));transition:width 0.3s;border-radius:2px;"></div>
                </div>
                <p id="caption-status" style="text-align:center;margin-top:8px;font-size:13px;color:var(--text-muted);">Analyzing audio...</p>
            </div>
            <div id="caption-results" style="display:none;margin-top:20px;max-height:200px;overflow-y:auto;"></div>
            <button class="primary-btn full-width" id="generate-captions-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Generate Captions
            </button>
        `;
    },

    setupCaptionsLogic() {
        // Style selection
        document.querySelectorAll('.caption-style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.caption-style-btn').forEach(b => {
                    b.style.borderColor = 'var(--border-color)';
                    b.classList.remove('active');
                });
                btn.style.borderColor = 'var(--accent-primary)';
                btn.classList.add('active');
            });
        });

        document.getElementById('generate-captions-btn')?.addEventListener('click', () => {
            this.generateCaptions();
        });
    },

    async generateCaptions() {
        const progress = document.getElementById('caption-progress');
        const progressBar = document.getElementById('caption-progress-bar');
        const status = document.getElementById('caption-status');
        const results = document.getElementById('caption-results');
        const btn = document.getElementById('generate-captions-btn');

        if (!progress || !btn) return;

        if (!VideoEditor.videoElement?.src) {
            app.showToast('Please upload a video first', 'warning');
            return;
        }

        progress.style.display = 'block';
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Simulate AI caption generation with Web Speech API or demo
        const steps = [
            { progress: 20, text: 'Extracting audio...' },
            { progress: 40, text: 'Analyzing speech...' },
            { progress: 60, text: 'Generating transcription...' },
            { progress: 80, text: 'Timing captions...' },
            { progress: 100, text: 'Done!' }
        ];

        for (const step of steps) {
            await this.delay(800);
            progressBar.style.width = step.progress + '%';
            status.textContent = step.text;
        }

        // Generate demo captions
        const captions = this.generateDemoCaptions();

        results.style.display = 'block';
        results.innerHTML = `
            <h4 style="margin-bottom:12px;">Generated Captions (${captions.length})</h4>
            ${captions.map((c, i) => `
                <div style="padding:8px 12px;background:var(--bg-card);border-radius:6px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:13px;">"${c.text}"</span>
                    <span style="font-size:11px;color:var(--text-muted);">${c.start.toFixed(1)}s - ${c.end.toFixed(1)}s</span>
                </div>
            `).join('')}
        `;

        btn.innerHTML = '<i class="fas fa-check"></i> Apply Captions';
        btn.disabled = false;
        btn.onclick = () => {
            captions.forEach(c => {
                const style = document.querySelector('.caption-style-btn.active')?.dataset.style || 'classic';
                const styles = {
                    classic: { color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.7)', fontSize: 24 },
                    modern: { color: '#ffffff', fontSize: 28, fontWeight: '700' },
                    karaoke: { color: '#ffff00', fontSize: 26, fontWeight: '600' },
                    minimal: { color: '#ffffff', fontSize: 22, fontWeight: '400' }
                };

                VideoEditor.addTextOverlay({
                    content: c.text,
                    startTime: c.start,
                    endTime: c.end,
                    position: { x: 50, y: 85 },
                    ...styles[style]
                });
            });

            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast(`${captions.length} captions added!`, 'success');
        };
    },

    generateDemoCaptions() {
        const duration = VideoEditor.duration || 30;
        const texts = [
            "Hey everyone, welcome back",
            "Today we're going to show you",
            "Something really amazing",
            "Let's get started",
            "First, let me show you this",
            "Pretty cool, right?",
            "And that's basically it",
            "Thanks for watching!"
        ];

        const segmentDuration = duration / Math.min(texts.length, Math.ceil(duration / 3));
        return texts.slice(0, Math.ceil(duration / 3)).map((text, i) => ({
            text,
            start: i * segmentDuration,
            end: (i + 1) * segmentDuration - 0.2
        }));
    },

    // Beat Sync UI
    getBeatSyncUI() {
        return `
            <h2><i class="fas fa-heartbeat" style="color:var(--accent-pink)"></i> Beat Sync</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Automatically sync your video cuts to the beats of your music
            </p>
            <div class="form-group">
                <label>Music Source</label>
                <div style="display:flex;gap:8px;">
                    <button class="secondary-btn" id="upload-music-btn" style="flex:1;">
                        <i class="fas fa-upload"></i> Upload Music
                    </button>
                    <input type="file" id="music-file-input" accept="audio/*" hidden>
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>BPM (Beats Per Minute)</label>
                <div style="display:flex;align-items:center;gap:12px;">
                    <input type="range" id="bpm-slider" min="60" max="200" value="128" 
                           style="flex:1;accent-color:var(--accent-primary);">
                    <span id="bpm-value" style="min-width:40px;text-align:center;">128</span>
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Sync Style</label>
                <select id="sync-style" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="cut">Cut on beat</option>
                    <option value="zoom">Zoom pulse</option>
                    <option value="flash">Flash on beat</option>
                    <option value="shake">Screen shake</option>
                </select>
            </div>
            <button class="primary-btn full-width" id="apply-beat-sync-btn" style="margin-top:20px;">
                <i class="fas fa-sync"></i> Sync to Beats
            </button>
        `;
    },

    setupBeatSyncLogic() {
        const bpmSlider = document.getElementById('bpm-slider');
        const bpmValue = document.getElementById('bpm-value');

        if (bpmSlider && bpmValue) {
            bpmSlider.addEventListener('input', () => {
                bpmValue.textContent = bpmSlider.value;
            });
        }

        document.getElementById('upload-music-btn')?.addEventListener('click', () => {
            document.getElementById('music-file-input')?.click();
        });

        document.getElementById('music-file-input')?.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                app.showToast('Music file loaded: ' + e.target.files[0].name, 'success');
            }
        });

        document.getElementById('apply-beat-sync-btn')?.addEventListener('click', () => {
            this.applyBeatSync();
        });
    },

    async applyBeatSync() {
        const bpm = parseInt(document.getElementById('bpm-slider')?.value || 128);
        const style = document.getElementById('sync-style')?.value || 'cut';

        if (!VideoEditor.videoElement?.src) {
            app.showToast('Please upload a video first', 'warning');
            return;
        }

        app.showLoading('Syncing beats...');

        const beatInterval = 60 / bpm;
        const duration = VideoEditor.duration;
        const beats = [];

        for (let t = 0; t < duration; t += beatInterval) {
            beats.push(t);
        }

        await this.delay(1500);

        // Apply beat markers as text overlays with flash effect
        if (style === 'flash' || style === 'zoom') {
            beats.forEach((beat, i) => {
                if (i % 4 === 0) { // Every 4th beat
                    VideoEditor.addTextOverlay({
                        content: '●',
                        startTime: beat,
                        endTime: beat + 0.1,
                        position: { x: 50, y: 50 },
                        fontSize: 200,
                        color: 'rgba(255,255,255,0.5)',
                        animation: 'zoom_in'
                    });
                }
            });
        }

        app.hideLoading();
        document.getElementById('ai-modal')?.classList.add('hidden');
        app.showToast(`Beat synced! ${beats.length} beats at ${bpm} BPM`, 'success');
    },

    // Background Remove UI
    getBgRemoveUI() {
        return `
            <h2><i class="fas fa-eraser" style="color:var(--accent-green)"></i> Background Remover</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Remove the background from your video using AI segmentation
            </p>
            <div style="padding:24px;background:var(--bg-card);border-radius:12px;text-align:center;margin-bottom:20px;">
                <i class="fas fa-image" style="font-size:48px;color:var(--accent-primary);margin-bottom:12px;"></i>
                <p style="color:var(--text-secondary);margin-bottom:12px;">
                    AI will detect the subject and remove the background
                </p>
                <p style="font-size:12px;color:var(--text-muted);">
                    Works best with single subjects and solid backgrounds
                </p>
            </div>
            <div class="form-group">
                <label>Replacement Background</label>
                <select id="bg-replacement" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                    <option value="transparent">Transparent</option>
                    <option value="blur">Blurred Original</option>
                    <option value="color">Solid Color</option>
                    <option value="gradient">Gradient</option>
                </select>
            </div>
            <div class="form-group" style="margin-top:12px;" id="bg-color-group">
                <label>Background Color</label>
                <input type="color" id="bg-color-picker" value="#00ff00" 
                       style="width:100%;height:40px;cursor:pointer;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;">
            </div>
            <button class="primary-btn full-width" id="remove-bg-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Remove Background
            </button>
        `;
    },

    setupBgRemoveLogic() {
        document.getElementById('remove-bg-btn')?.addEventListener('click', async () => {
            if (!VideoEditor.videoElement?.src) {
                app.showToast('Please upload a video first', 'warning');
                return;
            }

            app.showLoading('Removing background...');
            await this.delay(2000);

            // Apply a green screen-like filter as demo
            VideoEditor.applyFilter('high_contrast');
            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('Background removal applied (demo mode)', 'success');
        });
    },

    // AI Voiceover UI
    getVoiceoverUI() {
        return `
            <h2><i class="fas fa-microphone-alt" style="color:var(--accent-orange)"></i> AI Voiceover</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate natural-sounding narration from text
            </p>
            <div class="form-group">
                <label>Script</label>
                <textarea id="voiceover-text" placeholder="Enter the text you want to convert to speech..."
                          style="padding:12px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;min-height:120px;resize:vertical;font-family:inherit;font-size:14px;"></textarea>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;">
                <div class="form-group">
                    <label>Voice</label>
                    <select id="voice-select" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                        <option value="female1">Sarah (Female)</option>
                        <option value="male1">James (Male)</option>
                        <option value="female2">Emma (Female)</option>
                        <option value="male2">David (Male)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Speed</label>
                    <select id="voice-speed" style="padding:10px;background:var(--bg-input);border:1px solid var(--border-color);border-radius:6px;color:var(--text-primary);width:100%;">
                        <option value="0.75">Slow</option>
                        <option value="1" selected>Normal</option>
                        <option value="1.25">Fast</option>
                        <option value="1.5">Very Fast</option>
                    </select>
                </div>
            </div>
            <button class="primary-btn full-width" id="generate-voice-btn" style="margin-top:20px;">
                <i class="fas fa-play"></i> Generate & Preview
            </button>
        `;
    },

    setupVoiceoverLogic() {
        document.getElementById('generate-voice-btn')?.addEventListener('click', () => {
            this.generateVoiceover();
        });
    },

    async generateVoiceover() {
        const text = document.getElementById('voiceover-text')?.value;
        if (!text) {
            app.showToast('Please enter some text', 'warning');
            return;
        }

        const speed = parseFloat(document.getElementById('voice-speed')?.value || 1);
        const btn = document.getElementById('generate-voice-btn');

        // Use Web Speech API for browser-based TTS
        if ('speechSynthesis' in window) {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            btn.disabled = true;

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = speed;

            const voices = speechSynthesis.getVoices();
            const voiceSelect = document.getElementById('voice-select')?.value;
            if (voiceSelect?.includes('female')) {
                const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha'));
                if (femaleVoice) utterance.voice = femaleVoice;
            }

            utterance.onend = () => {
                btn.innerHTML = '<i class="fas fa-check"></i> Add to Timeline';
                btn.disabled = false;
                btn.onclick = () => {
                    // Add as text overlay showing the narration
                    VideoEditor.addTextOverlay({
                        content: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
                        startTime: VideoEditor.currentTime,
                        endTime: VideoEditor.currentTime + text.length * 0.1,
                        position: { x: 50, y: 90 },
                        fontSize: 20,
                        color: '#ffffff',
                        bgColor: 'rgba(0,0,0,0.6)'
                    });
                    document.getElementById('ai-modal')?.classList.add('hidden');
                    app.showToast('Voiceover added to timeline!', 'success');
                };
            };

            speechSynthesis.speak(utterance);
            app.showToast('Playing voiceover preview...', 'info');
        } else {
            app.showToast('Speech synthesis not supported in this browser', 'error');
        }
    },

    // Auto Enhance UI
    getEnhanceUI() {
        return `
            <h2><i class="fas fa-magic" style="color:var(--accent-yellow)"></i> Auto Enhance</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                AI will analyze your video and improve quality automatically
            </p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-sun" style="font-size:24px;color:var(--accent-yellow);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Brightness</div>
                    <div style="font-size:12px;color:var(--text-muted);">Auto adjust</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-adjust" style="font-size:24px;color:var(--accent-cyan);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Contrast</div>
                    <div style="font-size:12px;color:var(--text-muted);">Auto adjust</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-palette" style="font-size:24px;color:var(--accent-pink);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Color</div>
                    <div style="font-size:12px;color:var(--text-muted);">Balance & vibrance</div>
                </div>
                <div style="padding:16px;background:var(--bg-card);border-radius:8px;text-align:center;">
                    <i class="fas fa-expand" style="font-size:24px;color:var(--accent-green);margin-bottom:8px;"></i>
                    <div style="font-size:14px;">Sharpness</div>
                    <div style="font-size:12px;color:var(--text-muted);">Edge enhancement</div>
                </div>
            </div>
            <div class="form-group" style="margin-top:20px;">
                <label>Enhancement Strength</label>
                <input type="range" id="enhance-strength" min="0" max="100" value="70"
                       style="width:100%;accent-color:var(--accent-primary);">
                <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);">
                    <span>Subtle</span><span>Strong</span>
                </div>
            </div>
            <button class="primary-btn full-width" id="apply-enhance-btn" style="margin-top:20px;">
                <i class="fas fa-magic"></i> Enhance Video
            </button>
        `;
    },

    setupEnhanceLogic() {
        document.getElementById('apply-enhance-btn')?.addEventListener('click', async () => {
            if (!VideoEditor.videoElement?.src) {
                app.showToast('Please upload a video first', 'warning');
                return;
            }

            app.showLoading('Enhancing video...');
            await this.delay(2000);

            const strength = parseInt(document.getElementById('enhance-strength')?.value || 70);
            const filterStrength = strength / 100;

            const video = VideoEditor.videoElement;
            video.style.filter = `brightness(${1 + filterStrength * 0.1}) contrast(${1 + filterStrength * 0.15}) saturate(${1 + filterStrength * 0.2})`;

            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('Video enhanced!', 'success');
        });
    },

    // AI Music UI
    getMusicUI() {
        return `
            <h2><i class="fas fa-guitar" style="color:var(--accent-secondary)"></i> AI Music</h2>
            <p style="color:var(--text-muted);margin:12px 0 20px;">
                Generate royalty-free background music
            </p>
            <div class="form-group">
                <label>Mood</label>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                    ${['Happy', 'Energetic', 'Calm', 'Dramatic', 'Romantic', 'Dark'].map(mood => `
                        <button class="mood-btn" data-mood="${mood.toLowerCase()}"
                                style="padding:10px;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;color:var(--text-secondary);cursor:pointer;font-size:13px;transition:all 0.2s;">
                            ${mood}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="form-group" style="margin-top:16px;">
                <label>Duration: <span id="music-duration-val">${Math.round(VideoEditor.duration || 30)}s</span></label>
                <input type="range" id="music-duration" min="5" max="180" 
                       value="${Math.round(VideoEditor.duration || 30)}"
                       style="width:100%;accent-color:var(--accent-primary);">
            </div>
            <button class="primary-btn full-width" id="generate-music-btn" style="margin-top:20px;">
                <i class="fas fa-music"></i> Generate Music
            </button>
        `;
    },

    setupMusicLogic() {
        // Mood selection
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => {
                    b.style.borderColor = 'var(--border-color)';
                    b.style.background = 'var(--bg-card)';
                });
                btn.style.borderColor = 'var(--accent-primary)';
                btn.style.background = 'var(--bg-hover)';
            });
        });

        // Duration slider
        const durationSlider = document.getElementById('music-duration');
        const durationVal = document.getElementById('music-duration-val');
        if (durationSlider && durationVal) {
            durationSlider.addEventListener('input', () => {
                durationVal.textContent = durationSlider.value + 's';
            });
        }

        document.getElementById('generate-music-btn')?.addEventListener('click', async () => {
            app.showLoading('Generating music...');
            await this.delay(3000);

            // Create a simple audio track entry
            const audioTrack = {
                id: 'audio_ai_' + Date.now(),
                name: 'AI Generated Music',
                startTime: 0,
                duration: parseInt(document.getElementById('music-duration')?.value || 30),
                trimStart: 0,
                trimEnd: parseInt(document.getElementById('music-duration')?.value || 30),
                volume: 0.5,
                type: 'audio'
            };

            VideoEditor.audioTracks.push(audioTrack);
            VideoEditor.renderTimeline();

            app.hideLoading();
            document.getElementById('ai-modal')?.classList.add('hidden');
            app.showToast('AI music track added!', 'success');
        });
    },

    // Helper delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
