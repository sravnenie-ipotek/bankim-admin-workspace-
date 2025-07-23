import React, { useState } from 'react';
import './QAMortgage.css';

interface TestResult {
  testName: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  data?: any;
}

const QAMortgage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (testName: string, status: TestResult['status'], message: string, data?: any) => {
    setTestResults(prev => {
      const existing = prev.find(t => t.testName === testName);
      if (existing) {
        return prev.map(t => t.testName === testName ? { ...t, status, message, data } : t);
      }
      return [...prev, { testName, status, message, data }];
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Backend Health Check
    updateTest('Backend Health Check', 'running', 'Checking backend server...');
    try {
      const healthResponse = await fetch('http://localhost:3001/health');
      const healthData = await healthResponse.json();
      if (healthData.status === 'healthy') {
        updateTest('Backend Health Check', 'passed', 'Backend is healthy', healthData);
      } else {
        updateTest('Backend Health Check', 'failed', 'Backend is not healthy', healthData);
      }
    } catch (error) {
      updateTest('Backend Health Check', 'failed', `Error: ${error}`, null);
    }

    // Test 2: Mortgage Endpoint
    updateTest('Mortgage Endpoint Test', 'running', 'Fetching mortgage content...');
    try {
      const mortgageResponse = await fetch('http://localhost:3001/api/content/mortgage');
      const mortgageData = await mortgageResponse.json();
      
      if (mortgageData.success && mortgageData.data) {
        const itemCount = mortgageData.data.mortgage_content?.length || 0;
        updateTest('Mortgage Endpoint Test', 'passed', 
          `Successfully fetched ${itemCount} mortgage items`, mortgageData);
      } else {
        updateTest('Mortgage Endpoint Test', 'failed', 
          `Failed: ${mortgageData.error || 'Unknown error'}`, mortgageData);
      }
    } catch (error) {
      updateTest('Mortgage Endpoint Test', 'failed', `Error: ${error}`, null);
    }

    // Test 3: Database Query Test
    updateTest('Database Query Test', 'running', 'Testing database connection...');
    try {
      const dbResponse = await fetch('http://localhost:3001/api/db-info');
      const dbData = await dbResponse.json();
      
      if (dbData.success && dbData.data) {
        updateTest('Database Query Test', 'passed', 
          `Database connected with ${dbData.data.tables?.length || 0} tables`, dbData);
      } else {
        updateTest('Database Query Test', 'failed', 'Database connection failed', dbData);
      }
    } catch (error) {
      updateTest('Database Query Test', 'failed', `Error: ${error}`, null);
    }

    // Test 4: Frontend API Service Test
    updateTest('Frontend API Service', 'running', 'Testing frontend API service...');
    try {
      const { apiService } = await import('../../services/api');
      const response = await apiService.getContentByContentType('mortgage');
      
      if (response.success && response.data) {
        updateTest('Frontend API Service', 'passed', 
          `API service returned ${response.data.length} items`, response);
      } else {
        updateTest('Frontend API Service', 'failed', 
          `API service failed: ${response.error}`, response);
      }
    } catch (error) {
      updateTest('Frontend API Service', 'failed', `Error: ${error}`, null);
    }

    // Test 5: Menu Translations (for comparison)
    updateTest('Menu Translations Test', 'running', 'Fetching menu translations...');
    try {
      const menuResponse = await fetch('http://localhost:3001/api/content/menu/translations');
      const menuData = await menuResponse.json();
      
      if (menuData.success && menuData.data) {
        const itemCount = menuData.data.menu_items?.length || 0;
        updateTest('Menu Translations Test', 'passed', 
          `Successfully fetched ${itemCount} menu items`, menuData);
      } else {
        updateTest('Menu Translations Test', 'failed', 'Failed to fetch menu translations', menuData);
      }
    } catch (error) {
      updateTest('Menu Translations Test', 'failed', `Error: ${error}`, null);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'passed': return '✅';
      case 'failed': return '❌';
    }
  };

  const getStatusClass = (status: TestResult['status']) => {
    return `test-status test-${status}`;
  };

  return (
    <div className="qa-mortgage-container">
      <div className="qa-header">
        <h1>QA Test Tool - Mortgage Content</h1>
        <p>This tool tests the mortgage content database integration</p>
      </div>

      <div className="qa-controls">
        <button 
          className="run-tests-btn" 
          onClick={runTests} 
          disabled={isRunning}
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
      </div>

      <div className="test-results">
        <h2>Test Results</h2>
        
        {testResults.length === 0 ? (
          <div className="no-tests">Click "Run All Tests" to start testing</div>
        ) : (
          <div className="test-list">
            {testResults.map((test, index) => (
              <div key={index} className="test-item">
                <div className="test-header">
                  <span className={getStatusClass(test.status)}>
                    {getStatusIcon(test.status)}
                  </span>
                  <span className="test-name">{test.testName}</span>
                </div>
                <div className="test-message">{test.message}</div>
                {test.data && (
                  <details className="test-data">
                    <summary>View Response Data</summary>
                    <pre>{JSON.stringify(test.data, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="qa-info">
        <h3>What this tests:</h3>
        <ul>
          <li>Backend server health at port 3001</li>
          <li>Mortgage endpoint: <code>/api/content/mortgage</code></li>
          <li>Database connection and tables</li>
          <li>Frontend API service integration</li>
          <li>Menu translations endpoint for comparison</li>
        </ul>
        
        <h3>Expected behavior:</h3>
        <ul>
          <li>The mortgage endpoint should return content items with <code>screen_location = 'mortgage_calculation'</code></li>
          <li>Each item should have translations in RU, HE, and EN</li>
          <li>The frontend should display these items in the content list</li>
        </ul>
      </div>
    </div>
  );
};

export default QAMortgage;