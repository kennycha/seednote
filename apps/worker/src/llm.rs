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
You are a technical advisor that provides detailed technology stack recommendations for project ideas.

PRIORITY ORDER:
1. First recommend the most popular/mainstream stacks for the project type
2. Then try TypeScript-based stacks (React/Next.js, Node.js, etc.)
3. Finally try Rust or Python-based stacks (Axum, FastAPI, etc.)

Input project idea:
- Title: {title}
- Context: {context:?}

Provide 3 different detailed technology stack recommendations. Each should include:
- Categorized technologies (frontend, backend, database, infrastructure)
- Specific pros and cons
- Learning difficulty assessment
- Development time estimates
- Best use cases
- Example projects

Respond in this exact JSON format:
{{
    "stack1": {{
        "stack_name": "TypeScript Full-Stack",
        "description": "Modern web development with React and Node.js ecosystem",
        "technologies": {{
            "frontend": ["React", "TypeScript", "Tailwind CSS"],
            "backend": ["Node.js", "Express", "TypeScript"],
            "database": ["PostgreSQL", "Redis"],
            "infrastructure": ["Vercel", "Docker"]
        }},
        "pros": ["Fast development", "Strong typing", "Large community", "Good tooling"],
        "cons": ["Runtime overhead", "Complex build setup"],
        "learning_curve": "Medium",
        "estimated_dev_time": "2-3주 (MVP), 2-3개월 (완성품)",
        "best_for": ["웹 애플리케이션", "프로토타입", "스타트업"],
        "example_projects": ["대시보드", "CRM 시스템", "콘텐츠 관리"]
    }},
    "stack2": {{
        "stack_name": "Rust High-Performance",
        "description": "High-performance backend with modern Rust ecosystem",
        "technologies": {{
            "frontend": ["React", "TypeScript"],
            "backend": ["Rust", "Axum", "Tokio"],
            "database": ["PostgreSQL", "Redis"],
            "infrastructure": ["Docker", "AWS"]
        }},
        "pros": ["Excellent performance", "Memory safety", "Concurrent by design"],
        "cons": ["Steep learning curve", "Longer development time", "Smaller ecosystem"],
        "learning_curve": "Hard",
        "estimated_dev_time": "1-2개월 (MVP), 4-6개월 (완성품)",
        "best_for": ["고성능 시스템", "마이크로서비스", "시스템 프로그래밍"],
        "example_projects": ["API 서버", "실시간 데이터 처리", "게임 백엔드"]
    }},
    "stack3": {{
        "stack_name": "Python Rapid Development",
        "description": "Rapid development with Python's rich ecosystem",
        "technologies": {{
            "frontend": ["React", "TypeScript"],
            "backend": ["Python", "FastAPI", "SQLAlchemy"],
            "database": ["PostgreSQL", "Redis"],
            "infrastructure": ["Docker", "Heroku"]
        }},
        "pros": ["Rapid prototyping", "Rich libraries", "Easy to learn", "Great for AI/ML"],
        "cons": ["Performance limitations", "Global Interpreter Lock"],
        "learning_curve": "Easy",
        "estimated_dev_time": "1-2주 (MVP), 1-2개월 (완성품)",
        "best_for": ["프로토타입", "데이터 분석", "AI/ML 통합"],
        "example_projects": ["데이터 대시보드", "추천 시스템", "자동화 도구"]
    }}
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
