from dataclasses import dataclass
from typing import Dict, List

from pydantic import BaseModel, Field, model_validator


class AgentRequest(BaseModel):
    """Request payload shared by all agents."""

    user_id: str = Field(..., min_length=1, description="Unique identifier for the user.")
    symptoms: List[str] = Field(
        default_factory=list,
        description="Current symptoms the user is experiencing.",
    )
    goals: List[str] = Field(
        default_factory=list,
        description="Health or wellness goals to guide recommendations.",
    )
    lifestyle_notes: str | None = Field(
        default=None,
        description="Optional free-form notes about routines or preferences.",
    )

    @model_validator(mode="after")
    def _normalize_and_validate(self) -> "AgentRequest":
        """Trim whitespace, deduplicate, and enforce minimal input."""

        self.symptoms = self._normalize_list(self.symptoms)
        self.goals = self._normalize_list(self.goals)

        if not self.symptoms and not self.goals:
            raise ValueError("At least one symptom or goal must be provided.")

        return self

    @staticmethod
    def _normalize_list(values: List[str]) -> List[str]:
        seen_lower = set()
        normalized: List[str] = []
        for entry in values:
            stripped = entry.strip()
            if not stripped:
                continue
            key = stripped.lower()
            if key in seen_lower:
                continue
            seen_lower.add(key)
            normalized.append(stripped)
        return normalized


@dataclass
class AgentResponse:
    agent: str
    summary: str
    recommendations: List[str]

    def to_dict(self) -> Dict[str, object]:
        return {
            "agent": self.agent,
            "summary": self.summary,
            "recommendations": self.recommendations,
        }


def _format_recommendations(agent: str, entries: List[str]) -> AgentResponse:
    return AgentResponse(
        agent=agent,
        summary=f"{agent} processed the latest request and produced tailored guidance.",
        recommendations=entries,
    )


def run_health_butler_agent(request: AgentRequest) -> AgentResponse:
    lifestyle_tips = [
        "Follow a consistent sleep schedule to support hormone balance.",
        "Limit screen time before bed to improve sleep quality.",
    ]
    if request.lifestyle_notes:
        lifestyle_tips.append(f"Incorporate user note: {request.lifestyle_notes}")
    return _format_recommendations("HealthButlerAgent", lifestyle_tips)


def run_nutrition_agent(request: AgentRequest) -> AgentResponse:
    diet_tips = [
        "Prioritize vegetables and lean protein in daily meals.",
        "Stay hydrated and limit sugary beverages.",
    ]
    if "weight" in " ".join(request.goals).lower():
        diet_tips.append("Adopt a calorie-aware meal plan with balanced macros.")
    if any(goal.lower().startswith("muscle") for goal in request.goals):
        diet_tips.append("Increase protein intake and distribute across meals.")
    return _format_recommendations("NutritionAgent", diet_tips)


def run_exercise_agent(request: AgentRequest) -> AgentResponse:
    exercise_tips = [
        "Include 150 minutes of moderate exercise per week.",
        "Add two strength sessions to support muscle health.",
    ]
    if "fatigue" in " ".join(request.symptoms).lower():
        exercise_tips.append("Start with low-impact routines and gradually increase intensity.")
    if any("evening" in note.lower() for note in [request.lifestyle_notes or ""]):
        exercise_tips.append("Schedule lighter mobility work in the evening to match preferences.")
    return _format_recommendations("ExerciseAgent", exercise_tips)


def run_medication_agent(request: AgentRequest) -> AgentResponse:
    """Provide medication safety reminders and handoff cues.

    The agent intentionally avoids prescribing and instead shares safety guardrails and
    prompts to consult clinicians.
    """

    safety_notes = [
        "Avoid self-prescribing antibiotics; consult a clinician first.",
        "Keep a list of current medications to share with healthcare providers.",
    ]
    if any(symptom.lower() in {"chest pain", "shortness of breath", "severe headache"} for symptom in request.symptoms):
        safety_notes.append("Seek urgent care for chest pain, severe headache, or breathing difficulty.")
    if request.lifestyle_notes:
        safety_notes.append("Discuss lifestyle supplements with a pharmacist to check interactions.")
    return _format_recommendations("MedicationAgent", safety_notes)


def run_agents(request: AgentRequest) -> List[AgentResponse]:
    """Simulate multi-agent collaboration.

    Each agent receives the shared request payload and produces a structured response
    that can be aggregated by downstream services or delivered directly to the user.
    """

    agents = [
        run_health_butler_agent,
        run_nutrition_agent,
        run_exercise_agent,
        run_medication_agent,
    ]
    responses: List[AgentResponse] = []
    for agent in agents:
        responses.append(agent(request))
    return responses


def build_analysis_payload(request: AgentRequest) -> Dict[str, object]:
    """Return a structured payload combining all agent responses with an overview."""

    responses = run_agents(request)
    headline_recommendations = []
    critical_warnings = _detect_critical_warnings(request)
    for response in responses:
        if response.recommendations:
            headline_recommendations.append(
                f"{response.agent}: {response.recommendations[0]}"
            )

    overall_summary = (
        " | ".join(headline_recommendations)
        if headline_recommendations
        else "Agents produced no recommendations."
    )

    return {
        "user_id": request.user_id,
        "overall_summary": overall_summary,
        "warnings": critical_warnings,
        "responses": [response.to_dict() for response in responses],
    }


def _detect_critical_warnings(request: AgentRequest) -> List[str]:
    high_risk_symptoms = {
        "chest pain": "Chest pain requires immediate evaluation. If severe, call emergency services.",
        "shortness of breath": "Shortness of breath can indicate cardiopulmonary issues; seek urgent care if worsening.",
        "confusion": "New confusion warrants medical attention to rule out serious causes.",
    }

    warnings: List[str] = []
    for symptom in request.symptoms:
        lower_symptom = symptom.lower()
        if lower_symptom in high_risk_symptoms:
            warnings.append(high_risk_symptoms[lower_symptom])

    return warnings
