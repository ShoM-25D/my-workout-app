use actix_web::{get, web, App, HttpServer, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use dotenv::dotenv;
use std::env;

#[derive(Serialize, Deserialize, sqlx::FromRow)]
struct PersonalRecord {
    exercise_name: String,
    max_weight: f64
}


#[get("/health")]
async fn health() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({"status": "ok"}))
}

#[get("/stats/personal_records")]
async fn personal_records(pool: web::Data<PgPool>) -> impl Responder {
    let records = sqlx::query_as::<_, PersonalRecord>(
        r#"
        SELECT e.name as exercise_name, MAX(s.weight) as max_weight
        FROM exercises e
        JOIN workout_exercises we ON we.exercise_id = e.id
        JOIN sets s ON s.workout_exercise_id = we.id
        GROUP BY e.name
        ORDER BY max_weight DESC
        "#
    )
    .fetch_all(pool.get_ref())
    .await;

    match records {
        Ok(records) => HttpResponse::Ok().json(records),
        Err(e) => HttpResponse::InternalServerError().json(
            serde_json::json!({"error":e.to_string()})
        ),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL")
    .expect("DATABASE_URL must be set");

    let pool = PgPool::connect(&database_url)
    .await
    .expect("Failed to connect to database");

    println!("Rust service running on port 8002");

    HttpServer::new(move || {
        App::new()
        .app_data(web::Data::new(pool.clone()))
        .service(health)
        .service(personal_records)
    })
    .bind("0.0.0.0:8002")?
    .run()
    .await
}