# Complete Atlassian Setup Instructions for Claude Code

## Quick Setup (Copy-Paste Ready)

### Step 1: Create Environment File

Create a file called `.env.local` in your project root with this exact content:

```bash
# Atlassian Configuration
ATLASSIAN_JIRA_URL=https://bankimonline.atlassian.net
ATLASSIAN_USERNAME=aizek941977@gmail.com
ATLASSIAN_API_TOKEN=YOUR_JIRA_API_TOKEN_HERE
```

### Step 2: Create MCP Configuration

Create a file called `mcp-atlassian-config.json` with this content:

```json
{
  "mcpServers": {
    "atlassian": {
      "type": "stdio",
      "command": "docker",
      "args": [
        "exec", 
        "-i", 
        "intelligent_jemison",
        "/app/.venv/bin/mcp-atlassian",
        "--jira-url", 
        "https://bankimonline.atlassian.net",
        "--jira-username", 
        "aizek941977@gmail.com",
        "--jira-token",
        "YOUR_JIRA_API_TOKEN_HERE"
      ]
    }
  }
}
```

### Step 3: Alternative Configuration (Without Docker)

If you don't have Docker or prefer using NPX, create this configuration instead:

```json
{
  "mcpServers": {
    "atlassian": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-atlassian",
        "--jira-url",
        "https://bankimonline.atlassian.net",
        "--jira-username",
        "aizek941977@gmail.com",
        "--jira-token",
        "YOUR_JIRA_API_TOKEN_HERE"
      ]
    }
  }
}
```

### Step 4: Test Script (Optional)

Create `test-connection.js` to verify the connection:

```javascript
#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Direct configuration with API key
const JIRA_URL = 'https://bankimonline.atlassian.net';
const USERNAME = 'aizek941977@gmail.com';
const API_TOKEN = 'YOUR_JIRA_API_TOKEN_HERE';

// Base64 encode credentials
const auth = Buffer.from(`${USERNAME}:${API_TOKEN}`).toString('base64');

console.log('Testing Atlassian API connection...');

const url = new URL('/rest/api/3/myself', JIRA_URL);

const options = {
  hostname: url.hostname,
  path: url.pathname,
  method: 'GET',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Accept': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      const user = JSON.parse(data);
      console.log('✅ CONNECTION SUCCESSFUL!');
      console.log(`Connected as: ${user.displayName}`);
      console.log(`Email: ${user.emailAddress}`);
    } else {
      console.error(`❌ Connection failed with status: ${res.statusCode}`);
      console.error('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
});

req.end();
```

Run test with: `node test-connection.js`

## Complete Connection Details

### API Credentials
- **URL**: `https://bankimonline.atlassian.net`
- **Username**: `aizek941977@gmail.com`
- **API Token**: `[REDACTED - Use your own Atlassian API token]`

### Access Details
- **Account Type**: Atlassian
- **Display Name**: Bankimonline Admin
- **Account Active**: Yes
- **Spaces Available**: Bankimonline (Bankim)

### Available Endpoints

#### Jira REST API v3
```
Base URL: https://bankimonline.atlassian.net/rest/api/3/
- Get current user: /myself
- Search issues: /search
- Get projects: /project
- Get issue: /issue/{issueIdOrKey}
- Create issue: /issue (POST)
- Update issue: /issue/{issueIdOrKey} (PUT)
```

#### Confluence REST API
```
Base URL: https://bankimonline.atlassian.net/wiki/rest/api/
- Get content: /content/{id}
- Search content: /content/search
- Create page: /content (POST)
- Update page: /content/{id} (PUT)
- Get spaces: /space
```

### Example Confluence Pages
- Main Documentation: `https://bankimonline.atlassian.net/wiki/spaces/Bankim/pages/5472277/BANKIMONLINE`
- Page ID: `5472277`
- Space Key: `Bankim`

## Quick Copy Commands

### For Unix/Mac:
```bash
# Create .env.local with credentials
cat << 'EOF' > .env.local
ATLASSIAN_JIRA_URL=https://bankimonline.atlassian.net
ATLASSIAN_USERNAME=aizek941977@gmail.com
ATLASSIAN_API_TOKEN=[YOUR_API_TOKEN_HERE]
EOF

# Secure the file
chmod 600 .env.local
```

### For Windows PowerShell:
```powershell
# Create .env.local with credentials
@"
ATLASSIAN_JIRA_URL=https://bankimonline.atlassian.net
ATLASSIAN_USERNAME=aizek941977@gmail.com
ATLASSIAN_API_TOKEN=[YOUR_API_TOKEN_HERE]
"@ | Out-File -FilePath .env.local -Encoding UTF8
```

## Direct API Usage Examples

### Using curl
```bash
# Get current user
curl -u aizek941977@gmail.com:[YOUR_API_TOKEN] \
  https://bankimonline.atlassian.net/rest/api/3/myself

# Get Confluence page
curl -u aizek941977@gmail.com:[YOUR_API_TOKEN] \
  https://bankimonline.atlassian.net/wiki/rest/api/content/5472277
```

### Using Python
```python
import requests
from requests.auth import HTTPBasicAuth

auth = HTTPBasicAuth(
    'aizek941977@gmail.com',
    '[YOUR_API_TOKEN]'
)

# Get current user
response = requests.get(
    'https://bankimonline.atlassian.net/rest/api/3/myself',
    auth=auth
)
print(response.json())
```

## Notes
- This token provides full access to Bankimonline Atlassian workspace
- The token is currently active and working
- Connection verified and tested successfully

## Contact
- Atlassian Account: aizek941977@gmail.com
- Workspace: bankimonline.atlassian.net