document.addEventListener('DOMContentLoaded', async () => {
    console.log('Loading leaderboard...');
    console.log('Config:', window.config); // Add debug log
    
    const leaderboardBody = document.getElementById('leaderboard-body');

    if (!leaderboardBody) {
        console.error('Leaderboard body element not found');
        return;
    }

    try {
        const apiUrl = window.config.API_URL;
        console.log('Using API URL:', apiUrl); // Add debug log
        
        const response = await fetch(`${apiUrl}/api/leaderboard`);
        if (!response.ok) {
            throw new Error(`Failed to fetch leaderboard data: ${response.status}`);
        }
        
        const leaderboardData = await response.json();
        console.log('Leaderboard data:', leaderboardData); // Add debug log

        // Clear existing entries
        leaderboardBody.innerHTML = '';

        // Add new entries
        leaderboardData.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${entry.username}</td>
                <td>$${entry.balance.toLocaleString()}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="3">Error loading leaderboard data</td>
            </tr>
        `;
    }
});

// Function to update leaderboard data
function updateLeaderboard(playerName, newBalance) {
    let leaderboardData = JSON.parse(localStorage.getItem('leaderboardData')) || [];

    // Find the player in the leaderboard data
    const playerIndex = leaderboardData.findIndex(entry => entry.player === playerName);

    if (playerIndex !== -1) {
        // Update the player's balance
        leaderboardData[playerIndex].balance = newBalance;
    } else {
        // Add new player to the leaderboard
        leaderboardData.push({ player: playerName, balance: newBalance });
    }

    // Sort leaderboard data by balance in descending order
    leaderboardData.sort((a, b) => b.balance - a.balance);

    // Save updated leaderboard data to localStorage
    localStorage.setItem('leaderboardData', JSON.stringify(leaderboardData));
}
