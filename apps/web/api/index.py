import sys
import os

# Add the directory containing the 'app' module to the python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
