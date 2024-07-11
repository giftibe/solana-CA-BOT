const solanaWeb3 = require('@solana/web3.js');
const fs = require('fs');


// Function to check and return the balances of the wallets
async function checkWalletBalances(solWallets) {
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');

    // Check if the file exists
    if (!fs.existsSync(solWallets)) {
        console.log(`File ${solWallets} does not exist.`);
        return [];
    }

    // Read the existing file
    const data = fs.readFileSync(solWallets, 'utf8');
    // Parse the existing JSON data
    const wallets = JSON.parse(data);

    // Fetch and add balances to the wallets
    for (const wallet of wallets) {
        const publicKey = new solanaWeb3.PublicKey(wallet.publicKey);
        const balance = await connection.getBalance(publicKey);
        wallet.balance = balance / solanaWeb3.LAMPORTS_PER_SOL; // Convert lamports to SOL
    }

    console.log(`Wallets and their balances from ${solWallets}:`);
    console.log(wallets);
    return wallets;
}



checkWalletBalances('wallets.json');


// Example usage:
// Generate 5 wallets and save them to wallets.json, or return existing wallets if the file exists
// generateWalletsAndSaveToFile(5, 'wallets.json').then(() => {
    // Check the balances of the wallets in wallets.json
    // checkWalletBalances('wallets.json');
// });