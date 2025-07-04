// Enhanced script to unfollow users on Threads with modal confirmation
async function unfollowUsersOnThreads() {
  let unfollowedCount = 0;
  let processedButtons = new Set(); // Track processed buttons to avoid duplicates
  
  console.log('Starting unfollow process...');
  
  // Function to wait for element to appear
  function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      function check() {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        } else {
          setTimeout(check, 100);
        }
      }
      
      check();
    });
  }
  
  // Function to click unfollow modal button
  async function handleUnfollowModal() {
    try {
      // Wait for the modal to appear and find the unfollow button
      const unfollowButton = await waitForElement('button:has-text("Unfollow"), div[role="button"]:has-text("Unfollow")');
      
      if (unfollowButton) {
        unfollowButton.click();
        console.log('Clicked unfollow confirmation button');
        return true;
      }
    } catch (error) {
      console.log('Modal unfollow button not found, trying alternative selectors...');
      
      // Alternative approach - look for buttons containing "Unfollow" text
      const allButtons = document.querySelectorAll('button, div[role="button"]');
      for (let btn of allButtons) {
        if (btn.textContent.trim() === 'Unfollow') {
          btn.click();
          console.log('Clicked unfollow confirmation button (alternative method)');
          return true;
        }
      }
    }
    
    return false;
  }
  
  // Main unfollow process
  while (true) {
    // Find all "Following" buttons
    const followingButtons = Array.from(document.querySelectorAll('div[tabindex]:not([tabindex="-1"]), button, div[role="button"]'))
      .filter(btn => 
        btn.textContent.includes('Following') && 
        !processedButtons.has(btn) &&
        btn.offsetParent !== null // Check if element is visible
      );
    
    if (followingButtons.length === 0) {
      console.log('No more "Following" buttons found. Scrolling to load more...');
      
      // Scroll down to load more content
      window.scrollBy(0, window.innerHeight);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check again after scrolling
      const newButtons = Array.from(document.querySelectorAll('div[tabindex]:not([tabindex="-1"]), button, div[role="button"]'))
        .filter(btn => 
          btn.textContent.includes('Following') && 
          !processedButtons.has(btn) &&
          btn.offsetParent !== null
        );
      
      if (newButtons.length === 0) {
        console.log('No new buttons found after scrolling. Process complete.');
        break;
      }
    }
    
    // Process the first available button
    const button = followingButtons[0];
    if (button) {
      console.log(`Attempting to unfollow user...`);
      
      // Mark button as processed
      processedButtons.add(button);
      
      // Click the "Following" button
      button.click();
      
      // Wait for modal to appear
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Handle the unfollow confirmation modal
      const modalHandled = await handleUnfollowModal();
      
      if (modalHandled) {
        unfollowedCount++;
        console.log(`Successfully unfollowed user #${unfollowedCount}`);
        
        // Wait before processing next user
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        console.log('Failed to find or click unfollow confirmation button');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.log(`Unfollow process completed. Total unfollowed: ${unfollowedCount}`);
  return unfollowedCount;
}

// Execute the function
unfollowUsersOnThreads().catch(console.error);
