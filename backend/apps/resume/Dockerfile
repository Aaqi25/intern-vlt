FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p uploads

ENV PYTHONPATH=/app/backend
EXPOSE 5020

CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "5020"]
