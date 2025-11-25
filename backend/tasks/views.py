from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["POST"])
def analyze_tasks(request):
    # Temporary stub response
    return Response({"message": "analyze endpoint works"})

@api_view(["GET"])
def suggest_tasks(request):
    # Temporary stub response
    return Response({"message": "suggest endpoint works"})
