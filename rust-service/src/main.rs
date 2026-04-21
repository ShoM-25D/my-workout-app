use actix_cors::Cors;
use actix_web::{App, HttpResponse, HttpServer, Responder, get, web};
use dotenv::dotenv;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::env;

#[derive(Serialize, Deserialize, sqlx::FromRow)]
struct PersonalRecord {
    exercise_name: String,
    max_weight: f64,
}

#[derive(Deserialize)]
struct UserQuery {
    user_id: i32,
}

#[get("/health")]
async fn health() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({"status": "ok"}))
}

#[get("/internal/stats/personal_records")]
async fn personal_records(query: web::Query<UserQuery>, pool: web::Data<PgPool>) -> impl Responder {
    let user_id = query.user_id;
    let records = sqlx::query_as::<_, PersonalRecord>(
        r#"
        SELECT e.name as exercise_name, MAX(s.weight) as max_weight
        FROM exercises e
        JOIN workout_exercises we ON we.exercise_id = e.id
        JOIN sets s ON s.workout_exercise_id = we.id
        JOIN workouts w ON w.id = we.workout_id
        WHERE w.user_id = $1
        GROUP BY e.name
        ORDER BY max_weight DESC
        "#,
    )
    .bind(user_id)
    .fetch_all(pool.get_ref())
    .await;

    match records {
        Ok(records) => HttpResponse::Ok().json(records),
        Err(e) => {
            HttpResponse::InternalServerError().json(serde_json::json!({"error":e.to_string()}))
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPool::connect(&database_url)
        .await
        .expect("Failed to connect to database");

    println!("Rust service running on port 8002");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://backend:8000")
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec!["Authorization", "Content-Type"]);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .service(health)
            .service(personal_records)
    })
    .bind("0.0.0.0:8002")?
    .run()
    .await
}

// cargo testの時だけコンパイルする
#[cfg(test)]
mod tests {
    // 親モジュールの関数を使えるようにする
    use super::*;
    use actix_web::{App, test};

    #[actix_web::test]
    async fn test_health() {
        // テスト用にアプリを起動
        let app = test::init_service(App::new().service(health)).await;

        // テスト用のリクエストを作成
        let req = test::TestRequest::get().uri("/health").to_request();
        // リクエストを送信してレスポンスを受け取る
        let resp = test::call_service(&app, req).await;

        // ステータスコードが200系かを確認
        assert!(resp.status().is_success())
    }
}
