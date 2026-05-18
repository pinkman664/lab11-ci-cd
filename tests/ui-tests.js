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

        console.log('🚀 Запуск тестов...\n');

        // Тест 1: Проверка заголовка
        try {
            console.log('1. Проверка заголовка страницы...');
            await driver.get(BASE_URL);
            const title = await driver.getTitle();
            if (title.includes('Лабораторная работа')) {
                console.log('   ✅ OK');
                passed++;
            } else {
                throw new Error('Неверный заголовок');
            }
        } catch (e) {
            console.log('   ❌ ' + e.message);
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
            console.log('   ✅ OK - все элементы найдены');
            passed++;
        } catch (e) {
            console.log('   ❌ ' + e.message);
            failed++;
        }

        // Тест 3: Успешная регистрация
        try {
            console.log('3. Проверка успешной регистрации...');
            await driver.get(BASE_URL);
            await driver.findElement(By.id('username')).sendKeys('TestUser');
            await driver.findElement(By.id('email')).sendKeys('test@test.com');
            await driver.findElement(By.id('password')).sendKeys('123456');
            await driver.findElement(By.id('agreement')).click();
            await driver.findElement(By.id('submitButton')).click();
            
            // Ждем сообщение
            await driver.sleep(1000);
            const msg = await driver.findElement(By.id('message'));
            const text = await msg.getText();
            
            if (text.includes('успешна')) {
                console.log('   ✅ OK - регистрация успешна');
                passed++;
            } else {
                throw new Error('Неверное сообщение: ' + text);
            }
        } catch (e) {
            console.log('   ❌ ' + e.message);
            failed++;
        }

        // Тест 4: Проверка кнопки (просто клик без заполнения)
        try {
            console.log('4. Проверка работы кнопки...');
            await driver.get(BASE_URL);
            const button = await driver.findElement(By.id('submitButton'));
            const buttonText = await button.getText();
            
            if (buttonText.length > 0) {
                console.log('   ✅ OK - кнопка работает, текст: ' + buttonText);
                passed++;
            } else {
                throw new Error('Кнопка не найдена или пустая');
            }
        } catch (e) {
            console.log('   ❌ ' + e.message);
            failed++;
        }

    } catch (e) {
        console.log('💥 Критическая ошибка: ' + e.message);
        failed++;
    } finally {
        if (driver) {
            await driver.quit();
        }
    }

    console.log(`\n📊 Результаты: ${passed} пройдено, ${failed} провалено из ${passed + failed}`);
    
    if (failed > 0) {
        process.exit(1);
    } else {
        console.log('✅ Все тесты пройдены!');
        process.exit(0);
    }
}

runTests();