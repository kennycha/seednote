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
You are an assistant that expands ideas into structured JSON with 3 parts.
Don't use empty string.

Input idea:
- Title: {title}
- Context: {context:?}

Respond in this format:
{{
    "what": {{ "summary": "...", "core_value": "...", "examples": ["...", "..."] }},
    "how": {{ "summary": "...", "core_value": "...", "examples": ["...", "..."] }},
    "why": {{ "summary": "...", "core_value": "...", "examples": ["...", "..."] }}
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
