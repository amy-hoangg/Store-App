/**
 * TODO: 8.4 Register new user
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmationInput = document.getElementById('passwordConfirmation');
    const notificationsContainer = document.getElementById('notifications-container');
  
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      // Get user input
      const name = nameInput.value;
      const email = emailInput.value;
      const password = passwordInput.value;
      const passwordConfirmation = passwordConfirmationInput.value;
  
      // Check if password and password confirmation match
      if (password !== passwordConfirmation) {
        createNotification(notificationsContainer, 'Passwords do not match', 'error');
        return;
      }
  
      // Create user object with role "customer"
      const user = {
        name: name,
        email: email,
        password: password,
        role: 'customer',
      };
  
      // Send the registration data to the server
      const registrationResponse = await postOrPutJSON('/api/register', user, 'POST');
  
      if (registrationResponse.status === 201) {
        createNotification(notificationsContainer, 'Registration successful', 'success');
        // Reset the form
        registerForm.reset();
      } else {
        const responseText = await registrationResponse.text();
        createNotification(notificationsContainer, responseText, 'error');
      }
    });
  });