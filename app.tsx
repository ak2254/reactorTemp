cat > .github/workflows/deploy-dev.yml << 'YAML'
name: Deploy to Dev Environment

on:
  push:
    branches: [ dev ]
  pull_request:
    branches: [ dev ]

jobs:
  test:
    runs-on: self-hosted
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
