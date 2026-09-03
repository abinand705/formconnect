export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript / Node', icon: '🟨' },
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'c', name: 'C', icon: '🔵' },
  { id: 'cpp', name: 'C++', icon: '🔷' },
  { id: 'flutter', name: 'Flutter / Dart', icon: '🎯' },
  { id: 'curl', name: 'cURL', icon: '💻' },
  { id: 'php', name: 'PHP', icon: '🐘' },
  { id: 'go', name: 'Go', icon: '🐹' }
]

export function getEnvSnippet(apiKey, apiUrl = 'https://formconnect.onrender.com') {
  return `# FormConnect Configuration
FORMCONNECT_API_URL=${apiUrl}
FORMCONNECT_API_KEY=${apiKey || 'YOUR_API_KEY'}`
}

export function getCodeSnippet(language, apiKey, apiUrl = 'https://formconnect.onrender.com') {
  const key = apiKey || 'YOUR_API_KEY'
  const endpoint = `${apiUrl}/api/submit`

  switch (language) {
    case 'javascript':
      return `// 1. Install/use dotenv if in Node.js (or Vite / Next.js env variables):
// npm install dotenv

// If in Node.js:
// import 'dotenv/config'
// const apiKey = process.env.FORMCONNECT_API_KEY
// If in frontend Vite: import.meta.env.VITE_FORMCONNECT_API_KEY

async function submitForm(formData) {
  const response = await fetch('${endpoint}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      apiKey: process.env.FORMCONNECT_API_KEY || '${key}',
      data: formData || {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello from FormConnect!'
      }
    })
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Submission failed');
  return result;
}`

    case 'python':
      return `# pip install requests python-dotenv
import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("FORMCONNECT_API_KEY", "${key}")
API_URL = os.getenv("FORMCONNECT_API_URL", "${endpoint}")

def submit_form(data):
    payload = {
        "apiKey": API_KEY,
        "data": data or {
            "name": "John Doe",
            "email": "john@example.com",
            "message": "Hello from Python!"
        }
    }
    response = requests.post(API_URL, json=payload)
    response.raise_for_status()
    return response.json()

# Example:
# print(submit_form({"name": "Alice", "email": "alice@example.com"}))`

    case 'java':
      return `// Requires Java 11+ java.net.http
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class FormConnect {
    // Read from System environment or .env:
    private static final String API_KEY = System.getenv().getOrDefault("FORMCONNECT_API_KEY", "${key}");
    private static final String ENDPOINT = "${endpoint}";

    public static void main(String[] args) throws Exception {
        String jsonPayload = """
        {
          "apiKey": "%s",
          "data": {
            "name": "John Doe",
            "email": "john@example.com",
            "message": "Hello from Java!"
          }
        }
        """.formatted(API_KEY);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ENDPOINT))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Status: " + response.statusCode());
        System.out.println("Response: " + response.body());
    }
}`

    case 'c':
      return `/* 
   Requires libcurl:
   gcc -o submit submit.c -lcurl 
*/
#include <stdio.h>
#include <stdlib.h>
#include <curl/curl.h>

int main(void) {
    CURL *curl;
    CURLcode res;

    const char *apiKey = getenv("FORMCONNECT_API_KEY");
    if (!apiKey) apiKey = "${key}";

    char payload[512];
    snprintf(payload, sizeof(payload),
        "{\"apiKey\":\"%s\",\"data\":{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"message\":\"Hello from C!\"}}",
        apiKey
    );

    curl_global_init(CURL_GLOBAL_ALL);
    curl = curl_easy_init();
    if (curl) {
        struct curl_slist *headers = NULL;
        headers = curl_slist_append(headers, "Content-Type: application/json");

        curl_easy_setopt(curl, CURLOPT_URL, "${endpoint}");
        curl_easy_setopt(curl, CURLOPT_HTTPHEADER, headers);
        curl_easy_setopt(curl, CURLOPT_POSTFIELDS, payload);

        res = curl_easy_perform(curl);
        if (res != CURLE_OK) {
            fprintf(stderr, "Request failed: %s\\n", curl_easy_strerror(res));
        }

        curl_slist_free_all(headers);
        curl_easy_cleanup(curl);
    }
    curl_global_cleanup();
    return 0;
}`

    case 'cpp':
      return `// Example using libcurl or modern CPR library (https://github.com/libcpr/cpr)
#include <iostream>
#include <cstdlib>
#include <cpr/cpr.h>

int main() {
    const char* envKey = std::getenv("FORMCONNECT_API_KEY");
    std::string apiKey = envKey ? envKey : "${key}";

    std::string jsonBody = "{\\"apiKey\\":\\"" + apiKey + "\\",\\"data\\":{\\"name\\":\\"John Doe\\",\\"email\\":\\"john@example.com\\",\\"message\\":\\"Hello from C++!\\"}}";

    cpr::Response r = cpr::Post(
        cpr::Url{"${endpoint}"},
        cpr::Header{{"Content-Type", "application/json"}},
        cpr::Body{jsonBody}
    );

    std::cout << "Status: " << r.status_code << "\\n";
    std::cout << "Response: " << r.text << "\\n";
    return 0;
}`

    case 'flutter':
      return `// 1. In pubspec.yaml:
// dependencies:
//   http: ^1.2.0
//   flutter_dotenv: ^5.1.0

import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';

Future<void> submitForm(Map<String, dynamic> formData) async {
  final apiKey = dotenv.env['FORMCONNECT_API_KEY'] ?? '${key}';
  final url = Uri.parse(dotenv.env['FORMCONNECT_API_URL'] ?? '${endpoint}');

  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'apiKey': apiKey,
      'data': formData,
    }),
  );

  if (response.statusCode == 200 || response.statusCode == 201) {
    print('Form submitted successfully: \${response.body}');
  } else {
    throw Exception('Failed to submit form: \${response.body}');
  }
}`

    case 'curl':
      return `# Make sure FORMCONNECT_API_KEY is in your environment or substitute directly:
# export FORMCONNECT_API_KEY="${key}"

curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "'"\${FORMCONNECT_API_KEY:-${key}}"\'",
    "data": {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello from Terminal!"
    }
  }'`

    case 'php':
      return `<?php
// Read from environment variable or fallback
$apiKey = getenv('FORMCONNECT_API_KEY') ?: '${key}';
$apiUrl = getenv('FORMCONNECT_API_URL') ?: '${endpoint}';

$payload = json_encode([
    'apiKey' => $apiKey,
    'data' => [
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'message' => 'Hello from PHP!'
    ]
]);

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Content-Length: ' . strlen($payload)
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\\n";
echo "Response: $response\\n";
?>`

    case 'go':
      return `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type FormPayload struct {
	APIKey string                 \`json:"apiKey"\`
	Data   map[string]interface{} \`json:"data"\`
}

func main() {
	apiKey := os.Getenv("FORMCONNECT_API_KEY")
	if apiKey == "" {
		apiKey = "${key}"
	}

	payload := FormPayload{
		APIKey: apiKey,
		Data: map[string]interface{}{
			"name":    "John Doe",
			"email":   "john@example.com",
			"message": "Hello from Go!",
		},
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		panic(err)
	}

	resp, err := http.Post("${endpoint}", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	fmt.Printf("Status: %s\\n", resp.Status)
}`

    default:
      return `// API Key: ${key}\n// Endpoint: ${endpoint}`
  }
}

