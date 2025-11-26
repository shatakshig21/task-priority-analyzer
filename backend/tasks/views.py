from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer
from .scoring import calculate_priority

@api_view(["POST"])
def analyze_tasks(request):
    serializer = TaskSerializer(data=request.data)
    
    if serializer.is_valid():
        task = serializer.save()
        task.priority_score = calculate_priority(task)
        task.save()

        return Response({
            "priority_score": task.priority_score,
            "task": TaskSerializer(task).data
        })

    return Response(serializer.errors, status=400)


@api_view(["GET"])
def suggest_tasks(request):
    tasks = Task.objects.all().order_by("-priority_score")[:3]
    return Response(TaskSerializer(tasks, many=True).data)
