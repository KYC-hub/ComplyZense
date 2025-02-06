document.addEventListener('DOMContentLoaded', async function () {
    // ================================
    // 1. DOM Elements & UI Components
    // ================================
    const chatbox = document.getElementById('chatbox');
    const sendButton = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const fileInput = document.getElementById('file-input');
    const fileUploadWrapper = document.getElementById('file-upload-wrapper');
    const historyButton = document.getElementById('history-btn');
    const historyPanel = document.getElementById('side-panel');
    const historyList = document.getElementById('history-list');
    const exportHistoryButton = document.getElementById('export-history-btn-panel');
    const loginButton = document.getElementById('Login-btn');
    const registerButton = document.getElementById('Register-btn');
    const userIconWrapper = document.getElementById('user-icon-wrapper');
    const usernameDisplay = document.getElementById('username');
    const dropdownLogoutButton = document.getElementById('dropdown-logout-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const loginOverlay = document.getElementById('login-overlay');
    const sessionnameDisplay = document.getElementById('sessionnameDisplay');
    const userIcon = document.getElementById('user-icon');
    const dropdown = document.querySelector('.user-dropdown');
    const generateReportWrapper = document.getElementById('generate-report-wrapper');

    // ============================
    // 2. Variables & Initial Setup
    // ============================
    let messageData = {
        text: '',
        file: null
    };
    let isLoggedIn = false;
    let chatHistory = [];
    const MAX_HISTORY = 20;
    let username = '';
    let sessionname = '';

    // ============================
    // 3. Login & Authentication
    // ============================
    async function checkLoginStatus() {
        try {
            const response = await fetch('/check_login');
            if (!response.ok) {
                throw new Error('Failed to check login status');
            }
            const data = await response.json();
            isLoggedIn = data.isLoggedIn;
            username = data.username;
            sessionname = data.sessionname;
            toggleButtons();

            if (isLoggedIn) {
                loginOverlay.style.display = 'none';
                alert(`Welcome, ${username}!`);
                userIconWrapper.style.display = 'inline-block';
                usernameDisplay.textContent = username;

                // Display session name (session count or active session)
                if (sessionname) {
                    sessionnameDisplay.textContent = `Session: ${sessionname}`;
                } else {
                    sessionnameDisplay.textContent = 'No active session found';
                }
            } else {
                showLoginPrompt();
            }
        } catch (error) {
            console.error('Error fetching login status:', error);
        }
    }

    // Function to show the login prompt
    function showLoginPrompt() {
        const interval = setInterval(function () {
            document.getElementById('login-overlay').style.display = 'block';
        }, 5000);

        document.getElementById('login-overlay').addEventListener('click', function (event) {
            if (event.target === document.getElementById('login-overlay')) {
                document.getElementById('login-overlay').style.display = 'none';
                clearInterval(interval);
            }
        });
    }

    // ============================
    // 4. UI & Interaction Management
    // ============================
    function toggleButtons() {
        if (isLoggedIn) {
            loginButton.style.display = 'none';
            registerButton.style.display = 'none';
            exportHistoryButton.disabled = false;
        } else {
            loginButton.style.display = 'block';
            registerButton.style.display = 'block';
            exportHistoryButton.disabled = true;
        }
    }

    // ============================
    // 5. Logout Functionality
    // ============================
    // Logout button event listener
    dropdownLogoutButton.addEventListener('click', async function () {
        await logout();
    });

    async function logout() {
        try {
            const response = await fetch('/logout', {
                method: 'GET'
            });
            await response.json();

            alert("You have been logged out.");
            isLoggedIn = false;
            toggleButtons();
            window.location.href = '/';
        } catch (error) {
            console.error('Logout error:', error);
            alert('An error occurred while logging out.');
        }
    }
    
    // ============================
    // 6. Message Management
    // ============================
    // Function to display the message and file in the chat
    function showMessage(content, type = 'incoming', messageData = {}, timestamp = '') {
        const messageElement = document.createElement('li');
        messageElement.classList.add('chat', type);

        let messageContent = '';

        // Add icon based on message type
        messageContent += `
            <span class="material-symbols-outlined">${type === 'incoming' ? 'smart_toy' : 'person'}</span>
        `;

        // Show message text if available
        if (content) {
            messageContent += `<p>${content}</p>`;
        }

        // Handle file attachments
        if (messageData.file) {
            // If the file is an image, show the image preview
            if (messageData.file.type.startsWith('image/')) {
                messageContent += `<img src="${URL.createObjectURL(messageData.file)}" class="attachment" />`;
            } else {
                // If not an image, show the file name
                messageContent += `<pre class="file-preview">File attached: ${messageData.file.name}</pre>`;
            }
        }

        // Apply the compiled message content to the message element
        messageElement.innerHTML = messageContent;
        chatbox.appendChild(messageElement);
        chatbox.scrollTop = chatbox.scrollHeight;
    }

    // Function to send a message to the API
    async function sendMessageToAPI() {
        const formData = new FormData();

        // Attach the message text if available
        if (messageData.text) {
            formData.append('message', messageData.text);
        }

        // Attach the file if available
        if (messageData.file) {
            formData.append('file', messageData.file);
        }

        try {
            const response = await fetch('/process', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            console.log('API result:', result); // Debugging line

            // If the backend provides a response, show it
            if (result.response) {
                let responseMessage = result.response;
                showMessage(responseMessage, 'incoming', {}, new Date().toLocaleString());
            } else {
                // If there's no response from GPT, handle gracefully
                showMessage('No response from GPT', 'incoming', {}, new Date().toLocaleString());
            }
        } catch (error) {
            console.error('API Error:', error);
            showMessage('Sorry, there was an error processing your request.', 'incoming', {}, new Date().toLocaleString());
        }
    }

    // Function to send a message
    async function sendMessage() {
        const message = userInput.value.trim();

        // If there's no message and no file, return
        if (!message && !messageData.file) return;

        // Prepare message data and show message
        if (message || messageData.file) {
            messageData.text = message || '';
            showMessage(message, 'outgoing', messageData, new Date().toLocaleString());
            userInput.value = ''; // Clear input after sending
        }

        // Send the message and file to the backend
        await sendMessageToAPI();
        resetFileInput();
    }

    // ============================
    // 7. Report Generation with Progress Bar
    // ============================
    // Function to handle the report generation (without interfering with chat)
    async function generateReport() {
        if (!isLoggedIn) {
            alert("You must be logged in to generate a report.");
            window.location.href = '/login'; // Redirect to login page
            return;
        }

        const formData = new FormData();

        // Get the file from the input (report-file-input)
        const reportFileInput = document.getElementById("report-file-input");
        const file = reportFileInput.files[0];

        // Check if a file was selected
        if (!file) {
            alert("Please select a file to generate the report.");
            return;
        }

        // Show the progress bar and the text
        document.getElementById("progress-container").style.display = "block";
        const progressBar = document.getElementById("progress-bar");
        const progressText = document.getElementById("progress-text");

        // Add the file to FormData
        formData.append("file", file);

        // Simulate a progress bar update (since fetch doesn't directly expose upload progress)
        let progress = 0;
        const interval = setInterval(() => {
            progress = Math.min(progress + 10, 90);  // Increase progress in steps of 10%
            progressBar.value = progress;
            if (progress >= 90) {
                clearInterval(interval);  // Stop simulating progress when near completion
            }
        }, 500);

        try {
            const response = await fetch("/report", {
                method: "POST",
                body: formData,
            });

            // Once the request completes, set the progress to 100%
            progressBar.value = 100;

            if (!response.ok) {
                throw new Error("Failed to generate report");
            }

            // Get the blob response (the report file)
            const blob = await response.blob();
            
            // Create a temporary link to download the file
            const downloadLink = document.createElement("a");
            const url = window.URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.download = "report.txt";  // Default filename for the report
            downloadLink.click();
            window.URL.revokeObjectURL(url);  // Clean up the object URL

        } catch (error) {
            console.error("Error generating report:", error);
            alert("There was an issue generating the report. Please try again.");
        } finally {
            // Hide the progress bar and text after the process is complete
            document.getElementById("progress-container").style.display = "none";

            // Reset the file input and file name display to default
            document.getElementById("report-file-input").value = "";  // Clear the file input
            document.getElementById("report-file-name").textContent = "No file chosen";  // Reset the displayed file name
        }
    }

    // Function to update the file name in the UI and auto-generate the report
    function updateFileName() {
        const reportFileInput = document.getElementById("report-file-input");
        const fileName = reportFileInput.files[0] ? reportFileInput.files[0].name : "No file chosen";
        document.getElementById("report-file-name").textContent = fileName;

        // Call the generateReport function immediately after the file is selected
        generateReport();
    }

    // Event listener for the report file input to update the file name and trigger report generation when a file is selected
    document.getElementById("report-file-input").addEventListener("change", updateFileName);

    // ============================
    // 8. History Management
    // ============================
    // Load chat history dynamically
    async function loadChatHistory() {
        if (!isLoggedIn) return;

        try {
            const response = await fetch('/get_chat_history');
            const data = await response.json();

            if (data.success) {
                historyList.innerHTML = ''; // Clear existing history
                data.chat_history.forEach(entry => {
                    const historyItem = document.createElement('li');
                    historyItem.innerHTML = `
                        <span class="material-symbols-outlined">history</span>
                        <p><strong>Session:</strong> ${entry.session_name || 'No session name available'}</p>
                        <p><strong>Message:</strong> ${entry.message}</p>
                        <p><strong>Response:</strong> ${entry.response}</p>
                        <span class="timestamp">${entry.timestamp}</span>
                    `;
                    historyList.appendChild(historyItem);
                });
            } else {
                console.error("Failed to load chat history:", data.message);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    // Debounce function to prevent redundant fetches
    function debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    }

    // Enable scroll in the history panel
    function enableHistoryScroll() {
        const maxHeight = window.innerHeight * 0.5;
        historyPanel.style.maxHeight = `${maxHeight}px`;
        historyPanel.style.overflowY = 'auto';
    }

    // Toggle visibility of the history panel and load chat history dynamically
    historyButton.addEventListener('click', debounce(function () {
        const isVisible = historyPanel.style.left === '0px';
        historyPanel.style.left = isVisible ? '-350px' : '0';

        if (!isVisible) {
            loadChatHistory(); // Load chat history only when the panel is opened
        }
    }, 300)); // Debounced to avoid rapid calls

    // Close history panel if clicked outside
    document.addEventListener('click', function (event) {
        if (!historyPanel.contains(event.target) && event.target !== historyButton) {
            historyPanel.style.left = '-350px';
        }
    });

    // Fetch session names and populate the session dropdown
    async function fetchSessions() {
        try {
            const response = await fetch('/get_chat_history');
            const data = await response.json();

            if (data.success) {
                const sessionSelect = document.getElementById('session_select');
                sessionSelect.innerHTML = '';

                const uniqueSessions = new Set();
                data.chat_history.forEach(entry => {
                    uniqueSessions.add(entry.session_name); // Add session_name to the Set (ensures uniqueness)
                });

                // Populate the dropdown with session names
                uniqueSessions.forEach(session_name => {
                    const option = document.createElement('option');
                    option.value = session_name;
                    option.textContent = `Session ${session_name}`;
                    sessionSelect.appendChild(option);
                });
            } else {
                console.error('Failed to fetch chat history:', data.message);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    }

    // Function to filter the chat history based on session name
    document.getElementById('filter-history-btn').addEventListener('click', async () => {
        const selectedSessionName = document.getElementById('session_select').value;

        if (!selectedSessionName) {
            alert('Please select a session name to filter.');
            return;
        }

        try {
            const response = await fetch(`/get_chat_history?session_name=${selectedSessionName}`);
            const data = await response.json();

            if (data.success) {
                const historyList = document.getElementById('history-list');
                historyList.innerHTML = '';  // Clear existing history

                // Display filtered chat history in the desired format
                data.chat_history.forEach(chat => {
                    // Create a new list item
                    const listItem = document.createElement('li');
                    
                    // Construct the HTML content for each chat entry
                    listItem.innerHTML = `
                        <span class="material-symbols-outlined">history</span>
                        <p><strong>Session:</strong> ${chat.session_name || 'No session name available'}</p>
                        <p><strong>Message:</strong> ${chat.message}</p>
                        <p><strong>Response:</strong> ${chat.response}</p>
                        <span class="timestamp">${chat.timestamp}</span>
                    `;
                    
                    // Append the formatted list item to the history list
                    historyList.appendChild(listItem);
                });
            } else {
                console.error('Failed to filter chat history:', data.message);
            }
        } catch (error) {
            console.error('Error filtering chat history:', error);
        }
    });

    // Function to delete chat history based on session name
    document.getElementById('delete-history-btn').addEventListener('click', async () => {
        const selectedSessionName = document.getElementById('session_select').value;

        if (!selectedSessionName) {
            alert('Please select a session name to clear.');
            return;
        }

        const confirmation = confirm(`Are you sure you want to delete session: ${selectedSessionName}?`);

        if (!confirmation) {
            return;
        }

        try {
            // Send DELETE request to clear the chat history for the selected session
            const response = await fetch(`/clear_chat_history?session_name=${selectedSessionName}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                alert(`Chat history for session '${selectedSessionName}' has been cleared.`);
                fetchSessions(); // Reload sessions
                loadChatHistory(); // Reload chat history
            } else {
                alert(`Failed to delete session: ${data.message}`);
            }
        } catch (error) {
            console.error('Error deleting session:', error);
            alert('An error occurred while deleting session.');
        }
    });

    // ============================
    // 9. File Upload Management
    // ============================
    fileInput.addEventListener('change', function (event) {
        if (!isLoggedIn) {
            alert("You must be logged in to upload a file.");
            fileInput.value = '';
            window.location.href = '/login';
            return;
        }

        const file = event.target.files[0];
        if (file) {
            messageData.file = file;
            const reader = new FileReader();
            reader.onload = function () {
                fileUploadWrapper.querySelector('img').src = reader.result;
            };
            reader.readAsDataURL(file);
            fileUploadWrapper.querySelector('p').textContent = file.name;
            fileUploadWrapper.classList.add('file-uploaded');
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds 5MB.');
            return;
        }

        if (!validateFile(file)) return;

        messageData.file = file;
        const reader = new FileReader();
        reader.onload = function (e) {
            fileUploadWrapper.querySelector('img').src = e.target.result;
        };
        reader.readAsDataURL(file);

        fileUploadWrapper.querySelector('p').textContent = file.name;
        fileUploadWrapper.classList.add('file-uploaded');
    });

    function validateFile(file) {
        const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'application/json', 'text/plain',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/x-regedit', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel', 'application/pdf', 'text/markdown'
        ];
        const allowedExtensions = ['.reg', '.json', '.txt', '.img', '.docx', '.pdf', '.jpg', '.jpeg', '.png', '.csv', '.xlsx', '.md'];

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            alert('The file type is not supported.');
            return false;
        }
        return true;
    }

    function resetFileInput() {
        messageData.file = null;
        if (fileUploadWrapper) {
            fileUploadWrapper.classList.remove('file-uploaded');
            const fileImage = fileUploadWrapper.querySelector('img');
            if (fileImage) fileImage.src = '';
            const fileLabel = fileUploadWrapper.querySelector('p');
            if (fileLabel) fileLabel.textContent = 'No file chosen';
            fileInput.value = '';
        }
    }

    // ============================
    // 10. Account Management
    // ============================
    deleteAccountBtn.addEventListener('click', async function () {
        const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");
        if (confirmDelete) {
            await deleteAccount();
        }
    });

    async function deleteAccount() {
        try {
            const response = await fetch('/delete_account', {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                alert("Your account has been deleted.");
                window.location.href = '/';
            } else {
                alert("Failed to delete your account.");
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('An error occurred while trying to delete your account.');
        }
    }
    // ============================
    // 11. UI user-dropdown
    // ============================
    // Helper to show the dropdown
    const showDropdown = () => {
        dropdown.classList.add('visible');
    };
    
    // Helper to hide the dropdown
    const hideDropdown = () => {
        dropdown.classList.remove('visible');
    };
    
    // Track whether the mouse is over either the icon or dropdown
    let isHoveringIcon = false;
    let isHoveringDropdown = false;
    
    // Add event listeners to the user icon
    userIcon.addEventListener('mouseenter', () => {
        isHoveringIcon = true;
        showDropdown();
    });
    
    userIcon.addEventListener('mouseleave', () => {
        isHoveringIcon = false;
        if (!isHoveringDropdown) {
        setTimeout(() => {
            if (!isHoveringIcon && !isHoveringDropdown) hideDropdown();
        }, 100); // Small delay to handle mouse movement
        }
    });
    
    // Add event listeners to the dropdown
    dropdown.addEventListener('mouseenter', () => {
        isHoveringDropdown = true;
        showDropdown();
    });
    
    dropdown.addEventListener('mouseleave', () => {
        isHoveringDropdown = false;
        if (!isHoveringIcon) {
        setTimeout(() => {
            if (!isHoveringIcon && !isHoveringDropdown) hideDropdown();
        }, 100); // Small delay to handle mouse movement
        }
    });

    // ============================
    // 12. Final Setup & Event Listeners
    // ============================
    sendButton.addEventListener('click', sendMessage);

    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    const initialInputHeight = userInput.scrollHeight;
    userInput.addEventListener('input', function () {
        userInput.style.height = `${Math.max(initialInputHeight, userInput.scrollHeight)}px`;
        document.querySelector(".chat-input").style.borderRadius = userInput.scrollHeight > initialInputHeight ? "15px" : "32px";
    });

    // Function to export chat history
    document.getElementById('export-history-btn-panel').addEventListener('click', async () => {
        const selectedSessionName = document.getElementById('session_select').value;

        try {
            const response = await fetch(`/export_chat_history?session_name=${selectedSessionName}`);

            if (response.ok) {
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'chat_history.json';
                link.click();
            } else {
                console.error('Error exporting chat history');
            }
        } catch (error) {
            console.error('Error exporting chat history:', error);
        }
    });

    // Initial Setup
    await checkLoginStatus();
    fetchSessions();
    loadChatHistory();
});
