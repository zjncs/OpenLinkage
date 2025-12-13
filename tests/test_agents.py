from unittest import SkipTest, TestCase

try:  # Import within try/except to allow skipping when deps are unavailable locally.
    from pydantic import ValidationError
except ModuleNotFoundError as exc:  # pragma: no cover - defensive guard for CI bootstrap
    raise SkipTest("pydantic is not installed in the current environment") from exc

from openlinkage.agents import AgentRequest, build_analysis_payload, run_agents


class AgentTests(TestCase):
    def test_request_requires_symptom_or_goal(self) -> None:
        with self.assertRaises(ValidationError):
            AgentRequest(user_id="abc", symptoms=[], goals=[])

    def test_agents_run_and_return_responses(self) -> None:
        request = AgentRequest(
            user_id="abc",
            symptoms=["fatigue"],
            goals=["weight management"],
            lifestyle_notes="prefers evening workouts",
        )

        responses = run_agents(request)

        self.assertEqual(4, len(responses))
        agent_names = {response.agent for response in responses}
        self.assertSetEqual(
            agent_names,
            {
                "HealthButlerAgent",
                "NutritionAgent",
                "ExerciseAgent",
                "MedicationAgent",
            },
        )

    def test_build_analysis_payload_adds_overview(self) -> None:
        request = AgentRequest(
            user_id="abc",
            symptoms=["fatigue", "Chest Pain", "fatigue"],
            goals=["muscle gain", "Muscle Gain"],
            lifestyle_notes="prefers evening workouts",
        )

        payload = build_analysis_payload(request)

        self.assertEqual("abc", payload["user_id"])
        self.assertIn("overall_summary", payload)
        # Ensure overview stitches the first recommendation from each agent
        self.assertIn("HealthButlerAgent", payload["overall_summary"])
        self.assertEqual(4, len(payload["responses"]))
        # Ensure deduplication preserved case-insensitive logic on inputs
        self.assertEqual(["fatigue", "Chest Pain"], request.symptoms)
        self.assertEqual(["muscle gain"], request.goals)

    def test_warnings_trigger_on_high_risk_symptoms(self) -> None:
        request = AgentRequest(
            user_id="abc",
            symptoms=["shortness of breath", "Confusion"],
            goals=["stability"],
        )

        payload = build_analysis_payload(request)

        self.assertGreaterEqual(len(payload["warnings"]), 2)
