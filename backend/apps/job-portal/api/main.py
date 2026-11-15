import hashlib
import hmac
import json
import logging
import os
import re
import secrets
import sqlite3
import time
import uuid
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Annotated, Literal, Optional
from urllib.parse import unquote

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))

logger = logging.getLogger("thozhil.job_portal")
API_PREFIX = "/api/job-portal"
PASSWORD_ITERATIONS = 310_000
SESSION_TTL_SECONDS = 12 * 60 * 60
MAX_RESUME_BYTES = 5 * 1024 * 1024


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=10, max_length=128)
    role: Literal["employer", "job_seeker"]

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Name is required.")
        return value

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        value = value.strip().lower()
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value):
            raise ValueError("Enter a valid email address.")
        return value


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return value.strip().lower()


class CompanyInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    company_name: str = Field(min_length=2, max_length=160)
    website: Optional[str] = Field(default=None, max_length=300)
    description: Optional[str] = Field(default=None, max_length=5000)
    location: Optional[str] = Field(default=None, max_length=200)


class CandidateProfileInput(BaseModel):
    headline: Optional[str] = Field(default=None, max_length=160)
    summary: Optional[str] = Field(default=None, max_length=5000)
    location: Optional[str] = Field(default=None, max_length=200)
    skills: list[str] = Field(default_factory=list, max_length=100)
    education: list[str] = Field(default_factory=list, max_length=50)
    experience: list[str] = Field(default_factory=list, max_length=50)

    @field_validator("skills", "education", "experience")
    @classmethod
    def clean_profile_lists(cls, values: list[str]) -> list[str]:
        cleaned = [item.strip()[:500] for item in values if item.strip()]
        if len(cleaned) != len(set(item.casefold() for item in cleaned)):
            raise ValueError("Profile list items must not contain duplicates.")
        return cleaned


class JobInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    title: str = Field(min_length=2, max_length=160)
    description: str = Field(min_length=20, max_length=20_000)
    required_skills: list[str] = Field(min_length=1, max_length=100)
    qualifications: Optional[str] = Field(default=None, max_length=5000)
    experience_requirements: Optional[str] = Field(default=None, max_length=1000)
    employment_type: Literal["Full-time", "Part-time", "Internship", "Contract"]
    salary_min: Optional[int] = Field(default=None, ge=0, le=100_000_000)
    salary_max: Optional[int] = Field(default=None, ge=0, le=100_000_000)
    location: str = Field(min_length=2, max_length=200)
    work_mode: Literal["Remote", "Hybrid", "On-site"]
    vacancy_count: int = Field(ge=1, le=100_000)
    application_deadline: Optional[date] = None

    @field_validator("required_skills")
    @classmethod
    def clean_skills(cls, values: list[str]) -> list[str]:
        cleaned = list(dict.fromkeys(item.strip() for item in values if item.strip()))
        if not cleaned:
            raise ValueError("At least one required skill is needed.")
        return cleaned

    @model_validator(mode="after")
    def salary_range_is_valid(self):
        if self.salary_min is not None and self.salary_max is not None:
            if self.salary_min > self.salary_max:
                raise ValueError("Minimum salary cannot exceed maximum salary.")
        return self


class JobStatusInput(BaseModel):
    status: Literal["DRAFT", "PUBLISHED", "INACTIVE"]


class ApplicationStatusInput(BaseModel):
    status: Literal["SHORTLISTED", "REJECTED", "INTERVIEW", "HIRED"]


def _password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt.hex()}${derived.hex()}"


