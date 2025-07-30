use serde_json::{json, Value};
use reqwest::Client;

/// Ollama LLM 호출 → 3개 sprout 생성
pub async fn generate_sprouts(
    client: &Client,
    ollama_url: &str,
    model: &str,
    title: &str,
    context: Option<&str>,
) -> anyhow::Result<Value> {
    let prompt = format!(
        r#"
You are a technical advisor that recommends 3 different technology stack combinations for a given project idea.
Provide practical, modern technology stacks that would work well for the project.

Input project idea:
- Title: {title}
- Context: {context:?}

Respond in this format:
{{
    "stack1": {{ "stack_name": "Full-Stack JavaScript", "description": "Modern web development with React and Node.js", "technologies": ["React", "Node.js", "PostgreSQL", "Tailwind CSS"] }},
    "stack2": {{ "stack_name": "Python Data Stack", "description": "Data-driven application with Django", "technologies": ["Django", "Python", "PostgreSQL", "Redis"] }},
    "stack3": {{ "stack_name": "Go Microservices", "description": "Scalable backend services", "technologies": ["Go", "Docker", "Kubernetes", "MongoDB"] }}
}}
"#
    );

    let body = json!({
        "model": model,
        "messages": [
            {"role": "system", "content": "You output ONLY valid JSON. No explanation."},
            {"role": "user", "content": prompt}
        ],
        "stream": false
    });

    let res: Value = client
        .post(format!("{ollama_url}/v1/chat/completions"))
        .json(&body)
        .send()
        .await?
        .json()
        .await?;

    let content = res["choices"][0]["message"]["content"].clone();
    let parsed: Value = serde_json::from_str(content.as_str().unwrap_or(""))?;

    Ok(parsed)
}
