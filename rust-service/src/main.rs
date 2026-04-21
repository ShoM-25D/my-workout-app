use actix_web::{get, web, App, HttpServer, HttpResponse, Responder, HttpRequest};
use actix_cors::Cors;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use dotenv::dotenv;
use std::env;
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};

#[derive(Serialize, Deserialize, sqlx::FromRow)]
struct PersonalRecord {
    exercise_name: String,
    max_weight: f64
}

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

fn extract_user_id(req: &HttpRequest) -> Option<i32> {
    let auth_header = req.headers().get("Authorization")?.to_str().ok()?;
    let token = auth_header.strip_prefix("Bearer ")?;
    let secret = env::var("SECRET_KEY").ok()?;
    let decoded = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::new(Algorithm::HS256),
    ).ok()?;
    decoded.claims.sub.parse::<i32>().ok()
}

#[get("/health")]
async fn health() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({"status": "ok"}))
}

#[get("/stats/personal_records")]
async fn personal_records(req: HttpRequest, pool: web::Data<PgPool>) -> impl Responder {
    let user_id = match extract_user_id(&req) {
        Some(id) => id,
        None => return HttpResponse::Unauthorized().json(
            serde_json::json!({"error": "認証トークンがありません"})
        ),
    };
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
        "#
    )
    .bind(user_id)
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
        let cors = Cors::default()
        .allowed_origin("http://localhost:3000")
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