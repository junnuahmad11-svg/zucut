// ==========================================
// FlashCut - Firebase Authentication & Database
// ==========================================

const FirebaseManager = (() => {
    // Firebase Configuration
    // In production, load these from environment or a secure config
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY_HERE",
        authDomain: "YOUR_PROJECT.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT.appspot.com",
        messagingSenderId: "YOUR_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    let app = null;
    let auth = null;
    let db = null;
    let storage = null;
    let currentUser = null;

    function init() {
        try {
            if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== 'YOUR_API_KEY_HERE') {
                app = firebase.initializeApp(firebaseConfig);
                auth = firebase.auth();
                db = firebase.firestore();
                storage = firebase.storage();

                // Listen for auth state changes
                auth.onAuthStateChanged((user) => {
                    currentUser = user;
                    if (user) {
                        console.log('User logged in:', user.displayName);
                        updateUserUI(user);
                        loadUserProjects();
                    }
                });

                console.log('Firebase initialized successfully');
            } else {
                console.log('Firebase not configured - running in offline mode');
            }
        } catch (error) {
            console.error('Firebase init error:', error);
        }
    }

    // Google Sign-In
    async function signInWithGoogle() {
        try {
            if (!auth) {
                // Demo mode - simulate login
                simulateLogin();
                return;
            }

            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');

            const result = await auth.signInWithPopup(provider);
            currentUser = result.user;

            // Save user data to Firestore
            await saveUserData(result.user);

            return result.user;
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            // Fallback to demo mode
            simulateLogin();
        }
    }

    // Guest Mode
    function signInAsGuest() {
        currentUser = {
            uid: 'guest_' + Date.now(),
            displayName: 'Guest User',
            email: null,
            photoURL: null,
            isGuest: true
        };
        updateUserUI(currentUser);
        return currentUser;
    }

    // Simulate Login (Demo Mode)
    function simulateLogin() {
        currentUser = {
            uid: 'demo_' + Date.now(),
            displayName: 'Demo User',
            email: 'demo@flashcut.app',
            photoURL: null,
            isDemo: true
        };
        updateUserUI(currentUser);
    }

    // Update UI with user info
    function updateUserUI(user) {
        const avatar = document.getElementById('user-photo');
        const avatarContainer = document.getElementById('user-avatar');

        if (user.photoURL) {
            avatar.src = user.photoURL;
        } else {
            // Generate avatar from initials
            const initials = (user.displayName || 'U').charAt(0).toUpperCase();
            avatar.src = `https://ui-avatars.com/api/?name=${initials}&background=6c5ce7&color=fff&size=64`;
        }

        avatarContainer.title = user.displayName || 'User';
    }

    // Save user data to Firestore
    async function saveUserData(user) {
        if (!db) return;

        try {
            await db.collection('users').doc(user.uid).set({
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    }

    // Save project to Firestore
    async function saveProject(projectData) {
        if (!db || !currentUser) {
            // Save to localStorage in offline mode
            saveProjectLocally(projectData);
            return;
        }

        try {
            const projectRef = db.collection('users')
                .doc(currentUser.uid)
                .collection('projects');

            if (projectData.id) {
                await projectRef.doc(projectData.id).update({
                    ...projectData,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                const doc = await projectRef.add({
                    ...projectData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                projectData.id = doc.id;
            }

            showToast('Project saved!', 'success');
            return projectData.id;
        } catch (error) {
            console.error('Error saving project:', error);
            saveProjectLocally(projectData);
        }
    }

    // Load user projects
    async function loadUserProjects() {
        if (!db || !currentUser || currentUser.isGuest || currentUser.isDemo) {
            return loadProjectsLocally();
        }

        try {
            const snapshot = await db.collection('users')
                .doc(currentUser.uid)
                .collection('projects')
                .orderBy('updatedAt', 'desc')
                .limit(50)
                .get();

            const projects = [];
            snapshot.forEach(doc => {
                projects.push({ id: doc.id, ...doc.data() });
            });

            return projects;
        } catch (error) {
            console.error('Error loading projects:', error);
            return loadProjectsLocally();
        }
    }

    // Upload file to Firebase Storage
    async function uploadFile(file, path) {
        if (!storage) {
            console.log('Storage not available - using local file');
            return URL.createObjectURL(file);
        }

        try {
            const ref = storage.ref(`${currentUser.uid}/${path}/${Date.now()}_${file.name}`);
            const snapshot = await ref.put(file);
            const url = await snapshot.ref.getDownloadURL();
            return url;
        } catch (error) {
            console.error('Error uploading file:', error);
            return URL.createObjectURL(file);
        }
    }

    // Local storage fallback
    function saveProjectLocally(projectData) {
        try {
            const projects = JSON.parse(localStorage.getItem('flashcut_projects') || '[]');
            const existingIndex = projects.findIndex(p => p.id === projectData.id);

            if (existingIndex >= 0) {
                projects[existingIndex] = projectData;
            } else {
                projectData.id = 'local_' + Date.now();
                projects.push(projectData);
            }

            localStorage.setItem('flashcut_projects', JSON.stringify(projects));
            showToast('Project saved locally!', 'success');
        } catch (error) {
            console.error('Error saving locally:', error);
        }
    }

    function loadProjectsLocally() {
        try {
            return JSON.parse(localStorage.getItem('flashcut_projects') || '[]');
        } catch {
            return [];
        }
    }

    // Sign Out
    async function signOut() {
        if (auth) {
            await auth.signOut();
        }
        currentUser = null;
        window.location.reload();
    }

    // Get current user
    function getUser() {
        return currentUser;
    }

    return {
        init,
        signInWithGoogle,
        signInAsGuest,
        saveProject,
        loadUserProjects,
        uploadFile,
        signOut,
        getUser
    };
})();
