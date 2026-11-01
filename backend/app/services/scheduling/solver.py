"""
CIT Smart Scheduler - Google OR-Tools CP-SAT University Timetable Solver
"""

import time
from typing import Dict, List, Optional, Any
from ortools.sat.python import cp_model

from backend.app.services.scheduling.models import (
    SessionInput,
    RoomInput,
    FacultyInput,
    StudentGroupInput,
    OptimizationResult,
)
from backend.app.services.scheduling.variables import ScheduleVariablesBuilder
from backend.app.services.scheduling.hard_constraints import apply_hard_constraints
from backend.app.services.scheduling.soft_constraints import SoftConstraintsBuilder
from backend.app.services.scheduling.objective import configure_objective
from backend.app.services.scheduling.result_builder import build_scheduling_results
from backend.app.services.scheduling.validator import validate_timetable


class TimetableSolver:
    def __init__(
        self,
        sessions: List[SessionInput],
        rooms: List[RoomInput],
        faculty: List[FacultyInput],
        groups: List[StudentGroupInput],
        time_limit_seconds: float = 30.0,
        objective_weights: Optional[Dict[str, int]] = None,
    ):
        self.sessions = sessions
        self.rooms = rooms
        self.faculty = faculty
        self.groups = groups
        self.time_limit_seconds = time_limit_seconds
        self.objective_weights = objective_weights or {}

        self.rooms_map = {r.id: r for r in rooms}
        self.faculty_map = {f.id: f for f in faculty}
        self.groups_map = {g.id: g for g in groups}

    def solve(self) -> OptimizationResult:
        """
        Executes the full constraint satisfaction and optimization pipeline.
        """
        start_time = time.time()

        # 1. Initialize CP-SAT model
        model = cp_model.CpModel()

        # 2. Build decision variables with domain pruning
        var_builder = ScheduleVariablesBuilder(
            model=model,
            sessions=self.sessions,
            rooms=self.rooms,
            faculty_map=self.faculty_map,
            groups_map=self.groups_map,
        )
        var_builder.build_variables()

        # 3. Apply Hard Constraints
        hard_enforced = apply_hard_constraints(
            model=model,
            var_builder=var_builder,
            sessions=self.sessions,
            faculty_map=self.faculty_map,
        )

        # 4. Apply Soft Constraints and Penalty Minimization
        soft_builder = SoftConstraintsBuilder(
            model=model,
            var_builder=var_builder,
            sessions=self.sessions,
            rooms_map=self.rooms_map,
            faculty_map=self.faculty_map,
            weights=self.objective_weights,
        )
        penalties = soft_builder.build_soft_penalties()

        # 5. Set Objective
        configure_objective(model, penalties)

        # 6. Configure and Run CP-SAT Solver
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = float(self.time_limit_seconds)
        solver.parameters.num_search_workers = 8
        solver.parameters.log_search_progress = False

        status_code = solver.Solve(model)
        elapsed_seconds = time.time() - start_time

        # 7. Extract Solution & Construct Rich Explanations
        result = build_scheduling_results(
            solver=solver,
            status_code=status_code,
            var_builder=var_builder,
            sessions=self.sessions,
            rooms_map=self.rooms_map,
            faculty_map=self.faculty_map,
            groups_map=self.groups_map,
            soft_builder=soft_builder,
            solver_time=elapsed_seconds,
        )

        # 8. Run Independent Validation
        if result.is_clash_free and result.schedule:
            val_summary = validate_timetable(
                schedule=result.schedule,
                sessions=self.sessions,
                rooms=self.rooms,
                faculty_list=self.faculty,
                groups_list=self.groups,
            )
            result.validation_summary = val_summary
            result.hard_conflicts_count = val_summary["hard_conflicts_total"]

        return result
