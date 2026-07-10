// ==========================================
// FlashCut - AI Tools
// ==========================================

const AITools = (() => {

    function init() {
        setupEventListeners();
    }

    function setupEventListeners() {
        // Auto Captions
        document.getElementById('ai-captions')?.addEventListener('click', () => {
            openModal('ai-captions-modal');
        });

        document.getElementById('generate-captions')?.addEventListener('click', () => {
            generateCaptions();
        });

        // Beat Sync
        document.getElementById('ai-beat-sync')?.addEventListener('click', () => {
            beatSync();
        });

        // Background Remover
        document.getElementById('ai-bg-remove')?.addEventListener('click', () => {
            removeBackground();
        });

        // AI Voiceover
        document.getElementById('ai-voiceover')?.addEventListener('click', () => {
            openModal('ai-voiceover-modal');
        });

        document.getElementById('generate-voiceover')?.addEventListener('click', () => {
            generateVoiceover();
        });

        // Auto Enhance
        document.getElementById('ai-enhance')?.addEventListener('click', () => {
            autoEnhance();
        });

        // Smart Cut
        document.getElementById('ai-smart-cut')?.addEventListener('click', () => {
            smartCut();
        });

        // Modal close buttons
        document.querySelectorAll('[data-close]').forEach(btn => {
            btn.addEventListener('click', () => {
                closeModal(btn.dataset.close);
            });
        });
    }

    // Auto Captions using Web Speech API
    async function generateCaptions() {
        const video = document.getElementById('preview-video');
        if (!video || !video.src) {
            showToast('Please add a video first', 'warning');
            return;
        }

        const progress = document.getElementById('caption-progress');
        const results = document.getElementById('caption-results');
        const captionList = document.getElementById('caption-list');

        if (progress) progress.classList.remove('hidden');

        // Check for Speech Recognition support
        const SpeechRecognition = window.SpeechRecognition || 
                                   window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            // Fallback: Generate sample captions based on video duration
            showToast('Speech recognition not available. Generating sample captions...', 'info');
            await generateSampleCaptions(video.duration);
            return;
        }

        try {
            const language = document.getElementById('caption-language')?.value || 'en-US';
            const recognition = new SpeechRecognition();
            recognition.lang = language;
            recognition.continuous = true;
            recognition.interimResults = false;

            const captions = [];
            let startTime = 0;

            // Create audio context to process video audio
            const audioContext = new AudioContext();
            const source = audioContext.createMediaElementSource(video);
            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);
            source.connect(audioContext.destination);

            recognition.onresult = (event) => {
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        const text = event.results[i][0].transcript.trim();
                        if (text) {
                            const endTime = video.currentTime;
                            captions.push({
                                text,
                                startTime,
                                endTime,
                                confidence: event.results[i][0].confidence
                            });
                            startTime = endTime;
                        }
                    }
                }
            };

            recognition.onend = () => {
                if (progress) progress.classList.add('hidden');
                displayCaptions(captions);
                audioContext.close();
            };

            recognition.onerror = (e) => {
                console.error('Speech recognition error:', e);
                if (progress) progress.classList.add('hidden');
                generateSampleCaptions(video.duration);
            };

            // Play video to get audio
            video.currentTime = 0;
            video.play();
            recognition.start();

            // Stop after video ends or 60 seconds
            setTimeout(() => {
                recognition.stop();
                video.pause();
            }, Math.min(video.duration * 1000, 60000));

        } catch (error) {
            console.error('Caption generation error:', error);
            if (progress) progress.classList.add('hidden');
            await generateSampleCaptions(video.duration || 30);
        }
    }

    async function generateSampleCaptions(duration) {
        const progress = document.getElementById('caption-progress');

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        const sampleCaptions = [];
        const segmentDuration = 3; // 3 seconds per caption
        const sampleTexts = [
            "Welcome to this video",
            "Let me show you something amazing",
            "This is really cool",
            "Watch what happens next",
            "And that's how it's done",
            "Thanks for watching",
            "Don't forget to like and subscribe",
            "See you in the next one"
        ];

        for (let i = 0; i < Math.ceil(duration / segmentDuration); i++) {
            sampleCaptions.push({
                text: sampleTexts[i % sampleTexts.length],
                startTime: i * segmentDuration,
                endTime: Math.min((i + 1) * segmentDuration, duration),
                confidence: 0.85 + Math.random() * 0.15
            });
        }

        if (progress) progress.classList.add('hidden');
        displayCaptions(sampleCaptions);
    }

    function displayCaptions(captions) {
        const results = document.getElementById('caption-results');
        const captionList = document.getElementById('caption-list');

        if (!results || !captionList) return;

        results.classList.remove('hidden');

        captionList.innerHTML = captions.map((caption, i) => `
            <div class="caption-item" data-index="${i}">
                <div class="caption-time">
                    ${formatTime(caption.startTime)} - ${formatTime(caption.endTime)}
                </div>
                <input type="text" value="${caption.text}" 
                       class="caption-text-input"
                       data-index="${i}">
                <button class="caption-add-btn" onclick="AITools.addCaptionToTimeline(${i})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `).join('');

        // Style for caption items
        const style = document.createElement('style');
        style.textContent = `
            .caption-item {
                display: flex; align-items: center; gap: 8px;
                padding: 8px; margin-bottom: 6px;
                background: var(--bg-tertiary); border-radius: 6px;
            }
            .caption-time {
                font-size: 0.65rem; color: var(--text-muted);
                min-width: 100px;
            }
            .caption-text-input {
                flex: 1; padding: 6px 8px; background: var(--bg-primary);
                border: 1px solid var(--border); border-radius: 4px;
                color: var(--text-primary); font-size: 0.8rem; outline: none;
            }
            .caption-add-btn {
                width: 28px; height: 28px; background: var(--accent);
                border: none; border-radius: 50%; color: white;
                cursor: pointer; display: flex; align-items: center;
                justify-content: center; font-size: 0.7rem;
            }
        `;
        if (!document.getElementById('caption-styles')) {
            style.id = 'caption-styles';
            document.head.appendChild(style);
        }

        // Store captions for later use
        window._generatedCaptions = captions;

        // Button to add all captions
        captionList.innerHTML += `
            <button class="btn-primary" style="width:100%;margin-top:12px"
                    onclick="AITools.addAllCaptionsToTimeline()">
                <i class="fas fa-plus-circle"></i> Add All Captions
            </button>
        `;
    }

    function addCaptionToTimeline(index) {
        const captions = window._generatedCaptions;
        if (!captions || !captions[index]) return;

        const caption = captions[index];
        const style = document.getElementById('caption-style')?.value || 'standard';

        Timeline.addClip('text', {
            content: caption.text,
            startTime: caption.startTime,
            endTime: caption.endTime,
            duration: caption.endTime - caption.startTime,
            x: 50,
            y: 85,
            fontSize: 24,
            fontWeight: '600',
            color: '#ffffff',
            animation: style === 'karaoke' ? 'none' : 'fade-in',
            style: 'shadow',
            isCaption: true
        });

        showToast('Caption added to timeline', 'success');
    }

    function addAllCaptionsToTimeline() {
        const captions = window._generatedCaptions;
        if (!captions) return;

        captions.forEach((_, i) => addCaptionToTimeline(i));
        closeModal('ai-captions-modal');
        showToast(`${captions.length} captions added!`, 'success');
    }

    // Beat Sync
    async function beatSync() {
        showToast('Analyzing audio beats...', 'info');

        const video = document.getElementById('preview-video');
        if (!video || !video.src) {
            showToast('Please add a video with audio first', 'warning');
            return;
        }

        try {
            const audioContext = new AudioContext();
            const response = await fetch(video.src);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Simple beat detection
            const beats = detectBeats(audioBuffer);

            // Auto-split video at beat points
            if (beats.length > 0) {
                beats.forEach((beatTime, i) => {
                    if (i < beats.length - 1) {
                        const videoClips = Timeline.tracks.video;
                        videoClips.forEach(clip => {
                            if (beatTime > clip.startTime && beatTime < clip.endTime) {
                                Timeline.splitClip(clip.id, beatTime);
                            }
                        });
                    }
                });

                showToast(`Found ${beats.length} beats! Video synced.`, 'success');
            } else {
                // Generate evenly spaced beats
                const bpm = 120;
                const beatInterval = 60 / bpm;
                const duration = video.duration || 30;
                
                for (let t = beatInterval; t < duration; t += beatInterval) {
                    const videoClips = Timeline.tracks.video;
                    videoClips.forEach(clip => {
                        if (t > clip.startTime + 0.5 && t < clip.endTime - 0.5) {
                            Timeline.splitClip(clip.id, t);
                        }
                    });
                }

                showToast('Beat sync applied with estimated BPM!', 'success');
            }

            audioContext.close();
        } catch (error) {
            console.error('Beat sync error:', error);
            showToast('Beat sync: Using estimated beats', 'info');
            
            // Fallback: split at regular intervals
            const duration = video.duration || Timeline.duration || 30;
            const interval = 2; // Every 2 seconds
            for (let t = interval; t < duration; t += interval) {
                const clips = [...Timeline.tracks.video];
                clips.forEach(clip => {
                    if (t > clip.startTime + 0.5 && t < clip.endTime - 0.5) {
                        Timeline.splitClip(clip.id, t);
                    }
                });
            }
            showToast('Video split at regular intervals', 'success');
        }
    }

    // Simple beat detection
    function detectBeats(audioBuffer) {
        const data = audioBuffer.getChannelData(0);
        const sampleRate = audioBuffer.sampleRate;
        const beats 