def _verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, rounds, salt_hex, digest_hex = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        derived = hashlib.pbkdf2_hmac(
            "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), int(rounds)
        )
        return hmac.compare_digest(derived.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _public_user(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "role": row["role"],
    }


def _init_database(database_path: Path) -> None:
    database_path.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(database_path) as connection:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                name TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('employer', 'job_seeker')),
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                expires_at INTEGER NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
            CREATE TABLE IF NOT EXISTS company_profiles (
                user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                company_name TEXT NOT NULL,
                website TEXT,
                description TEXT,
                location TEXT,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS candidate_profiles (
                user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                headline TEXT,
                summary TEXT,
                location TEXT,
                skills TEXT NOT NULL DEFAULT '[]',
                education TEXT NOT NULL DEFAULT '[]',
                experience TEXT NOT NULL DEFAULT '[]',
                resume_path TEXT,
                resume_filename TEXT,
                resume_content_type TEXT,
                updated_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                employer_id TEXT NOT NULL REFERENCES users(id),
                company_name TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                required_skills TEXT NOT NULL,
                qualifications TEXT,
                experience_requirements TEXT,
                employment_type TEXT NOT NULL CHECK (
                    employment_type IN ('Full-time', 'Part-time', 'Internship', 'Contract')
                ),
                salary_min INTEGER,
                salary_max INTEGER,
                location TEXT NOT NULL,
                work_mode TEXT NOT NULL CHECK (work_mode IN ('Remote', 'Hybrid', 'On-site')),
                vacancy_count INTEGER NOT NULL CHECK (vacancy_count > 0),
                application_deadline TEXT,
                status TEXT NOT NULL CHECK (
                    status IN ('DRAFT', 'PUBLISHED', 'INACTIVE', 'DELETED')
                ),
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS jobs_status_created_idx ON jobs(status, created_at);
            CREATE INDEX IF NOT EXISTS jobs_employer_id_idx ON jobs(employer_id);
            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                job_id TEXT NOT NULL REFERENCES jobs(id),
                candidate_id TEXT NOT NULL REFERENCES users(id),
                employer_id TEXT NOT NULL REFERENCES users(id),
                applied_at TEXT NOT NULL,
                status TEXT NOT NULL CHECK (
                    status IN ('APPLIED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW', 'HIRED', 'WITHDRAWN')
                ),
                updated_at TEXT NOT NULL,
                UNIQUE(job_id, candidate_id)
            );
            CREATE INDEX IF NOT EXISTS applications_job_id_idx ON applications(job_id);
            CREATE INDEX IF NOT EXISTS applications_candidate_id_idx ON applications(candidate_id);
            """
        )


def _connection(request: Request):
    connection = sqlite3.connect(
        request.app.state.database_path, timeout=10, check_same_thread=False
    )
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def _current_user(
    request: Request,
    authorization: Annotated[Optional[str], Header()] = None,
    connection: sqlite3.Connection = Depends(_connection),
) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="A valid bearer token is required.")
    token = authorization[7:].strip()
    if not token:
        raise HTTPException(status_code=401, detail="A valid bearer token is required.")
    row = connection.execute(
        """
        SELECT users.id, users.name, users.email, users.role
        FROM sessions JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ? AND sessions.expires_at > ?
        """,
        (_hash_token(token), int(time.time())),
    ).fetchone()
    if row is None:
        raise HTTPException(status_code=401, detail="Session is invalid or has expired.")
    return _public_user(row)


def _require_role(role: str):
    def check_role(user: dict = Depends(_current_user)) -> dict:
        if user["role"] != role:
            raise HTTPException(status_code=403, detail=f"This action requires the {role} role.")
        return user

    return check_role


def _session_response(connection: sqlite3.Connection, user_id: str) -> dict:
    token = secrets.token_urlsafe(32)
    created_at = _now()
    connection.execute(
        "INSERT INTO sessions(token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
        (_hash_token(token), user_id, int(time.time()) + SESSION_TTL_SECONDS, created_at),
    )
    row = connection.execute(
        "SELECT id, name, email, role FROM users WHERE id = ?", (user_id,)
    ).fetchone()
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": SESSION_TTL_SECONDS,
        "user": _public_user(row),
    }


def _profile_from_row(row: sqlite3.Row) -> dict:
    return {
        "headline": row["headline"],
        "summary": row["summary"],
        "location": row["location"],
        "skills": json.loads(row["skills"]),
        "education": json.loads(row["education"]),
        "experience": json.loads(row["experience"]),
        "resume_filename": row["resume_filename"],
        "updated_at": row["updated_at"],
    }


def _job_from_row(row: sqlite3.Row) -> dict:
    result = dict(row)
    result["required_skills"] = json.loads(result["required_skills"])
    return result


def create_app(
    database_path: Optional[str] = None,
    resumes_path: Optional[str] = None,
    allowed_origins: Optional[list[str]] = None,
) -> FastAPI:
    default_data_dir = Path(__file__).resolve().parent / "data"
    database_file = Path(database_path or os.getenv("JOB_PORTAL_DATABASE_PATH", default_data_dir / "job_portal.db"))
    resume_dir = Path(resumes_path or os.getenv("JOB_PORTAL_RESUMES_PATH", default_data_dir / "resumes"))
    database_file.parent.mkdir(parents=True, exist_ok=True)
    resume_dir.mkdir(parents=True, exist_ok=True)
    _init_database(database_file)

    app = FastAPI(title="THOZHIL Job Portal API", version="1.0.0")
    app.state.database_path = str(database_file)
    app.state.resumes_path = resume_dir
    origins = allowed_origins or [
        item.strip()
        for item in os.getenv(
            "JOB_PORTAL_ALLOWED_ORIGINS",
            "http://localhost:3000,http://localhost:5173,http://localhost:8080",
        ).split(",")
        if item.strip()
    ]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Resume-Filename"],
    )

    @app.get(f"{API_PREFIX}/health")
    def health():
        return {"service": "job-portal", "status": "healthy"}

    @app.post(f"{API_PREFIX}/auth/register", status_code=201)
    def register(payload: RegisterRequest, connection=Depends(_connection)):
        now = _now()
        user_id = str(uuid.uuid4())
        try:
            connection.execute(
                """
                INSERT INTO users(id, email, name, password_hash, role, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (user_id, payload.email, payload.name, _password_hash(payload.password), payload.role, now, now),
            )
        except sqlite3.IntegrityError as exc:
            if "users.email" in str(exc):
                raise HTTPException(status_code=409, detail="An account with this email already exists.") from exc
            raise
        if payload.role == "employer":
            connection.execute(
                """
                INSERT INTO company_profiles(user_id, company_name, updated_at)
                VALUES (?, ?, ?)
                """,
                (user_id, "", now),
            )
        else:
            connection.execute(
                "INSERT INTO candidate_profiles(user_id, updated_at) VALUES (?, ?)",
                (user_id, now),
            )
        return _session_response(connection, user_id)

    @app.post(f"{API_PREFIX}/auth/login")
    def login(payload: LoginRequest, connection=Depends(_connection)):
        row = connection.execute(
            "SELECT id, password_hash FROM users WHERE email = ?",
            (payload.email,),
        ).fetchone()
        if row is None or not _verify_password(payload.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Email or password is incorrect.")
        return _session_response(connection, row["id"])

    @app.get(f"{API_PREFIX}/auth/me")
    def me(user=Depends(_current_user)):
        return {"user": user}

    @app.post(f"{API_PREFIX}/auth/logout")
    def logout(
        authorization: Annotated[Optional[str], Header()] = None,
        user=Depends(_current_user),
        connection=Depends(_connection),
    ):
        token = authorization[7:].strip()
        connection.execute(
            "DELETE FROM sessions WHERE token_hash = ? AND user_id = ?",
            (_hash_token(token), user["id"]),
        )
        return {"success": True}

    @app.get(f"{API_PREFIX}/employer/company")
    def get_company(
        user=Depends(_require_role("employer")),
        connection=Depends(_connection),
    ):
        row = connection.execute(
            "SELECT company_name, website, description, location, updated_at FROM company_profiles WHERE user_id = ?",
            (user["id"],),
        ).fetchone()
        return {"company": dict(row) if row else None}

    @app.put(f"{API_PREFIX}/employer/company")
    def save_company(
        payload: CompanyInput,
        user=Depends(_require_role("employer")),
        connection=Depends(_connection),
    ):
        now = _now()
        connection.execute(
            """
            INSERT INTO company_profiles(user_id, company_name, website, description, location, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                company_name=excluded.company_name, website=excluded.website,
                description=excluded.description, location=excluded.location, updated_at=excluded.updated_at
            """,
            (user["id"], payload.company_name, payload.website, payload.description, payload.location, now),
        )
        connection.execute(
            "UPDATE jobs SET company_name=?, updated_at=? WHERE employer_id=? AND status != 'DELETED'",
            (payload.company_name, now, user["id"]),
        )
        return {"company": {**payload.model_dump(), "updated_at": now}}

    @app.get(f"{API_PREFIX}/candidate/profile")
    def get_candidate_profile(
        user=Depends(_require_role("job_seeker")),
        connection=Depends(_connection),
    ):
        row = connection.execute(
            "SELECT * FROM candidate_profiles WHERE user_id = ?", (user["id"],)
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Candidate profile not found.")
        return {"profile": _profile_from_row(row)}

    @app.put(f"{API_PREFIX}/candidate/profile")
    def save_candidate_profile(
        payload: CandidateProfileInput,
        user=Depends(_require_role("job_seeker")),
        connection=Depends(_connection),
    ):
        now = _now()
        connection.execute(
            """
            UPDATE candidate_profiles
            SET headline=?, summary=?, location=?, skills=?, education=?, experience=?, updated_at=?
            WHERE user_id=?
            """,
            (
                payload.headline,
                payload.summary,
                payload.location,
                json.dumps(payload.skills),
                json.dumps(payload.education),
                json.dumps(payload.experience),
                now,
                user["id"],
            ),
        )
        row = connection.execute(
            "SELECT * FROM candidate_profiles WHERE user_id = ?", (user["id"],)
        ).fetchone()
        return {"profile": _profile_from_row(row)}

    @app.put(f"{API_PREFIX}/candidate/profile/resume")
    async def upload_resume(
        request: Request,
        user=Depends(_require_role("job_seeker")),
        connection=Depends(_connection),
        resume_filename: Annotated[Optional[str], Header(alias="X-Resume-Filename")] = None,
    ):
        filename = Path(unquote(resume_filename or "resume")).name
        extension = Path(filename).suffix.lower()
        if extension not in {".pdf", ".docx"}:
            raise HTTPException(status_code=415, detail="Resume must be a PDF or DOCX file.")
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                if int(content_length) > MAX_RESUME_BYTES:
                    raise HTTPException(status_code=413, detail="Resume exceeds the 5 MB upload limit.")
            except ValueError as exc:
                raise HTTPException(status_code=400, detail="Invalid Content-Length header.") from exc
        chunks = []
        total_bytes = 0
        async for chunk in request.stream():
            total_bytes += len(chunk)
            if total_bytes > MAX_RESUME_BYTES:
                raise HTTPException(status_code=413, detail="Resume exceeds the 5 MB upload limit.")
            chunks.append(chunk)
        content = b"".join(chunks)
        if not content:
            raise HTTPException(status_code=400, detail="Resume file is empty.")
        if (extension == ".pdf" and not content.startswith(b"%PDF-")) or (
            extension == ".docx" and not content.startswith(b"PK")
        ):
            raise HTTPException(status_code=415, detail="File content does not match the selected resume format.")
        content_type = "application/pdf" if extension == ".pdf" else (
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        safe_name = re.sub(r"[^A-Za-z0-9._ -]", "_", filename)[:180] or f"resume{extension}"
        stored_name = f"{uuid.uuid4().hex}{extension}"
        stored_path = request.app.state.resumes_path / stored_name
        with stored_path.open("xb") as resume_file:
            resume_file.write(content)
        old_row = connection.execute(
            "SELECT resume_path FROM candidate_profiles WHERE user_id = ?", (user["id"],)
        ).fetchone()
        now = _now()
        connection.execute(
            """
            UPDATE candidate_profiles
            SET resume_path=?, resume_filename=?, resume_content_type=?, updated_at=?
            WHERE user_id=?
            """,
            (str(stored_path), safe_name, content_type, now, user["id"]),
        )
        connection.commit()
        if old_row and old_row["resume_path"]:
            Path(old_row["resume_path"]).unlink(missing_ok=True)
        return {"resume_filename": safe_name, "updated_at": now}

    @app.get(f"{API_PREFIX}/candidate/profile/resume")
    def download_own_resume(
        request: Request,
        user=Depends(_require_role("job_seeker")),
        connection=Depends(_connection),
    ):
        row = connection.execute(
            "SELECT resume_path, resume_filename, resume_content_type FROM candidate_profiles WHERE user_id = ?",
            (user["id"],),
        ).fetchone()
        if row is None or not row["resume_path"]:
            raise HTTPException(status_code=404, detail="No resume has been uploaded.")
        file_path = Path(row["resume_path"]).resolve()
        if not file_path.is_relative_to(request.app.state.resumes_path.resolve()) or not file_path.is_file():
            raise HTTPException(status_code=404, detail="Resume file is unavailable.")
        return FileResponse(
            file_path,
            media_type=row["resume_content_type"],
            filename=row["resume_filename"],
        )

    @app.get(f"{API_PREFIX}/jobs")
    def list_jobs(
        title: Optional[str] = Query(default=None, max_length=160),
        company: Optional[str] = Query(default=None, max_length=160),
        skill: Optional[str] = Query(default=None, max_length=100),
        location: Optional[str] = Query(default=None, max_length=200),
        employment_type: Optional[Literal["Full-time", "Part-time", "Internship", "Contract"]] = None,
        sort: Literal["recent", "salary_asc", "salary_desc", "deadline"] = "recent",
        connection=Depends(_connection),
    ):
        clauses = ["status = 'PUBLISHED'", "(application_deadline IS NULL OR application_deadline >= ?)"]
        params: list = [date.today().isoformat()]
        for value, column in (
            (title, "title"),
            (company, "company_name"),
            (location, "location"),
        ):
            if value and value.strip():
                clauses.append(f"LOWER({column}) LIKE ?")
                params.append(f"%{value.strip().lower()}%")
        if skill and skill.strip():
            clauses.append("LOWER(required_skills) LIKE ?")
            params.append(f"%{skill.strip().lower()}%")
        if employment_type:
            clauses.append("employment_type = ?")
            params.append(employment_type)
        ordering = {
            "recent": "created_at DESC",
            "salary_asc": "salary_min IS NULL, salary_min ASC, created_at DESC",
            "salary_desc": "salary_max IS NULL, salary_max DESC, created_at DESC",
            "deadline": "application_deadline IS NULL, application_deadline ASC, created_at DESC",
        }[sort]
        rows = connection.execute(
            f"SELECT * FROM jobs WHERE {' AND '.join(clauses)} ORDER BY {ordering}",
            params,
        ).fetchall()
        return {"jobs": [_job_from_row(row) for row in rows]}

    @app.get(f"{API_PREFIX}/jobs/{{job_id}}")
    def get_job(job_id: str, connection=Depends(_connection)):
        row = connection.execute(
            """
            SELECT * FROM jobs
            WHERE id=? AND status='PUBLISHED'
              AND (application_deadline IS NULL OR application_deadline >= ?)
            """,
            (job_id, date.today().isoformat()),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Published job not found.")
        return {"job": _job_from_row(row)}

    @app.get(f"{API_PREFIX}/employer/jobs")
    def list_employer_jobs(
        user=Depends(_require_role("employer")),
        connection=Depends(_connection),
    ):
        rows = connection.execute(
            "SELECT * FROM jobs WHERE employer_id=? AND status != 'DELETED' ORDER BY created_at DESC",
            (user["id"],),
        ).fetchall()
        return {"jobs": [_job_from_row(row) for row in rows]}

    @app.post(f"{API_PREFIX}/employer/jobs", status_code=201)
    def create_job(
        payload: JobInput,
        user=Depends(_require_role("employer")),
        connection=Depends(_connection),
    ):
        company = connection.execute(
            "SELECT company_name FROM company_profiles WHERE user_id=?", (user["id"],)
        ).fetchone()
        if company is None or not company["company_name"].strip():
            raise HTTPException(status_code=409, detail="Complete your company profile before posting a job.")
        now = _now()
        job_id = str(uuid.uuid4())
        connection.execute(
            """
            INSERT INTO jobs(
                id, employer_id, company_name, title, description, required_skills, qualifications,
                experience_requirements, employment_type, salary_min, salary_max, location,
                work_mode, vacancy_count, application_deadline, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)
            """,
            (
                job_id,
                user["id"],
                company["company_name"],
                payload.title,
                payload.description,
                json.dumps(payload.required_skills),
                payload.qualifications,
                payload.experience_requirements,
                payload.employment_type,
                payload.salary_min,
                payload.salary_max,
                payload.location,
                payload.work_mode,
                payload.vacancy_count,
                payload.application_deadline.isoformat() if payload.application_deadline else None,
                now,
                now,
            ),
        )
        row = connection.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone()
        return {"job": _job_from_row(row)}

    @app.put(f"{API_PREFIX}/employer/jobs/{{job_id}}")
    def update_job(
        job_id: str,
        payload: JobInput,
        user=Depends(_require_role("employer")),
        connection=Depends(_connection),
    ):
        existing = connection.execute(
            "SELECT id FROM jobs WHERE id=? AND employer_id=? AND status != 'DELETED'",
            (job_id, user["id"]),
        ).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="Job posting not found.")
        company = connection.execute(
            "SELECT company_name FROM company_profiles WHERE user_id=?", (user["id"],)
        ).fetchone()
        now = _now()
        connection.execute(
            """
            UPDATE jobs SET company_name=?, title=?, description=?, required_skills=?, qualifications=?,
                experience_requirements=?, employment_type=?, salary_min=?, salary_max=?, location=?,
                work_mode=?, vacancy_count=?, application_deadline=?, updated_at=?
            WHERE id=? AND employer_id=?
            """,
            (
                company["company_name"],
                payload.title,
                payload.description,
                json.dumps(payload.required_skills),
                payload.qualifications,
                payload.experience_requirements,
                payload.employment_type,
                payload.salary_min,
                payload.salary_max,
                payload.location,
                payload.work_mode,
                payload.vacancy_count,
                payload.application_deadline.isoformat() if payload.application_deadline else None,
                now,
                job_id,
                user["id"],
            ),
        )
        return {"job": _job_from_row(connection.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone())}

    @app.patch(f"{API_PREFIX}/employer/jobs/{{job_id}}/status")
    def update_job_status(
        job_id: str,
        payload: JobStatusInput,
        user=Depends(_require_role("employer")),
        connection=Depends(_connection),
    ):
        existing = connection.execute(
            "SELECT id FROM jobs WHERE id=? AND employer_id=? AND status != 'DELETED'",
            (job_id, user["id"]),
        ).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="Job posting not found.")
        now = _now()
        connection.execute(
            "UPDATE jobs SET status=?, updated_at=? WHERE id=?",
            (payload.status, now, job_id),
        )
        return {"job": _job_from_row(connection.execute("SELECT * FROM jobs WHERE id=?", (job_id,)).fetchone())}

    @app.delete(f"{API_PREFIX}/employer/jobs/{{job_id}}")
    def delete_job(
        job_id: str,
        user=Depends(_require_role("employer")),
        connection=Depends(_connection),
    ):
        existing = connection.execute(
            "SELECT id FROM jobs WHERE id=? AND employer_id=? AND status != 'DELETED'",
            (job_id, user["id"]),
        ).fetchone()
        if existing is None:
            raise HTTPException(status_code=404, detail="Job posting not found.")
        now = _now()
        connection.execute(
            "UPDATE jobs SET status='DELETED', updated_at=? WHERE id=?", (now, job_id)
        )
        return {"success": True}

    @app.post(f"{API_PREFIX}/jobs/{{job_id}}/applications", status_code=201)
    def apply_for_job(
        job_id: str,
        user=Depends(_require_role("job_seeker")),
        connection=Depends(_connection),
    ):
        job = connection.execute(
            """
            SELECT id, employer_id FROM jobs
            WHERE id=? AND status='PUBLISHED'
              AND (application_deadline IS NULL OR application_deadline >= ?)
            """,
            (job_id, date.today().isoformat()),
        ).fetchone()
        if job is None:
            raise HTTPException(status_code=404, detail="Published job not found or its deadline has passed.")
        if job["employer_id"] == user["id"]:
            raise HTTPException(status_code=403, detail="You cannot apply to your own job posting.")
        now = _now()
        application_id = str(uuid.uuid4())
        try:
            connection.execute(
                """
                INSERT INTO applications(id, job_id, candidate_id, employer_id, applied_at, status, updated_at)
                VALUES (?, ?, ?, ?, ?, 'APPLIED', ?)
                """,
                (application_id, job_id, user["id"], job["employer_id"], now, now),
            )
        except sqlite3.IntegrityError as exc:
            if "applications.job_id, applications.candidate_id" in str(exc):
                raise HTTPException(status_code=409, detail="You have already applied to this job.") from exc
            raise
        return {"application_id": application_id, "status": "APPLIED", "applied_at": now}

    @app.get(f"{API_PREFIX}/candidate/applications")
    def list_candidate_applications(
        user=Depends(_require_role("job_seeker")),
        connection=Depends(_connection),
    ):
        rows = connection.execute(
            """
            SELECT applications.id AS application_id, applications.status AS application_status,
                   applications.applied_at, jobs.id AS job_id, jobs.title, jobs.company_name,
                   jobs.location, jobs.employment_type, jobs.work_mode
            FROM applications JOIN jobs ON jobs.id=applications.job_id
            WHERE applications.candidate_id=?
            ORDER BY applications.applied_at DESC
            """,
            (user["id"],),
        ).fetchall()
        return {"applications": [dict(row) for row in rows]}

    @app.delete(f"{API_PREFIX}/candidate/applications/{{application_id}}")
    def withdraw_application(
        application_id: str,
        user=Depends(_require_role("job_seeker")),
        connection=Depends(_connection),
    ):
        row = connection.execute(
            "SELECT status FROM applications WHERE id=? AND candidate_id=?",
            (application_id, user["id"]),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Application not found.")
        if row["status"] not in {"APPLIED", "SHORTLISTED"}:
            raise HTTPException(status_code=409, detail="This application can no longer be withdrawn.")
        now = _now()
        connection.execute(
            "UPDATE applications SET status='WITHDRAWN', updated_at=? WHERE id=?",
            (now, application_id),
        )
        return {"application_id": application_id, "status": "WITHDRAWN"}

    @app.get(f"{API_PREFIX}/employer/jobs/{{job_id}}/applications")
    def list_job_applications(
        job_id: str,
        user=Depends(_require_role("employer")),
        connection=Depends(_connection),
    ):
        job = connection.execute(
            "SELECT id FROM jobs WHERE id=? AND employer_id=? AND status != 'DELETED'",
            (job_id, user["id"]),
        ).fetchone()
        if job is None:
            raise HTTPException(status_code=404, detail="Job posting not found.")
        rows = connection.execute(
            """
            SELECT applications.id AS application_id, applications.status AS application_status,
                   applications.applied_at, users.id AS candidate_id, users.name, users.email,
                   candidate_profiles.headline, candidate_profiles.summary, candidate_profiles.location,
                   candidate_profiles.skills, candidate_profiles.education, candidate_profiles.experience,
                   candidate_profiles.resume_filename
            FROM applications
            JOIN users ON users.id=applications.candidate_id
            LEFT JOIN candidate_profiles ON candidate_profiles.user_id=users.id
            WHERE applications.job_id=?
            ORDER BY applications.applied_at DESC
            """,
            (job_id,),
        ).fetchall()
        applicants = []
        for row in rows:
            applicant = dict(row)
            for key in ("skills", "education", "experience"):
                applicant[key] = json.loads(applicant[key] or "[]")
            applicants.append(applicant)
        return {"applicants": applicants}

    @app.patch(f"{API_PREFIX}/employer/applications/{{application_id}}/status")
    def update_application_status(
        application_id: str,
        payload: ApplicationStatusInput,
        user=Depends(_require_role("employer")),
        connection=Depends(_connection),
    ):
        row = connection.execute(
            """
            SELECT applications.id, applications.status FROM applications
            JOIN jobs ON jobs.id=applications.job_id
            WHERE applications.id=? AND jobs.employer_id=? AND jobs.status != 'DELETED'
            """,
            (application_id, user["id"]),
        ).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Applicant record not found.")
        if row["status"] == "WITHDRAWN":
            raise HTTPException(status_code=409, detail="A withdrawn application cannot be updated.")
        now = _now()
        connection.execute(
            "UPDATE applications SET status=?, updated_at=? WHERE id=?",
            (payload.status, now, application_id),
        )
        return {"application_id": application_id, "status": payload.status}

    @app.get(f"{API_PREFIX}/employer/applications/{{application_id}}/resume")
    def download_applicant_resume(
        application_id: str,
        request: Request,
        user=Depends(_require_role("employer")),
        connection=Depends(_connection),
    ):
        row = connection.execute(
            """
            SELECT candidate_profiles.resume_path, candidate_profiles.resume_filename,
                   candidate_profiles.resume_content_type
            FROM applications
            JOIN jobs ON jobs.id=applications.job_id
            JOIN candidate_profiles ON candidate_profiles.user_id=applications.candidate_id
            WHERE applications.id=? AND jobs.employer_id=?
            """,
            (application_id, user["id"]),
        ).fetchone()
        if row is None or not row["resume_path"]:
            raise HTTPException(status_code=404, detail="Applicant resume not found.")
        file_path = Path(row["resume_path"]).resolve()
        if not file_path.is_relative_to(request.app.state.resumes_path.resolve()) or not file_path.is_file():
            raise HTTPException(status_code=404, detail="Applicant resume is unavailable.")
        return FileResponse(
            file_path,
            media_type=row["resume_content_type"],
            filename=row["resume_filename"],
        )

    return app


app = create_app()
