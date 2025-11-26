from django.db import models

class Task(models.Model):
    description = models.TextField()
    deadline = models.DateField()
    difficulty = models.IntegerField(help_text="1=low, 2=medium, 3=high")
    importance = models.IntegerField(help_text="1=low, 2=medium, 3=high")
    estimated_time = models.IntegerField(help_text="time in hours")

    priority_score = models.FloatField(default=0)  # will fill after scoring

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.description[:50]
