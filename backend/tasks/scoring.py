from datetime import date

def calculate_priority(task):
    """
    Weighted priority score = 
    (Importance × 0.5) + (Difficulty × 0.3) + (Deadline Closeness × 0.2)
    """

    # Degrees to numeric value:
    imp = task.importance
    diff = task.difficulty

    # Deadline closeness:
    today = date.today()
    days_left = (task.deadline - today).days

    if days_left <= 1:
        deadline_score = 3   # urgent
    elif days_left <= 3:
        deadline_score = 2
    else:
        deadline_score = 1

    score = (imp * 0.5) + (diff * 0.3) + (deadline_score * 0.2)
    return round(score, 2)
