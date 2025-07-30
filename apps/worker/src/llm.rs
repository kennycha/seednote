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

PRIORITY ORDER:
1. First try TypeScript-based stacks (React/Next.js, Node.js, etc.)
2. Then try Rust-based stacks (Axum, Tauri, etc.) 
3. Then try Python-based stacks (Django, FastAPI, etc.)
4. If none of the above fit well, use the most popular modern stacks for the project type

Input project idea:
- Title: {title}
- Context: {context:?}

Provide 3 different practical, modern technology stacks. Prefer TypeScript, Rust, or Python when suitable, otherwise choose popular alternatives.

Respond in this format:
{{
    "stack1": {{ "stack_name": "TypeScript Full-Stack", "description": "Modern web development with React and Node.js", "technologies": ["React", "TypeScript", "Node.js", "PostgreSQL"] }},
    "stack2": {{ "stack_name": "Rust Backend + React", "description": "High-performance backend with Rust", "technologies": ["Rust", "Axum", "React", "TypeScript", "PostgreSQL"] }},
    "stack3": {{ "stack_name": "Python Web Stack", "description": "Rapid development with Python", "technologies": ["Python", "FastAPI", "React", "PostgreSQL"] }}
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
