import pytest
import subprocess
import sys
from pathlib import Path

# Example: test hello_world flow runs without errors
def test_hello_world_runs():
    flow_file = Path("flows/examples/hello_world.py")
    result = subprocess.run([sys.executable, str(flow_file)], capture_output=True, text=True)
    
    # Check exit code is 0 (success)
    assert result.returncode == 0, f"Flow crashed with error:\n{result.stderr}"



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

      - name: Run pytest
        run: pytest -v
