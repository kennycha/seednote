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
당신은 주어진 프로젝트 아이디어에 대해 MoSCoW 요구사항 분석과 3가지 기술 스택을 추천하는 기술 어드바이저입니다.

입력된 프로젝트 아이디어:
- 제목: {title}
- 추가 정보: {context:?}

먼저 이 프로젝트에 대한 MoSCoW 요구사항 분석을 수행하고, 그 다음 3가지 기술 스택을 추천해주세요.

기술 스택 우선순위:
1. 이 프로젝트 유형에 가장 인기 있고 주류인 스택
2. TypeScript 기반 대안
3. Python 또는 Rust 대안

다음 JSON 형식으로 정확히 응답해주세요:
{{
    "moscow_requirements": {{
        "must_have": [필수 기능들을 문자열 배열로],
        "should_have": [중요 기능들을 문자열 배열로],
        "could_have": [선택 기능들을 문자열 배열로],
        "wont_have": [제외할 기능들을 문자열 배열로]
    }},
    "stack_recommendations": [
        {{
            "stack_name": "첫 번째 스택 이름",
            "description": "스택에 대한 설명",
            "technologies": ["사용할 기술들"],
            "pros": ["장점들"],
            "cons": ["단점들"],
            "learning_curve": "Easy|Medium|Hard 중 하나"
        }},
        두 번째와 세 번째 스택도 같은 형식으로
    ]
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
