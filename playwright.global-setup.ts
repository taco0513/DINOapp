import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  // Set up any global test data or configuration
  console.log('Setting up global test environment...')
  
  // Launch browser for setup
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3000')
    
    // Set up any required local storage or session data
    await page.evaluate(() => {
      // Set up mock authentication state
      localStorage.setItem('test-setup', 'complete')
      
      // Set up any other global state needed for tests
      localStorage.setItem('theme', 'light')
      localStorage.setItem('language', 'ko')
    })
    
    console.log('Global setup completed successfully')
  } catch (error) {
    console.error('Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup