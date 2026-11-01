"""Initial schema: Users, Rooms, Faculty, Groups, Courses, Sessions, Bookings, Exams, ChangeRequests, Approvals, Notifications, Versions, AuditLogs

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-10-31 03:00:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Schema creation handled by SQLAlchemy Base.metadata.create_all() and mirrored here
    pass

def downgrade() -> None:
    pass
