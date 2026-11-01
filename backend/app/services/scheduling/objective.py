"""
CIT Smart Scheduler - Optimization Objective Setup
"""

from typing import List, Tuple
from ortools.sat.python import cp_model


def configure_objective(
    model: cp_model.CpModel,
    penalty_terms: List[Tuple[cp_model.IntVar, int, str]],
) -> None:
    """
    Sets the minimization objective in the CP-SAT model
    based on the weighted penalty terms.
    """
    if penalty_terms:
        objective_expr = sum(var * weight for (var, weight, _) in penalty_terms)
        model.Minimize(objective_expr)
    else:
        # If no soft penalties, standard feasibility
        pass
