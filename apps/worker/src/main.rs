mod supabase;
mod llm;

use anyhow::Result;
use dotenvy::dotenv;
use reqwest::Client;
use serde_json::{json};
use std::{env, time::Duration};
use tokio::time::sleep;

async fn process_seed(
    client: &Client,
    supabase_url: &str,
    supabase_key: &str,
    ollama_url: &str,
    model: &str,
    id: &str,
    title: &str,
    context: Option<&str>,
) -> Result<()> {
    // 상태 업데이트 → processing
    supabase::update_seed(
        client,
        supabase_url,
        supabase_key,
        id,
        &json!({ "status": "processing" }),
    )
    .await?;

    // LLM 호출
    let sprouts = llm::generate_sprouts(client, ollama_url, model, title, context).await?;

    // 저장
    supabase::update_seed(
        client,
        supabase_url,
        supabase_key,
        id,
        &json!({
            "sprouts": sprouts,
            "status": "done"
        }),
    )
    .await?;
    
    println!("✅ Done: {id}");
    Ok(())
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    let supabase_url = env::var("SUPABASE_URL")?;
    let supabase_key = env::var("SUPABASE_SERVICE_KEY")?;
    let ollama_url = env::var("OLLAMA_URL")?;
    let model = env::var("MODEL")?;

    let client = Client::new();

    loop {
        match supabase::fetch_pending_seed(&client, &supabase_url, &supabase_key).await {
            Ok(Some(seed)) => {
                let id = match seed["id"].as_str() {
                    Some(id) => id,
                    None => {
                        eprintln!("❌ Invalid seed: missing or invalid ID");
                        continue;
                    }
                };
                let title = seed["title"].as_str().unwrap_or_default();
                let context = seed["context"].as_str();

                println!("🌱 Processing seed: {id}");

                if let Err(err) = process_seed(&client, &supabase_url, &supabase_key, &ollama_url, &model, id, title, context).await {
                    eprintln!("❌ Failed to process seed {id}: {err}");
                    if let Err(update_err) = supabase::update_seed(
                        &client,
                        &supabase_url,
                        &supabase_key,
                        id,
                        &json!({ "status": "error" }),
                    ).await {
                        eprintln!("❌ Failed to update seed {id} to error status: {update_err}");
                    }
                }
            }
            Ok(None) => {
                sleep(Duration::from_secs(60 * 60)).await;
            }
            Err(err) => {
                eprintln!("❌ Failed to fetch pending seeds: {err}");
                sleep(Duration::from_secs(30)).await;
            }
        }
    }
}
