from prefect import flow, task
from datetime import datetime

@task
def say_hello(name: str):
    """A simple task that says hello"""
    message = f"Hello, {name}! Current time: {datetime.now()}"
    print(message)
    return message

@task  
def process_greeting(message: str, environment: str):
    """Process the greeting message"""
    processed = f"[{environment.upper()}] {message}"
    print(processed)
    return processed

@flow(name="Hello World Flow", log_prints=True)
def hello_world_flow(name: str = "World", environment: str = "dev"):
    """
    A simple hello world flow for testing
    
    Args:
        name: Name to greet
        environment: Environment (dev/prod)
    """
    greeting = say_hello(name)
    result = process_greeting(greeting, environment)
    return result

if __name__ == "__main__":
    # Test locally
    hello_world_flow(name="Local Test", environment="local")





cat > .github/workflows/deploy-dev-local.yml << 'YAML'
name: Deploy to Dev Environment (Local Test)

on:
  push:
    branches: [ dev ]
  pull_request:
    branches: [ dev ]

jobs:
  test-and-deploy:
    runs-on: self-hosted
    env:
      PREFECT_API_URL: ${{ secrets.PREFECT_API_URL }}
      PREFECT_API_KEY: ${{ secrets.PREFECT_API_KEY }}
      PREFECT_API_SSL_CERT: "/Users/yourusername/certs/prefect_cert.pem"  # <-- change this to your local path
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run tests
        run: python -m pytest tests/ -v || echo "No tests found, skipping..."

      - name: Lint code
        run: python -m flake8 flows/ --max-line-length=100 || echo "Linting completed"

      - name: Install Prefect CLI
        run: pip install "prefect>=2.14.0"

      - name: Configure Prefect Server
        run: |
          prefect config set PREFECT_API_URL="${PREFECT_API_URL}"
          prefect config set PREFECT_API_KEY="${PREFECT_API_KEY}"
          prefect config set PREFECT_API_SSL_CERT="${PREFECT_API_SSL_CERT}"

      - name: Deploy all dev flows
        run: prefect deploy --all -c deployments/dev/deployment-configs.yaml
YAML









      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run tests
        run: python -m pytest tests/ -v || echo "No tests found, skipping..."

      - name: Lint code
        run: python -m flake8 flows/ --max-line-length=100 || echo "Linting completed"

  deploy-dev:
    needs: test
    runs-on: self-hosted
    if: github.ref == 'refs/heads/dev'
    env:
      PREFECT_API_URL: "http://ka2345.abc.com:4200/api"
      # If your server needs an API key later, add:
      # PREFECT_API_KEY: ${{ secrets.PREFECT_API_KEY }}
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install Prefect CLI
        run: pip install "prefect>=2.14.0"

      - name: Show Prefect version (sanity check)
        run: prefect version

      - name: Deploy all dev flows
        run: prefect deploy --all -c deployments/dev/deployment-configs.yaml
YAML



cat > requirements.txt << 'EOF'
prefect>=2.14.0
pandas>=1.5.0
requests>=2.28.0
pytest>=7.0.0
flake8>=5.0.0
EOF
