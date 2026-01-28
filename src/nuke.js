// src/nuke.js
try {
    console.log('💥 NUKING OLD DATA...');
    // Delete the specific keys that hold the broken connection
    localStorage.removeItem('ton-connect-storage_bridge-connection');
    localStorage.removeItem('ton-connect-ui_last-selected-wallet-info');
    localStorage.removeItem('ton-connect-ui_wallets-list');
    console.log('✅ NUKE COMPLETE');
} catch (e) {
    console.error('Nuke failed:', e);
}