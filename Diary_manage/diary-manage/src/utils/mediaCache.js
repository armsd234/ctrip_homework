// Media cache utility using IndexedDB
const DB_NAME = 'mediaCacheDB';
const STORE_NAME = 'mediaStore';
const DB_VERSION = 1;
const CACHE_EXPIRY_DAYS = 7; // Cache expires after 7 days
const MAX_CACHE_SIZE_MB = 500; // Maximum cache size in MB

// Store for object URLs to prevent memory leaks
const objectURLs = new Map();

// Initialize IndexedDB
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'filename' });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
};

// Get total cache size
const getCacheSize = async () => {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
            const totalSize = request.result.reduce((size, item) => {
                return size + (item.blob.size || 0);
            }, 0);
            resolve(totalSize / (1024 * 1024)); // Convert to MB
        };
    });
};

// Clean expired cache entries
const cleanExpiredCache = async () => {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const expiryTime = Date.now() - (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    // Clean expired entries
    const index = store.index('timestamp');
    const range = IDBKeyRange.upperBound(expiryTime);

    return new Promise((resolve) => {
        const request = index.openCursor(range);
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                // Revoke object URL if it exists
                const url = objectURLs.get(cursor.value.filename);
                if (url) {
                    URL.revokeObjectURL(url);
                    objectURLs.delete(cursor.value.filename);
                }
                // Delete expired entry
                store.delete(cursor.value.filename);
                cursor.continue();
            } else {
                resolve();
            }
        };
    });
};

// Clean cache to maintain size limit
const cleanCacheBySize = async () => {
    const currentSize = await getCacheSize();
    if (currentSize <= MAX_CACHE_SIZE_MB) return;

    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    return new Promise((resolve) => {
        const request = index.openCursor();
        const entriesToDelete = [];

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                entriesToDelete.push({
                    filename: cursor.value.filename,
                    timestamp: cursor.value.timestamp,
                    size: cursor.value.blob.size
                });
                cursor.continue();
            } else {
                // Sort by timestamp (oldest first)
                entriesToDelete.sort((a, b) => a.timestamp - b.timestamp);

                let deletedSize = 0;
                const deleteEntries = async () => {
                    for (const entry of entriesToDelete) {
                        // Revoke object URL if it exists
                        const url = objectURLs.get(entry.filename);
                        if (url) {
                            URL.revokeObjectURL(url);
                            objectURLs.delete(entry.filename);
                        }
                        // Delete entry
                        await store.delete(entry.filename);
                        deletedSize += entry.size;

                        // Check if we've freed enough space
                        if ((currentSize - (deletedSize / (1024 * 1024))) <= MAX_CACHE_SIZE_MB) {
                            break;
                        }
                    }
                };

                deleteEntries().then(resolve);
            }
        };
    });
};

// Cache media data
export const cacheMedia = async (filename, blob) => {
    try {
        await cleanExpiredCache();
        await cleanCacheBySize();

        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.put({ filename, blob, timestamp: Date.now() });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error caching media:', error);
        throw error;
    }
};

// Get media from cache
export const getMediaFromCache = async (filename) => {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
            const request = store.get(filename);
            request.onsuccess = () => {
                const result = request.result;
                if (!result) {
                    resolve(null);
                    return;
                }

                // Check if expired
                const expiryTime = Date.now() - (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
                if (result.timestamp < expiryTime) {
                    // Delete expired entry
                    const deleteTransaction = db.transaction([STORE_NAME], 'readwrite');
                    const deleteStore = deleteTransaction.objectStore(STORE_NAME);
                    deleteStore.delete(filename);
                    resolve(null);
                    return;
                }

                resolve(result.blob);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error getting media from cache:', error);
        return null;
    }
};

// Create and manage object URL
const createAndStoreObjectURL = (blob, filename) => {
    // Revoke existing URL if it exists
    const existingURL = objectURLs.get(filename);
    if (existingURL) {
        URL.revokeObjectURL(existingURL);
    }

    // Create and store new URL
    const url = URL.createObjectURL(blob);
    objectURLs.set(filename, url);
    return url;
};

// Fetch and cache media
export const fetchAndCacheMedia = async (filename) => {
    if (!filename) return '';

    try {
        // First try to get from cache
        const cachedMedia = await getMediaFromCache(filename);
        if (cachedMedia) {
            return createAndStoreObjectURL(cachedMedia, filename);
        }

        // If not in cache, fetch from server
        const response = await fetch(`http://localhost:5001/api/images/image?filename=${filename}`);
        if (!response.ok) throw new Error('Failed to fetch image');

        const blob = await response.blob();

        // Cache the media
        await cacheMedia(filename, blob);

        // Return object URL
        return createAndStoreObjectURL(blob, filename);
    } catch (error) {
        console.error('Error fetching and caching media:', error);
        // Return original URL if caching fails
        return `http://localhost:5001/api/images/image?filename=${filename}`;
    }
};

// Fetch and cache video
export const fetchAndCacheVideo = async (filename) => {
    if (!filename) return '';

    try {
        // First try to get from cache
        const cachedVideo = await getMediaFromCache(filename);
        if (cachedVideo) {
            return createAndStoreObjectURL(cachedVideo, filename);
        }

        // If not in cache, fetch from server
        const response = await fetch(`http://localhost:5001/api/images/video?filename=${filename}`);
        if (!response.ok) throw new Error('Failed to fetch video');

        const blob = await response.blob();

        // Cache the video
        await cacheMedia(filename, blob);

        // Return object URL
        return createAndStoreObjectURL(blob, filename);
    } catch (error) {
        console.error('Error fetching and caching video:', error);
        // Return original URL if caching fails
        return `http://localhost:5001/api/images/video?filename=${filename}`;
    }
};

// Cleanup function to be called when component unmounts
export const cleanupObjectURLs = () => {
    objectURLs.forEach((url) => {
        URL.revokeObjectURL(url);
    });
    objectURLs.clear();
}; 