export function getAgentPrompt(language, apiKey, projectName = 'My Project', apiUrl = 'https://formconnect.onrender.com') {
  const langObj = SUPPORTED_LANGUAGES.find(l => l.id === language) || SUPPORTED_LANGUAGES[0]
  const key = apiKey || 'YOUR_API_KEY'
  const endpoint = `${apiUrl}/api/submit`

  return `Integrate FormConnect backend submission into our project.

### 1. Environment Configuration (.env)
Add the following keys to the project's \`.env\` file (and ensure \`.env\` is listed in \`.gitignore\`):
\`\`\`env
FORMCONNECT_API_URL=${apiUrl}
FORMCONNECT_API_KEY=${key}
\`\`\`
*(Note: If using Vite, prefix with VITE_FORMCONNECT_API_KEY. If Next.js frontend, use NEXT_PUBLIC_FORMCONNECT_API_KEY)*

### 2. Integration Target
- Target Language/Framework: ${langObj.name}
- Project: ${projectName}
- Endpoint: ${endpoint}
- Method: POST
- Content-Type: application/json

### 3. Submission Format
Send a JSON payload shaped as:
\`\`\`json
{
  "apiKey": "<process.env.FORMCONNECT_API_KEY or env var>",
  "data": {
    "name": "<form field name>",
    "email": "<form field email>",
    "message": "<form field message>",
    "<any_other_field>": "<value>"
  }
}
\`\`\`

### 4. Implementation Requirements
1. Bind our form submit handler to send the form data payload to FormConnect.
2. Read the API key securely from environment variables / \`.env\`.
3. Provide user feedback during submission (loading indicator, success alert/notification, error handling).
4. Reset the form upon successful submission.
`
}
