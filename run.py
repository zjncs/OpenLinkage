"""Entry point for running the OpenLinkage API locally."""

import uvicorn

from openlinkage.app import app


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
