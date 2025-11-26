from datetime import date, timedelta

from django.test import TestCase
from .models import Task
from .scoring import calculate_priority


class PriorityScoringTests(TestCase):
    def test_high_importance_urgent_task_gets_high_score(self):
        task = Task(
            description="Critical bug fix",
            deadline=date.today() + timedelta(days=0),  # today
            difficulty=3,
            importance=3,
            estimated_time=2,
        )
        score = calculate_priority(task)
        # very rough check: urgent + high importance should be high
        self.assertGreaterEqual(score, 2.5)

    def test_low_importance_low_difficulty_far_deadline_gets_low_score(self):
        task = Task(
            description="Optional refactor",
            deadline=date.today() + timedelta(days=10),
            difficulty=1,
            importance=1,
            estimated_time=5,
        )
        score = calculate_priority(task)
        self.assertLess(score, 2.0)

    def test_deadline_closer_increases_score(self):
        # same difficulty/importance, different deadlines
        far_task = Task(
            description="Report (far)",
            deadline=date.today() + timedelta(days=10),
            difficulty=2,
            importance=2,
            estimated_time=3,
        )
        near_task = Task(
            description="Report (soon)",
            deadline=date.today() + timedelta(days=1),
            difficulty=2,
            importance=2,
            estimated_time=3,
        )

        far_score = calculate_priority(far_task)
        near_score = calculate_priority(near_task)

        self.assertGreater(near_score, far_score)
