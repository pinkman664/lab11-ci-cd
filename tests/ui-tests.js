const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');

// URL тестируемой страницы
const BASE_URL = 'http://localhost:8080';

// Настройка Chrome options
const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--headless'); // Запуск в безголовом режиме
chromeOptions.addArguments('--no-sandbox');
chromeOptions.addArguments('--disable-dev-shm-usage');
chromeOptions.addArguments('--disable-gpu');

class UITests {
    constructor() {
        this.driver = null;
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    async setup() {
        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .build();
    }

    async teardown() {
        if (this.driver) {
            await this.driver.quit();
        }
    }

    async runTest(testName, testFunction) {
        this.testResults.total++;
        try {
            console.log(`\n🔍 Выполнение теста: ${testName}`);
            await testFunction();
            console.log(`✅ Тест пройден: ${testName}`);
            this.testResults.passed++;
            return true;
        } catch (error) {
            console.error(`❌ Тест не пройден: ${testName}`);
            console.error(`   Ошибка: ${error.message}`);
            this.testResults.failed++;
            return false;
        }
    }

    // Тест 1: Проверка заголовка страницы
    async testPageTitle() {
        await this.runTest('Проверка заголовка страницы', async () => {
            await this.driver.get(BASE_URL);
            const title = await this.driver.getTitle();
            
            if (title !== 'Форма регистрации - Лабораторная работа 11') {
                throw new Error(`Ожидаемый заголовок не совпадает. Получено: ${title}`);
            }
        });
    }

    // Тест 2: Проверка наличия всех элементов формы
    async testFormElements() {
        await this.runTest('Проверка наличия элементов формы', async () => {
            await this.driver.get(BASE_URL);
            
            const usernameInput = await this.driver.findElement(By.id('username'));
            const emailInput = await this.driver.findElement(By.id('email'));
            const passwordInput = await this.driver.findElement(By.id('password'));
            const checkbox = await this.driver.findElement(By.id('agreement'));
            const submitButton = await this.driver.findElement(By.id('submitButton'));
            
            if (!usernameInput || !emailInput || !passwordInput || !checkbox || !submitButton) {
                throw new Error('Не все элементы формы найдены на странице');
            }
        });
    }

    // Тест 3: Проверка успешной регистрации
    async testSuccessfulRegistration() {
        await this.runTest('Проверка успешной регистрации', async () => {
            await this.driver.get(BASE_URL);
            
            // Заполнение формы
            await this.driver.findElement(By.id('username')).sendKeys('TestUser');
            await this.driver.findElement(By.id('email')).sendKeys('test@example.com');
            await this.driver.findElement(By.id('password')).sendKeys('password123');
            await this.driver.findElement(By.id('agreement')).click();
            
            // Отправка формы
            await this.driver.findElement(By.id('submitButton')).click();
            
            // Ожидание сообщения об успехе
            const messageElement = await this.driver.wait(
                until.elementLocated(By.id('message')),
                5000
            );
            
            await this.driver.wait(
                until.elementIsVisible(messageElement),
                5000
            );
            
            const messageText = await messageElement.getText();
            const messageClass = await messageElement.getAttribute('class');
            
            if (!messageClass.includes('success')) {
                throw new Error('Сообщение не содержит класс success');
            }
            
            if (!messageText.includes('Регистрация успешна') || !messageText.includes('TestUser')) {
                throw new Error(`Неожиданное сообщение: ${messageText}`);
            }
        });
    }

    // Тест 4: Проверка валидации пустых полей
    async testEmptyFieldsValidation() {
        await this.runTest('Проверка валидации пустых полей', async () => {
            await this.driver.get(BASE_URL);
            
            // Отправка пустой формы
            await this.driver.findElement(By.id('submitButton')).click();
            
            // Ожидание сообщения об ошибке
            const messageElement = await this.driver.wait(
                until.elementLocated(By.id('message')),
                5000
            );
            
            await this.driver.wait(
                until.elementIsVisible(messageElement),
                5000
            );
            
            const messageClass = await messageElement.getAttribute('class');
            
            if (!messageClass.includes('error')) {
                throw new Error('Сообщение об ошибке не появилось');
            }
        });
    }

    async runAllTests() {
        console.log('🚀 Запуск автоматизированных тестов пользовательского интерфейса');
        console.log('=' .repeat(60));
        
        try {
            await this.setup();
            
            await this.testPageTitle();
            await this.testFormElements();
            await this.testSuccessfulRegistration();
            await this.testEmptyFieldsValidation();
            
            console.log('\n' + '='.repeat(60));
            console.log('📊 Результаты тестирования:');
            console.log(`   Всего тестов: ${this.testResults.total}`);
            console.log(`   Пройдено: ${this.testResults.passed}`);
            console.log(`   Провалено: ${this.testResults.failed}`);
            
            if (this.testResults.failed > 0) {
                console.log('\n❌ Некоторые тесты не пройдены!');
                process.exit(1);
            } else {
                console.log('\n✅ Все тесты успешно пройдены!');
                process.exit(0);
            }
            
        } catch (error) {
            console.error('\n💥 Критическая ошибка при выполнении тестов:', error.message);
            process.exit(1);
        } finally {
            await this.teardown();
        }
    }
}

// Запуск тестов
const tests = new UITests();
tests.runAllTests();