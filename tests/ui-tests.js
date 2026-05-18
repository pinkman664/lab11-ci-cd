const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = 'http://localhost:8080';

const options = new chrome.Options();
options.addArguments('--headless=new');
options.addArguments('--no-sandbox');
options.addArguments('--disable-dev-shm-usage');

async function runTests() {
    let driver;
    let passed = 0;
    let failed = 0;

    try {
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        console.log('Запуск тестов...\n');

        // Тест 1: Проверка заголовка
        try {
            console.log('1. Проверка заголовка страницы...');
            await driver.get(BASE_URL);
            const title = await driver.getTitle();
            if (title.includes('Лабораторная работа')) {
                console.log('   OK - заголовок правильный');
                passed++;
            } else {
                throw new Error('Неверный заголовок');
            }
        } catch (e) {
            console.log('   ОШИБКА - ' + e.message);
            failed++;
        }

        // Тест 2: Проверка элементов формы
        try {
            console.log('2. Проверка элементов формы...');
            await driver.get(BASE_URL);
            await driver.findElement(By.id('username'));
            await driver.findElement(By.id('email'));
            await driver.findElement(By.id('password'));
            await driver.findElement(By.id('agreement'));
            await driver.findElement(By.id('submitButton'));
            console.log('   OK - все элементы найдены');
            passed++;
        } catch (e) {
            console.log('   ОШИБКА - ' + e.message);
            failed++;
        }

        // Тест 3: Успешная регистрация
        try {
            console.log('3. Проверка успешной регистрации...');
            await driver.get(BASE_URL);
            await driver.findElement(By.id('username')).sendKeys('TestUser');
            await driver.findElement(By.id('email')).sendKeys('test@example.com');
            await driver.findElement(By.id('password')).sendKeys('password123');
            await driver.findElement(By.id('agreement')).click();
            await driver.findElement(By.id('submitButton')).click();
            
            const msg = await driver.wait(until.elementLocated(By.id('message')), 5000);
            await driver.wait(until.elementIsVisible(msg), 5000);
            const text = await msg.getText();
            
            if (text.includes('успешна')) {
                console.log('   OK - регистрация успешна');
                passed++;
            } else {
                throw new Error('Нет сообщения об успехе');
            }
        } catch (e) {
            console.log('   ОШИБКА - ' + e.message);
            failed++;
        }

        // Тест 4: Валидация пустых полей
        try {
            console.log('4. Проверка валидации пустых полей...');
            await driver.get(BASE_URL);
            await driver.findElement(By.id('submitButton')).click();
            
            const msg = await driver.wait(until.elementLocated(By.id('message')), 5000);
            await driver.wait(until.elementIsVisible(msg), 5000);
            const className = await msg.getAttribute('class');
            
            if (className.includes('error')) {
                console.log('   OK - ошибка валидации показана');
                passed++;
            } else {
                throw new Error('Нет сообщения об ошибке');
            }
        } catch (e) {
            console.log('   ОШИБКА - ' + e.message);
            failed++;
        }

    } finally {
        if (driver) {
            await driver.quit();
        }
    }

    console.log(`\nРезультаты: ${passed} пройдено, ${failed} провалено из ${passed + failed}`);
    
    if (failed > 0) {
        process.exit(1);
    }
}

runTests();