from fastapi import FastAPI

from openlinkage.agents import AgentRequest, build_analysis_payload


def create_app() -> FastAPI:
    app = FastAPI(
        title="OpenLinkage",
        description="Prototype health multi-agent service",
        version="0.1.0",
    )

    @app.get("/health", tags=["system"])
    async def health() -> dict[str, str]:
        """Liveness probe for the API."""

        return {"status": "ok"}

    @app.post("/analyze", tags=["agents"])
    async def analyze(request: AgentRequest) -> dict[str, object]:
        """Trigger the demo multi-agent pipeline.

        The endpoint returns structured recommendations from the individual agents. The
        implementation intentionally remains deterministic to make the Quick Start
        experience predictable when developers explore the API locally.
        """

        return build_analysis_payload(request)

    return app


app = create_app()
