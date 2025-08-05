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
You are a technical advisor that recommends 3 different technology stacks for a given project idea.

PRIORITY ORDER:
1. Most popular/mainstream stack for this project type
2. TypeScript-based alternative
3. Python or Rust alternative

Input project idea:
- Title: {title}
- Context: {context:?}

Analyze the project and provide 3 different practical technology stack recommendations.

Respond in this exact JSON format:
{{
    "stack1": {{
        "stack_name": "...",
        "description": "...",
        "technologies": ["...", "...", "..."],
        "pros": ["...", "...", "..."],
        "cons": ["...", "...", "..."],
        "learning_curve": "Easy|Medium|Hard"
    }},
    "stack2": {{
        "stack_name": "...",
        "description": "...",
        "technologies": ["...", "...", "..."],
        "pros": ["...", "...", "..."],
        "cons": ["...", "...", "..."],
        "learning_curve": "Easy|Medium|Hard"
    }},
    "stack3": {{
        "stack_name": "...",
        "description": "...",
        "technologies": ["...", "...", "..."],
        "pros": ["...", "...", "..."],
        "cons": ["...", "...", "..."],
        "learning_curve": "Easy|Medium|Hard"
    }}
}}
"#
    );

    let body = json!({
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a JSON generator. You MUST follow the exact schema provided. Output ONLY valid JSON with no explanation, comments, or additional text. Every field must be exactly as specified: arrays must be arrays, objects must be objects, strings must be strings. Do not deviate from the structure."},
            {"role": "user", "content": prompt}
        ],
        "stream": false,
        "temperature": 0.3
    });

    let res: Value = client
        .post(format!("{ollama_url}/v1/chat/completions"))
        .json(&body)
        .send()
        .await?
        .error_for_status()?
        .json()
        .await?;

    let content = res
        .get("choices")
        .and_then(|choices| choices.get(0))
        .and_then(|choice| choice.get("message"))
        .and_then(|message| message.get("content"))
        .and_then(|content| content.as_str())
        .ok_or_else(|| anyhow::anyhow!("Invalid LLM response structure"))?;

    let parsed: Value = serde_json::from_str(content)?;

    Ok(parsed)
}
