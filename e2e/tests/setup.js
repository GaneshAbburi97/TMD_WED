import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import 'dotenv/config';

let driver;

export const initDriver = async () => {
    let options = new chrome.Options();
    // options.addArguments('--headless'); // Uncomment for headless execution
    options.addArguments('--window-size=1920,1080');

    driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    
    // Set an implicit wait
    await driver.manage().setTimeouts({ implicit: 5000 });
    return driver;
};

export const quitDriver = async () => {
    if (driver) {
        await driver.quit();
    }
};

export const getDriver = () => driver;
