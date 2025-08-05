use serde_json::Value;
use reqwest::Client;

/// GET 하나의 pending seed
pub async fn fetch_pending_seed(
    client: &Client,
    supabase_url: &str,
    api_key: &str,
) -> anyhow::Result<Option<Value>> {
    let res = client
        .get(format!("{supabase_url}/seeds?status=eq.pending&limit=1"))
        .header("apikey", api_key)
        .header("Authorization", format!("Bearer {api_key}"))
        .send()
        .await?
        .json::<Vec<Value>>()
        .await?;

    Ok(res.into_iter().next())
}

/// PATCH 상태 업데이트 or sprouts 저장
pub async fn update_seed(
    client: &Client,
    supabase_url: &str,
    api_key: &str,
    id: &str,
    body: &Value,
) -> anyhow::Result<()> {
    client
        .patch(format!("{supabase_url}/seeds?id=eq.{id}"))
        .header("apikey", api_key)
        .header("Authorization", format!("Bearer {api_key}"))
        .header("Prefer", "return=minimal")
        .json(body)
        .send()
        .await?
        .error_for_status()?;

    Ok(())
}
