// Add timestamp to see when this runs
console.log('Auth file loaded at:', new Date().toISOString());
console.log('Window object:', window);
console.log('Config object:', window.config);

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded at:', new Date().toISOString());
    console.log('Config object in DOMContentLoaded:', window.config);

    if (typeof window.config === 'undefined') {
        console.error('Config is not defined! Check if config.js is loaded properly.');
        return;
    }

    const signupForm = document.getElementById('signupForm');

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value.trim();

        if (username) {
            try {
                const response = await fetch(`${window.config.API_URL}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username })
                });

                if (response.ok) {
                    const user = await response.json();
                    localStorage.setItem('playerName', user.username);
                    localStorage.setItem('balance', user.balance);
                    localStorage.setItem('inventory', JSON.stringify([]));
                    window.location.href = 'index.html';
                } else {
                    const error = await response.json();
                    alert(error.error || 'Error registering user');
                }
            } catch (error) {
                console.error('Error registering user:', error);
                alert('Server connection failed. Please make sure the server is running.');
            }
        } else {
            alert('Please enter a valid username.');
        }
    });

    // Initialize inventory if it doesn't exist
    if (!localStorage.getItem('inventory')) {
        localStorage.setItem('inventory', JSON.stringify([]));
    }
});
