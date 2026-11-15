from fastapi.testclient import TestClient
import pytest

from main import API_PREFIX, create_app


@pytest.fixture
def client(tmp_path):
    app = create_app(
        database_path=str(tmp_path / "job-portal.sqlite"),
        resumes_path=str(tmp_path / "resumes"),
        allowed_origins=["http://testserver"],
    )
    with TestClient(app) as test_client:
        yield test_client


def register(client, email, role, name="Test User"):
    response = client.post(
        f"{API_PREFIX}/auth/register",
        json={"name": name, "email": email, "password": "secure-password-123", "role": role},
    )
    assert response.status_code == 201, response.text
    data = response.json()
    return data["user"], {"Authorization": f"Bearer {data['access_token']}"}


def job_payload(title="Platform Engineer"):
    return {
        "title": title,
        "description": "Build and maintain reliable services for our product teams.",
        "required_skills": ["Python", "SQL"],
        "qualifications": "Bachelor's degree or equivalent experience",
        "experience_requirements": "1+ years",
        "employment_type": "Full-time",
        "salary_min": 60000,
        "salary_max": 95000,
        "location": "Bengaluru",
        "work_mode": "Hybrid",
        "vacancy_count": 2,
    }


def test_registration_login_and_role_boundaries(client):
    employer, employer_headers = register(client, "employer@example.com", "employer", "Employer")
    candidate, candidate_headers = register(client, "candidate@example.com", "job_seeker", "Candidate")

    assert employer["role"] == "employer"
    assert candidate["role"] == "job_seeker"
    assert client.post(
        f"{API_PREFIX}/auth/register",
        json={
            "name": "Duplicate",
            "email": "EMPLOYER@example.com",
            "password": "secure-password-123",
            "role": "employer",
        },
    ).status_code == 409
    login_response = client.post(
        f"{API_PREFIX}/auth/login",
        json={"email": "candidate@example.com", "password": "secure-password-123"},
    )
    assert login_response.status_code == 200
    assert login_response.json()["user"]["role"] == "job_seeker"
    assert client.get(f"{API_PREFIX}/employer/jobs", headers=candidate_headers).status_code == 403
    assert client.get(f"{API_PREFIX}/candidate/profile", headers=employer_headers).status_code == 403


def test_job_publish_application_and_employer_applicant_management(client):
    _, employer_headers = register(client, "company@example.com", "employer", "Acme Hiring")
    company = client.put(
        f"{API_PREFIX}/employer/company",
        headers=employer_headers,
        json={
            "company_name": "Acme Labs",
            "website": "https://acme.example",
            "description": "Product engineering company",
            "location": "Bengaluru",
        },
    )
    assert company.status_code == 200

    created = client.post(
        f"{API_PREFIX}/employer/jobs", headers=employer_headers, json=job_payload()
    )
    assert created.status_code == 201, created.text
    job_id = created.json()["job"]["id"]
    assert created.json()["job"]["status"] == "DRAFT"
    assert client.get(f"{API_PREFIX}/jobs").json()["jobs"] == []

    published = client.patch(
        f"{API_PREFIX}/employer/jobs/{job_id}/status",
        headers=employer_headers,
        json={"status": "PUBLISHED"},
    )
    assert published.status_code == 200
    assert len(client.get(f"{API_PREFIX}/jobs?skill=python&location=ben").json()["jobs"]) == 1

    _, candidate_headers = register(client, "applicant@example.com", "job_seeker", "Applicant")
    application = client.post(f"{API_PREFIX}/jobs/{job_id}/applications", headers=candidate_headers)
    assert application.status_code == 201
    application_id = application.json()["application_id"]
    duplicate = client.post(f"{API_PREFIX}/jobs/{job_id}/applications", headers=candidate_headers)
    assert duplicate.status_code == 409

    applicants = client.get(
        f"{API_PREFIX}/employer/jobs/{job_id}/applications", headers=employer_headers
    ).json()["applicants"]
    assert len(applicants) == 1
    assert applicants[0]["candidate_id"]
    update = client.patch(
        f"{API_PREFIX}/employer/applications/{application_id}/status",
        headers=employer_headers,
        json={"status": "SHORTLISTED"},
    )
    assert update.status_code == 200
    assert client.get(
        f"{API_PREFIX}/candidate/applications", headers=candidate_headers
    ).json()["applications"][0]["application_status"] == "SHORTLISTED"
    assert client.delete(
        f"{API_PREFIX}/candidate/applications/{application_id}", headers=candidate_headers
    ).status_code == 200


def test_resume_download_is_limited_to_candidate_and_owning_employer(client):
    _, employer_headers = register(client, "owner@example.com", "employer", "Owner")
    _, other_employer_headers = register(client, "other@example.com", "employer", "Other")
    client.put(
        f"{API_PREFIX}/employer/company",
        headers=employer_headers,
        json={"company_name": "Owner Company"},
    )
    job_id = client.post(
        f"{API_PREFIX}/employer/jobs", headers=employer_headers, json=job_payload()
    ).json()["job"]["id"]
    client.patch(
        f"{API_PREFIX}/employer/jobs/{job_id}/status",
        headers=employer_headers,
        json={"status": "PUBLISHED"},
    )
    _, candidate_headers = register(client, "resume-owner@example.com", "job_seeker", "Resume Owner")
    application_id = client.post(
        f"{API_PREFIX}/jobs/{job_id}/applications", headers=candidate_headers
    ).json()["application_id"]
    upload = client.put(
        f"{API_PREFIX}/candidate/profile/resume",
        headers={
            **candidate_headers,
            "X-Resume-Filename": "candidate.pdf",
            "Content-Type": "application/pdf",
        },
        content=b"%PDF-1.7\nresume contents",
    )
    assert upload.status_code == 200
    assert client.get(
        f"{API_PREFIX}/candidate/profile/resume", headers=candidate_headers
    ).content.startswith(b"%PDF-")
    assert client.get(
        f"{API_PREFIX}/employer/applications/{application_id}/resume",
        headers=employer_headers,
    ).status_code == 200
    assert client.get(
        f"{API_PREFIX}/employer/applications/{application_id}/resume",
        headers=other_employer_headers,
    ).status_code == 404
    assert client.put(
        f"{API_PREFIX}/candidate/profile/resume",
        headers={**candidate_headers, "X-Resume-Filename": "bad.exe"},
        content=b"not a resume",
    ).status_code == 415
