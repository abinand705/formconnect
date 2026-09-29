import '../models/project_model.dart';

class CodeGenerator {
  static String generateHtml(Project project, String baseUrl) {
    final fieldsHtml = project.fields.map((f) {
      final reqAttr = f.required ? ' required' : '';
      if (f.type == 'textarea') {
        return '    <div style="margin-bottom: 12px;">\n'
            '      <label style="display:block;margin-bottom:4px;">${_capitalize(f.name)}</label>\n'
            '      <textarea name="${f.name}" rows="4"$reqAttr style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;"></textarea>\n'
            '    </div>';
      }
      return '    <div style="margin-bottom: 12px;">\n'
          '      <label style="display:block;margin-bottom:4px;">${_capitalize(f.name)}</label>\n'
          '      <input type="${f.type == 'number' ? 'number' : f.type == 'email' ? 'email' : 'text'}" name="${f.name}"$reqAttr style="width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;" />\n'
          '    </div>';
    }).join('\n');

    return '''<!-- FormConnect Integration for ${project.name} -->
<form id="contact-form" style="max-width: 480px; font-family: sans-serif;">
$fieldsHtml
    <!-- Optional anti-spam honeypot field -->
    <input type="text" name="_gotcha" style="display:none !important;" tabindex="-1" autocomplete="off" />

    <button type="submit" style="background:#154234;color:#fff;padding:10px 20px;border:none;border-radius:6px;cursor:pointer;font-weight:600;">
      Send Message
    </button>
</form>

<script>
  document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      if (key !== '_gotcha') data[key] = value;
    }

    try {
      const res = await fetch('$baseUrl/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: '${project.apiKey}',
          data: data,
          honeypot: formData.get('_gotcha') || ''
        })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert('Thank you! Your message has been sent.');
        form.reset();
      } else {
        alert('Error: ' + (result.error || 'Failed to submit form'));
      }
    } catch (err) {
      alert('Network error submitting form');
    }
  });
</script>''';
  }

  static String generateFetch(Project project, String baseUrl) {
    final sampleData = project.fields.map((f) => '      "${f.name}": "sample value"').join(',\n');

    return '''// FormConnect async submission function
async function submitContactForm() {
  const payload = {
    apiKey: "${project.apiKey}",
    data: {
$sampleData
    }
  };

  try {
    const response = await fetch("$baseUrl/api/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (result.success) {
      console.log("Submission ID:", result.id);
      return { success: true };
    } else {
      console.error("Submission failed:", result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error("Submission error:", error);
    return { success: false, error: error.message };
  }
}''';
  }

  static String generateReact(Project project, String baseUrl) {
    return '''import React, { useState } from 'react';

export default function ContactForm() {
  const [status, setStatus] = useState('');
  const [formData, setFormData] = useState({
${project.fields.map((f) => "    ${f.name}: ''").join(',\n')}
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      const res = await fetch('$baseUrl/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: '${project.apiKey}',
          data: formData
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus('success');
      } else {
        setStatus('error: ' + (data.error || 'Submission failed'));
      }
    } catch (err) {
      setStatus('error: Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 440 }}>
${project.fields.map((f) => "      <input\n        type=\"${f.type}\"\n        placeholder=\"${_capitalize(f.name)}\"\n        value={formData.${f.name}}\n        onChange={e => setFormData({ ...formData, ${f.name}: e.target.value })}\n        required={${f.required}}\n      />").join('\n')}
      <button type="submit">Submit Form</button>
      {status && <p>{status}</p>}
    </form>
  );
}''';
  }

  static String generateCurl(Project project, String baseUrl) {
    final sampleJson = project.fields.map((f) => '\\"${f.name}\\": \\"sample_val\\"').join(', ');
    return '''curl -X POST $baseUrl/api/submit \\
  -H "Content-Type: application/json" \\
  -d '{
    "apiKey": "${project.apiKey}",
    "data": { $sampleJson }
  }' ''';
  }

  static String _capitalize(String s) {
    if (s.isEmpty) return s;
    return s[0].toUpperCase() + s.substring(1);
  }
}
