try {
    console.log('☢️ STARTING SCORCHED EARTH NUKE...');
    
    // We loop backwards because deleting items changes the indices
    let deletedCount = 0;
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        // Delete ANY key that contains "ton-connect"
        if (key && key.toLowerCase().includes('ton-connect')) {
            console.log(`🗑 Deleting infected key: ${key}`);
            localStorage.removeItem(key);
            deletedCount++;
        }
    }
    
    console.log(`✅ NUKE COMPLETE. Deleted ${deletedCount} keys.`);
} catch (e) {
    console.error('Nuke failed:', e);
}