mod supabase;
mod llm;

use anyhow::Result;
use dotenvy::dotenv;
use reqwest::Client;
use serde_json::json;
use std::{env, time::Duration};
use tokio::time::sleep;

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    let supabase_url = env::var("SUPABASE_URL")?;
    let supabase_key = env::var("SUPABASE_SERVICE_KEY")?;
    let ollama_url = env::var("OLLAMA_URL")?;
    let model = env::var("MODEL")?;

    let client = Client::new();

    loop {
        match supabase::fetch_pending_seed(&client, &supabase_url, &supabase_key).await? {
            Some(seed) => {
                let id = seed["id"].as_str().unwrap();
                let title = seed["title"].as_str().unwrap_or_default();
                let context = seed["context"].as_str();

                println!("🌱 Processing seed: {id}");

                // 상태 업데이트 → processing
                supabase::update_seed(
                    &client,
                    &supabase_url,
                    &supabase_key,
                    id,
                    &json!({ "status": "processing" }),
                )
                .await?;

                // LLM 호출
                match llm::generate_sprouts(&client, &ollama_url, &model, title, context).await {
                    Ok(sprouts) => {
                        // 저장
                        supabase::update_seed(
                            &client,
                            &supabase_url,
                            &supabase_key,
                            id,
                            &json!({
                                "sprouts": sprouts,
                                "status": "done"
                            }),
                        )
                        .await?;
                        println!("✅ Done: {id}");
                    }
                    Err(err) => {
                        eprintln!("❌ LLM failed: {err}");
                        supabase::update_seed(
                            &client,
                            &supabase_url,
                            &supabase_key,
                            id,
                            &json!({ "status": "error" }),
                        )
                        .await?;
                    }
                }
            }
            None => {
                sleep(Duration::from_secs(60 * 60)).await;
            }
        }
    }
}
